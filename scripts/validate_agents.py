"""Validate the agent guidance, its provider adapters, and the skill bridges.

`AGENTS.md` is the single source of truth. Everything under `.claude/` and
`.codex/` exists only so those tools can discover it, so this check fails when
a bridge grows content of its own or drifts from the canonical skill.
"""

from __future__ import annotations

import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CANONICAL_SKILLS = ROOT / ".agents/skills"
PROVIDERS = ("claude", "codex")
BRIDGE_WORD_LIMIT = 40
MANAGED_DIRECTORIES = (Path(".agents"), *(Path(f".{provider}") for provider in PROVIDERS))

# Committed provider configuration that is neither a skill nor an adapter.
# Tolerated rather than expected: the inventory permits these without demanding
# them, so removing the allium plugin does not break the gate.
TOLERATED = {Path(".claude/settings.json")}

ADAPTERS = {
    "CLAUDE.md": "@AGENTS.md\n",
    ".github/copilot-instructions.md": (
        "# GitHub Copilot repository adapter\n\n"
        "Read and follow `../AGENTS.md` as the canonical repository instruction file "
        "before proposing or editing code. This adapter adds no permissions and must "
        "not duplicate or weaken the canonical policy.\n"
    ),
}
# Phrases AGENTS.md must carry. Each names an invariant that is expensive to
# rediscover: how untrusted input is treated, the one command that proves a
# change, where authority stops, where scratch work goes, what decides
# behaviour, and which reactivity model the components use.
REQUIRED_GUIDANCE = (
    "untrusted",
    "just check",
    "explicit authorization",
    "ai_tmp/",
    "docs/specs/",
    "runes",
)
UNRESOLVED = re.compile(r"{" + r"{|{" + r"%|{" + r"#")


def _skill_names() -> tuple[str, ...]:
    return tuple(sorted(path.name for path in CANONICAL_SKILLS.iterdir() if path.is_dir()))


def _expected_files(names: tuple[str, ...]) -> set[Path]:
    expected = {Path("AGENTS.md"), Path("scripts/validate_agents.py")}
    expected.update(Path(relative) for relative in ADAPTERS)
    for name in names:
        expected.add(Path(".agents/skills") / name / "SKILL.md")
        for provider in PROVIDERS:
            expected.add(Path(f".{provider}/skills") / name / "SKILL.md")
    return expected


def _versioned_paths() -> set[Path]:
    """List every path Git would keep, ignored files excluded.

    Assistants write their own state into these directories -- Claude Code
    creates `.claude/settings.local.json` on the first permission approval --
    and a filesystem walk would report that state as an unexpected managed
    file. Deferring to Git means a `.gitignore` entry is enough to keep local
    tool state out of the inventory, while anything a reviewer would actually
    receive still counts.

    This project's own `.gitignore` is the only rule set consulted, rather than
    `--exclude-standard`. That option also honours `.git/info/exclude` and the
    user's global `core.excludesFile`, and putting `.claude/` in a personal
    global ignore file is a common habit -- it would hide the skills from this
    inventory and report every one of them as missing.
    """
    result = subprocess.run(
        ["git", "ls-files", "-z", "--cached", "--others", "--exclude-from=.gitignore"],
        cwd=ROOT,
        check=False,
        capture_output=True,
    )
    if result.returncode != 0:
        detail = result.stderr.decode(errors="backslashreplace").strip()
        raise RuntimeError(detail or "git ls-files failed; run just initialize")
    return {Path(os.fsdecode(item)) for item in result.stdout.split(b"\0") if item}


def _managed_files() -> set[Path]:
    named = (*ADAPTERS, "AGENTS.md", "scripts/validate_agents.py")
    top_level = {Path(relative) for relative in named}
    return {
        relative
        for relative in _versioned_paths()
        if relative in top_level
        or any(directory in relative.parents for directory in MANAGED_DIRECTORIES)
    }


def _parse_frontmatter(path: Path) -> tuple[dict[str, str], str]:
    lines = path.read_text(encoding="utf-8").splitlines()
    if not lines or lines[0] != "---":
        message = "missing opening frontmatter"
        raise ValueError(message)
    try:
        end = lines.index("---", 1)
    except ValueError as error:
        message = "missing closing frontmatter"
        raise ValueError(message) from error
    fields: dict[str, str] = {}
    for line in lines[1:end]:
        if ":" not in line:
            message = f"invalid frontmatter line: {line}"
            raise ValueError(message)
        key, value = line.split(":", 1)
        fields[key.strip()] = value.strip()
    return fields, "\n".join(lines[end + 1 :])


