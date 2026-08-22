"""Install the pinned Allium command-line tool into `.tools/bin`.

`allium` is a Rust binary rather than a package, so neither lockfile can name
it. The version and the checksum of every artefact are pinned here instead,
beside the URL they pin -- the same shape as `LYCHEE_VERSION` sitting beside its
`rev` in `.pre-commit-config.yaml`.

The install directory is ignored by Git on purpose. `just check` snapshots the
worktree between recipes, so a binary Git can see would abort the run before any
recipe's exit code is read.
"""

from __future__ import annotations

import argparse
import hashlib
import platform
import subprocess
import sys
import tarfile
import tempfile
import urllib.request
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
INSTALL_DIRECTORY = PROJECT_ROOT / ".tools" / "bin"
BINARY = INSTALL_DIRECTORY / "allium"

VERSION = "3.5.3"
RELEASE = (
    "https://github.com/juxt/allium-tools/releases/download/v{version}/allium-{target}.tar.gz"
)

# Bounds each socket operation -- the connect, and every read -- rather than the
# download as a whole. A peer that accepts the connection and then stops sending
# would otherwise hold `just install-allium`, and so a first `just initialize`,
# open for as long as it cared to.
DOWNLOAD_TIMEOUT_SECONDS = 30

# Produced by downloading each artefact and hashing it, because there is no
# upstream manifest to copy. The release's own SHA256SUMS.txt covers only the
# editor extension and the language server, and the Homebrew formula leaves both
# x86_64 entries as empty strings -- x86_64 Linux being exactly what CI runs on.
# The two Homebrew does publish match the values below. Moving VERSION means
# recomputing all four; see docs/how-to/maintain-dependencies.md.
CHECKSUMS = {
    "aarch64-apple-darwin": "3bca3e586cfe6f8f7ac976e426f6f9dffe5ca9cc6d85c3d9561257cf8e5d51e7",
    "x86_64-apple-darwin": "2025287262661a68bb49cb7a7fcc4e66c9490d4b945880477082a44276a0e072",
    "aarch64-unknown-linux-gnu": "ea626c3d9ecf2b64b12b2820cb2fc41444bd30c53e591b990c022872da94d7c6",
    "x86_64-unknown-linux-gnu": "bd14f8b323c4e233c153c8873fcba46f779b4ffbc84b0d22af0a5d34b7b1f5b6",
}

# The release also carries a Windows zip. It is left out because every supported
# path through this repository is POSIX, and a target nobody runs would be a
# checksum nobody re-verifies.
TARGETS = {
    ("Darwin", "arm64"): "aarch64-apple-darwin",
    ("Darwin", "aarch64"): "aarch64-apple-darwin",
    ("Darwin", "x86_64"): "x86_64-apple-darwin",
    ("Linux", "aarch64"): "aarch64-unknown-linux-gnu",
    ("Linux", "arm64"): "aarch64-unknown-linux-gnu",
    ("Linux", "x86_64"): "x86_64-unknown-linux-gnu",
    ("Linux", "amd64"): "x86_64-unknown-linux-gnu",
}


def _target() -> str:
    """Name the release artefact this machine needs."""
    system = platform.system()
    machine = platform.machine()
    target = TARGETS.get((system, machine))
    if target is None:
        supported = ", ".join(sorted({f"{name} {cpu}" for name, cpu in TARGETS}))
        raise RuntimeError(f"no allium build for {system} {machine}; supported: {supported}")
    return target


def _version_of(binary: Path) -> str | None:
    """Report the version the binary at this path claims, or None if it cannot say."""
    if not binary.is_file():
        return None
    try:
        result = subprocess.run([str(binary), "--version"], check=False, capture_output=True)
    except OSError:
        # A file that will not launch -- one that is not executable, or the
        # truncated remains of an interrupted write -- is an installation to
        # replace, not a reason to abort. Saying None lets install mode replace
        # it; a caller that needs to tell an unusable binary from an absent one
        # asks whether the file is there at all.
        return None
    if result.returncode != 0:
        return None
    # `allium 3.5.3 (language versions: 1, 2, 3)`
    fields = result.stdout.decode(errors="backslashreplace").split()
    return fields[1] if len(fields) > 1 and fields[0] == "allium" else None


