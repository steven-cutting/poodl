"""Run ripsecrets without copying any matched credential into the log."""

from __future__ import annotations

import shutil
import subprocess
import sys


def main() -> int:
    """Preserve the scanner result while suppressing its output."""
    executable = shutil.which("ripsecrets")
    if executable is None:
        raise SystemExit("ripsecrets is unavailable; run just install-hooks")
    result = subprocess.run(
        [executable, *sys.argv[1:]],
        check=False,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    if result.returncode == 1:
        print("ripsecrets found credential material; the matched values are suppressed")
    elif result.returncode != 0:
        print(f"ripsecrets failed with status {result.returncode}; output suppressed")
    return result.returncode


if __name__ == "__main__":
    raise SystemExit(main())