def _check_inventory(names: tuple[str, ...], errors: list[str]) -> None:
    expected = _expected_files(names)
    actual = _managed_files()
    errors.extend(f"missing managed file: {relative}" for relative in sorted(expected - actual))
    errors.extend(
        f"unexpected managed file: {relative}"
        for relative in sorted(actual - expected - TOLERATED)
    )
    for relative in sorted(expected & actual):
        path = ROOT / relative
        if path.is_symlink() or not path.is_file():
            errors.append(f"managed path must be a regular file: {relative}")
        elif UNRESOLVED.search(path.read_text(encoding="utf-8")):
            errors.append(f"managed file has unresolved template syntax: {relative}")


def _check_canonical(errors: list[str]) -> None:
    path = ROOT / "AGENTS.md"
    if not path.is_file():
        return
    text = path.read_text(encoding="utf-8")
    lowered = text.lower()
    errors.extend(
        f"AGENTS.md is missing required guidance: {phrase!r}"
        for phrase in REQUIRED_GUIDANCE
        if phrase.lower() not in lowered
    )
    if len(text.split()) < 300:
        errors.append("AGENTS.md is too short to carry the working agreement")
    if (ROOT / "CODEX.md").exists():
        errors.append("CODEX.md is forbidden; Codex reads AGENTS.md directly")


def _check_adapters(errors: list[str]) -> None:
    for relative, expected in ADAPTERS.items():
        path = ROOT / relative
        if path.is_file() and path.read_text(encoding="utf-8").strip() != expected.strip():
            errors.append(f"{relative} must remain the exact thin adapter")


def _check_skills(names: tuple[str, ...], errors: list[str]) -> None:
    if not names:
        errors.append(".agents/skills must define at least one skill")
        return

    for name in names:
        canonical = CANONICAL_SKILLS / name / "SKILL.md"
        if not canonical.is_file():
            continue
        try:
            fields, body = _parse_frontmatter(canonical)
        except ValueError as error:
            errors.append(f".agents/skills/{name}/SKILL.md: {error}")
            continue

        if set(fields) != {"name", "description"}:
            errors.append(
                f".agents/skills/{name}/SKILL.md: frontmatter must be name and description"
            )
        if fields.get("name") != name:
            errors.append(f".agents/skills/{name}/SKILL.md: name must match the directory")
        if len(fields.get("description", "").split()) < 8:
            errors.append(f".agents/skills/{name}/SKILL.md: description must state a real trigger")
        if "just " not in body or "AGENTS.md" not in body:
            errors.append(
                f".agents/skills/{name}/SKILL.md: a skill must cite AGENTS.md and use just recipes"
            )

        for provider in PROVIDERS:
            bridge = ROOT / f".{provider}/skills" / name / "SKILL.md"
            if not bridge.is_file():
                continue
            try:
                bridge_fields, bridge_body = _parse_frontmatter(bridge)
            except ValueError as error:
                errors.append(f".{provider}/skills/{name}/SKILL.md: {error}")
                continue
            if bridge_fields != fields:
                errors.append(
                    f".{provider}/skills/{name}/SKILL.md: frontmatter must match the canonical skill"
                )
            pointer = f"`../../../.agents/skills/{name}/SKILL.md`"
            if bridge_body.count(pointer) != 1 or len(bridge_body.split()) > BRIDGE_WORD_LIMIT:
                errors.append(
                    f".{provider}/skills/{name}/SKILL.md: must stay a thin pointer to the canonical skill"
                )


def main() -> int:
    """Report every inconsistency in the agent surface at once."""
    if not CANONICAL_SKILLS.is_dir():
        print("agent validation: .agents/skills is missing", file=sys.stderr)
        return 1

    names = _skill_names()
    errors: list[str] = []
    try:
        _check_inventory(names, errors)
    except RuntimeError as failure:
        print(f"agent validation: {failure}", file=sys.stderr)
        return 1
    _check_canonical(errors)
    _check_adapters(errors)
    _check_skills(names, errors)

    if errors:
        for error in sorted(set(errors)):
            print(f"agent validation: {error}", file=sys.stderr)
        return 1
    print(f"Validated AGENTS.md, {len(ADAPTERS)} adapters, and {len(names)} skills.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
