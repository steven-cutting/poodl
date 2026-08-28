"""Run an Allium subcommand over docs/specs/ and assert that it reported nothing.

Neither subcommand's exit code carries what this project means by clean, so
neither can be the gate on its own.

`allium check` exits 0 on an `info` diagnostic. `allium.field.unused` is one, so
the waiver in `game.allium` was never what kept the recipe green -- the exit
code would have been 0 either way. `allium analyse` fails the other direction:
it keys its exit code on findings alone and ignores diagnostics entirely, so a
module that does not parse passes it, with the `error` sitting in the JSON it
has just printed.

The contract in docs/how-to/work-with-the-specs.md is that every module reports
an empty `diagnostics` array and an empty `findings` array. That is what this
reads, and the only thing it asserts. The tool's own output is still printed
whole: the JSON belongs to allium, and only the verdict is ours.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Any

import install_allium

PROJECT_ROOT = Path(__file__).resolve().parents[1]

# Relative on purpose. allium echoes the path it was given into every block, so
# a relative argument keeps the report readable and identical on every machine.
SPECS = "docs/specs/"

COMMANDS = ("check", "analyse")

# allium's own documented status. 2 means it resolved no `.allium` file at all,
# which is a gate that checked nothing rather than a gate that passed.
NO_INPUTS = 2

REPORTED = ("diagnostics", "findings")


def _relative(name: str) -> str:
    """Name a module the way the report does, whichever way the tool spelled it."""
    path = Path(name)
    if path.is_absolute():
        try:
            return str(path.relative_to(PROJECT_ROOT))
        except ValueError:
            return str(path)
    return str(path)


def _modules() -> set[str]:
    """Every `.allium` file under SPECS, as allium's own recursive walk should find them."""
    return {
        str(path.relative_to(PROJECT_ROOT)) for path in (PROJECT_ROOT / SPECS).rglob("*.allium")
    }


def _blocks(output: str) -> list[dict[str, Any]]:
    """Read allium's back-to-back JSON objects, which are not one document."""
    decoder = json.JSONDecoder()
    blocks: list[dict[str, Any]] = []
    index = 0
    while index < len(output):
        if output[index].isspace():
            index += 1
            continue
        value, index = decoder.raw_decode(output, index)
        blocks.append(value)
    return blocks


def _where(entry: dict[str, Any]) -> str:
    location = entry.get("location") or {}
    return f"{location.get('file', '?')}:{location.get('line', '?')}:{location.get('col', '?')}"


def _diagnostic_line(entry: dict[str, Any]) -> str:
    # `code` is null on a parse failure, the one diagnostic that carries no name
    # -- and so the one that can never be waived, since a waiver names a code.
    code = entry.get("code") or "parse error"
    severity = entry.get("severity", "?")
    return f"  {_where(entry)}: {severity}: {code}: {entry.get('message', '')}"


def _finding_line(entry: dict[str, Any]) -> str:
    entities = ", ".join(entry.get("affected_entities") or []) or "?"
    rule = (entry.get("requires") or {}).get("rule")
    return (
        f"  {entry.get('type', '?')}: {entry.get('summary', '')}"
        f" [{entities}{f', rule {rule}' if rule else ''}]"
    )


RENDER = {"diagnostics": _diagnostic_line, "findings": _finding_line}


def _count(total: int, kind: str) -> str:
    """Say `1 diagnostic` rather than `1 diagnostics`."""
    return f"{total} {kind if total != 1 else kind.removesuffix('s')}"


def _report(blocks: list[dict[str, Any]]) -> dict[str, int]:
    """Print every diagnostic and finding, and count them by kind."""
    counts = dict.fromkeys(REPORTED, 0)
    for block in blocks:
        module = block.get("spec_file", "an unnamed module")
        for kind in REPORTED:
            entries = block.get(kind) or []
            if not entries:
                continue
            counts[kind] += len(entries)
            print(f"\n{module}: {_count(len(entries), kind)}", file=sys.stderr)
            for entry in entries:
                print(RENDER[kind](entry), file=sys.stderr)
    return counts


def _read(command: str, status: int, output: str) -> list[dict[str, Any]]:
    """Turn allium's output into one block per module, or say why it cannot be judged.

    Every failure here is the tool behaving unlike itself rather than a
    specification being wrong, so each is raised rather than counted: a report
    this gate cannot read is not a report it may pass.
    """
    if status == NO_INPUTS:
        raise RuntimeError(f"allium {command} resolved no specification under {SPECS}")
    try:
        blocks = _blocks(output)
    except json.JSONDecodeError as error:
        raise RuntimeError(
            f"allium {command} printed something this gate cannot read: {error}"
        ) from error
    if not blocks:
        raise RuntimeError(f"allium {command} reported on no specification at all")

    # A block missing either array would otherwise read as an empty one, and so
    # as a clean module. Absence is not emptiness: demand the keys.
    for block in blocks:
        if not isinstance(block, dict) or not {"spec_file", *REPORTED} <= set(block):
            raise RuntimeError(f"allium {command} printed a block that is not a report")

    # allium decides for itself which files to walk, so ask what it read rather
    # than assuming it read everything. A module it drops in silence would
    # otherwise pass the gate inside a reassuring count.
    reported = sorted(_relative(block["spec_file"]) for block in blocks)
    present = sorted(_modules())
    if reported != present:
        raise RuntimeError(f"allium {command} reported on {reported}, but {SPECS} holds {present}")
    return blocks


def _verify(command: str) -> int:
    """Run one subcommand and decide whether the specifications are clean."""
    if install_allium.check() != 0:
        return 1

    result = subprocess.run(
        [str(install_allium.BINARY), command, SPECS],
        cwd=PROJECT_ROOT,
        check=False,
        capture_output=True,
    )
    output = result.stdout.decode(errors="backslashreplace")
    errors = result.stderr.decode(errors="backslashreplace")
    print(output, end="")
    if errors:
        print(errors, end="", file=sys.stderr)

    blocks = _read(command, result.returncode, output)
    counts = _report(blocks)
    if sum(counts.values()):
        tally = " and ".join(_count(counts[kind], kind) for kind in REPORTED if counts[kind])
        print(
            f"\nallium {command} reported {tally}; the specifications must report none.\n"
            "Fix each at its root. A finding cannot be waived, and a diagnostic may be\n"
            "waived only where the checker itself is wrong -- the terms are in\n"
            "docs/how-to/work-with-the-specs.md.",
            file=sys.stderr,
        )
        return 1

    # An empty report and a non-zero status disagree. The status is not what this
    # gate trusts, so it cannot pass on one it did not expect either.
    if result.returncode != 0:
        raise RuntimeError(f"allium {command} reported nothing but exited {result.returncode}")

    print(f"allium {command}: {len(blocks)} specifications, no diagnostics and no findings.")
    return 0


def main() -> int:
    """Run the named allium subcommand over the specifications."""
    parser = argparse.ArgumentParser(description="Assert that docs/specs/ reports nothing.")
    parser.add_argument("command", choices=COMMANDS, help="the allium subcommand to run")
    arguments = parser.parse_args()
    try:
        return _verify(arguments.command)
    except (RuntimeError, OSError) as error:
        # OSError is the binary passing its version check and then refusing to
        # run: a race with `just install-allium`, or a filesystem that moved
        # underneath. RuntimeError is a report this gate could not judge.
        print(f"\nrun_allium: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