def _download(url: str, destination: Path) -> str:
    """Fetch url into destination and return its SHA-256."""
    digest = hashlib.sha256()
    # The suppression below is deliberate. S310 fires because the URL reaches
    # urlopen as a variable, and it is built from the literal RELEASE template
    # and a target drawn from the fixed TARGETS table, so no caller-supplied
    # scheme can reach it. Ruff cannot see that through a variable. The timeout
    # beside it turns a stall into the OSError that main already handles.
    with (
        urllib.request.urlopen(url, timeout=DOWNLOAD_TIMEOUT_SECONDS) as response,  # noqa: S310
        destination.open("wb") as stream,
    ):
        while chunk := response.read(65536):
            digest.update(chunk)
            stream.write(chunk)
    return digest.hexdigest()


def _extract(archive: Path, destination: Path) -> None:
    """Write the archive's single `allium` entry to destination, executable."""
    with tarfile.open(archive, "r:gz") as bundle:
        try:
            member = bundle.getmember("allium")
        except KeyError:
            raise RuntimeError("the archive contains no 'allium' entry") from None
        if not member.isfile():
            raise RuntimeError("the archive's 'allium' entry is not a regular file")
        source = bundle.extractfile(member)
        if source is None:
            raise RuntimeError("the archive's 'allium' entry could not be read")
        # Read the member rather than extracting a path, so no entry in the
        # archive can decide where anything lands.
        with source:
            destination.write_bytes(source.read())
    destination.chmod(0o755)


def _stage(url: str, target: str, staged: Path) -> None:
    """Download the release for target into staged, and vet it there: checksum, then version."""
    with tempfile.TemporaryDirectory() as directory:
        archive = Path(directory) / "allium.tar.gz"
        actual = _download(url, archive)
        expected = CHECKSUMS[target]
        if actual != expected:
            raise RuntimeError(
                f"checksum mismatch for {target}\n  expected {expected}\n  actual   {actual}"
            )
        _extract(archive, staged)
    confirmed = _version_of(staged)
    if confirmed != VERSION:
        raise RuntimeError(f"the downloaded binary reports {confirmed!r}, not {VERSION!r}")


def _install() -> int:
    present = _version_of(BINARY)
    if present == VERSION:
        print(f"allium {VERSION} is already installed at {BINARY}")
        return 0
    if present is not None:
        print(f"replacing allium {present} with {VERSION}")
    elif BINARY.is_file():
        print(f"replacing the file at {BINARY}, which does not run as allium")

    target = _target()
    url = RELEASE.format(version=VERSION, target=target)

    INSTALL_DIRECTORY.mkdir(parents=True, exist_ok=True)
    print(f"downloading {url}")
    # Land the download beside the installed copy and put every question to it
    # there, so an interrupted write, a failed chmod or a version that disagrees
    # with the pin leaves the working installation exactly as it was. The last
    # step is the only one that touches it, and Path.replace is atomic within a
    # filesystem -- which both paths share, being in INSTALL_DIRECTORY.
    with tempfile.NamedTemporaryFile(
        dir=INSTALL_DIRECTORY, prefix="allium.", suffix=".partial", delete=False
    ) as handle:
        staged = Path(handle.name)
    try:
        _stage(url, target, staged)
        staged.replace(BINARY)
    finally:
        staged.unlink(missing_ok=True)

    print(f"installed allium {VERSION} at {BINARY}")
    return 0


def _check() -> int:
    present = _version_of(BINARY)
    if present == VERSION:
        return 0
    if present is not None:
        state = f"allium {present} is installed"
    elif BINARY.is_file():
        state = f"the file at {BINARY} does not run as allium"
    else:
        state = "allium is not installed"
    print(f"{state}; this project pins {VERSION}. Run just install-allium", file=sys.stderr)
    return 1


def main() -> int:
    """Install the pinned allium, or report whether the pinned one is present."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="report whether the pinned version is installed, without downloading",
    )
    arguments = parser.parse_args()
    try:
        return _check() if arguments.check else _install()
    except (RuntimeError, OSError, tarfile.TarError) as error:
        # OSError covers urllib's URLError and HTTPError, and the TimeoutError a
        # stalled download raises, so a refused connection, a moved release or a
        # peer that goes quiet reports itself rather than arriving as a
        # traceback in the middle of `just initialize`.
        print(f"install_allium: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
