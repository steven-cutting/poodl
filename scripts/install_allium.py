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


def _installed_version() -> str | None:
    """Report the version the installed binary claims, or None if there is none."""
    if not BINARY.is_file():
        return None
    result = subprocess.run([str(BINARY), "--version"], check=False, capture_output=True)
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
    # scheme can reach it. Ruff cannot see that through a variable.
    with urllib.request.urlopen(url) as response, destination.open("wb") as stream:  # noqa: S310
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


def _install() -> int:
    present = _installed_version()
    if present == VERSION:
        print(f"allium {VERSION} is already installed at {BINARY}")
        return 0
    if present is not None:
        print(f"replacing allium {present} with {VERSION}")

    target = _target()
    url = RELEASE.format(version=VERSION, target=target)
    expected = CHECKSUMS[target]

    INSTALL_DIRECTORY.mkdir(parents=True, exist_ok=True)
    print(f"downloading {url}")
    with tempfile.TemporaryDirectory() as directory:
        archive = Path(directory) / "allium.tar.gz"
        actual = _download(url, archive)
        if actual != expected:
            raise RuntimeError(
                f"checksum mismatch for {target}\n  expected {expected}\n  actual   {actual}"
            )
        _extract(archive, BINARY)

    confirmed = _installed_version()
    if confirmed != VERSION:
        raise RuntimeError(f"installed binary reports {confirmed!r}, not {VERSION!r}")
    print(f"installed allium {VERSION} at {BINARY}")
    return 0


def _check() -> int:
    present = _installed_version()
    if present == VERSION:
        return 0
    missing = "allium is not installed" if present is None else f"allium {present} is installed"
    print(f"{missing}; this project pins {VERSION}. Run just install-allium", file=sys.stderr)
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
        # OSError covers urllib's URLError and HTTPError, so a refused
        # connection or a moved release reports itself rather than arriving as
        # a traceback in the middle of `just initialize`.
        print(f"install_allium: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
