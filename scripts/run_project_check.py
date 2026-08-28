"""Run every gate and prove the run did not touch the worktree.

A check that rewrites files hides drift instead of reporting it, so the runner
snapshots the repository before the first recipe and compares after each one.
"""

from __future__ import annotations

import hashlib
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
RECIPES = (
    "lock-check",
    "lint",
    "frontend-static",
    "frontend-coverage",
    "frontend-build",
    "storybook-build",
    "storybook-test",
    "check-docs",
    "check-agents",
    "check-specs",
    "analyse-specs",
)


def _git(*arguments: str, check: bool = True) -> subprocess.CompletedProcess[bytes]:
    environment = {**os.environ, "GIT_OPTIONAL_LOCKS": "0"}
    result = subprocess.run(
        ["git", *arguments],
        cwd=PROJECT_ROOT,
        env=environment,
        check=False,
        capture_output=True,
    )
    if check and result.returncode != 0:
        detail = result.stderr.decode(errors="backslashreplace").strip()
        raise RuntimeError(detail or f"git {' '.join(arguments)} failed")
    return result


def _inside_worktree() -> bool:
    result = _git("rev-parse", "--is-inside-work-tree", check=False)
    return result.returncode == 0 and result.stdout.strip() == b"true"


def _tracked_paths() -> tuple[bytes, ...]:
    output = _git("ls-files", "-z", "--cached", "--others", "--exclude-standard").stdout
    return tuple(item for item in output.split(b"\0") if item)


def _digest(relative: bytes) -> str:
    path = PROJECT_ROOT / os.fsdecode(relative)
    try:
        metadata = path.lstat()
    except OSError:
        return "missing"
    if path.is_symlink():
        return "symlink:" + hashlib.sha256(os.fsencode(path.readlink())).hexdigest()
    if not path.is_file():
        return "special"
    with path.open("rb") as stream:
        return f"{metadata.st_mode:o}:{hashlib.file_digest(stream, 'sha256').hexdigest()}"


def _snapshot() -> dict[str, str]:
    status = _git("status", "--porcelain=v1", "-z", "--untracked-files=all").stdout
    snapshot = {"::status": status.decode(errors="backslashreplace")}
    for relative in _tracked_paths():
        snapshot[os.fsdecode(relative)] = _digest(relative)
    return snapshot


def _report(before: dict[str, str], after: dict[str, str], context: str) -> None:
    print(f"\n{context} changed the worktree; checks must be read-only.", file=sys.stderr)
    for key in sorted(set(before) | set(after)):
        if before.get(key) != after.get(key):
            label = "status" if key == "::status" else key
            print(f"  changed: {label}", file=sys.stderr)


def _run(recipe: str, *arguments: str) -> int:
    print(f"\n==> just {recipe}", flush=True)
    return subprocess.run(["just", recipe, *arguments], cwd=PROJECT_ROOT, check=False).returncode


def _run_all() -> int:
    if not _inside_worktree():
        print("just check needs a Git worktree; run just initialize", file=sys.stderr)
        return 2

    baseline = _snapshot()
    with tempfile.NamedTemporaryFile(
        mode="w", encoding="utf-8", suffix=".json", delete=False
    ) as stream:
        json.dump(baseline, stream, sort_keys=True)
        baseline_path = Path(stream.name)

    try:
        for recipe in (*RECIPES, "check-clean"):
            arguments = (str(baseline_path),) if recipe == "check-clean" else ()
            returncode = _run(recipe, *arguments)
            current = _snapshot()
            if current != baseline:
                _report(baseline, current, f"just {recipe}")
                return 1
            if returncode != 0:
                return returncode if returncode > 0 else 1
    finally:
        baseline_path.unlink(missing_ok=True)

    print("\nAll checks passed and the worktree is unchanged.")
    return 0


def _check_clean(baseline_path: Path | None) -> int:
    if not _inside_worktree():
        print("check-clean needs a Git worktree; run just initialize", file=sys.stderr)
        return 2

    current = _snapshot()
    if baseline_path is not None:
        baseline: dict[str, str] = json.loads(baseline_path.read_text(encoding="utf-8"))
        if current != baseline:
            _report(baseline, current, "just check-clean")
            return 1
        print("The worktree matches the check baseline.")
        return 0

    if _git("rev-parse", "--verify", "--quiet", "HEAD", check=False).returncode != 0:
        print("No commit exists yet; accepting the current state.")
        return 0
    if current["::status"]:
        print(current["::status"], file=sys.stderr)
        print("The Git worktree is not clean.", file=sys.stderr)
        return 1
    print("The Git worktree is clean.")
    return 0


def main() -> int:
    """Dispatch the aggregate runner or the standalone cleanliness assertion."""
    arguments = sys.argv[1:]
    if arguments[:1] == ["run"]:
        return _run_all()
    if arguments[:1] == ["clean"]:
        given = arguments[1] if len(arguments) > 1 and arguments[1] else None
        return _check_clean(Path(given) if given else None)
    print("usage: run_project_check.py {run|clean [baseline]}", file=sys.stderr)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
