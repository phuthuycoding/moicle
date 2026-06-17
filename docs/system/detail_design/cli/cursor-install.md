---
doc_tier: detail_design
area: cli
feature: cursor-install
status: draft
change: moicle-cursor-support
sync_targets:
  - README.md
  - CLAUDE.md
  - AGENTS.md
---

# Detail Design: Cursor Install Pipeline (MoiCle CLI)

## Overview

MoiCle installs packaged assets from `assets/` into editor-specific directories. This document describes the Cursor install pipeline introduced by change `moicle-cursor-support`.

## Directory Layout After Install

### Global (`~/.cursor/`)

```
~/.cursor/
├── rules/              # 16 agent personas (*.mdc)
├── skills/             # 22 skills (<flat-name>/SKILL.md)
├── commands/           # 4 slash commands (*.md)
└── architecture/       # 11 architecture reference docs (*.md)
```

### Project (`./.cursor/`)

Same subtree relative to `process.cwd()`.

## Module Responsibilities

| Module | Layer | Role |
|--------|-------|------|
| `cursor-transform.ts` | Functional core | `buildCursorRuleMdc`, `sanitizeDescription`, path rewrite |
| `transform.ts` | Functional core | `rewriteCursorPaths`, `extractFrontmatter` |
| `cursor-editor.ts` | Imperative shell | Orchestrates install per scope |
| `install/index.ts` | Imperative shell | Registers `cursor` in `ScopedTarget` |
| `symlink.ts` | Imperative shell | `EDITOR_CONFIGS.cursor`, directory helpers |
| `editor-constants.ts` | Shared | `DISABLED_SUFFIX`, `CURSOR_RULE_EXT`, `DESCRIPTION_MAX_LENGTH` |

## Agent → Rule Transform

Source: `assets/agents/{developers,utilities}/<name>.md`

Output: `.cursor/rules/<name>.mdc`

```yaml
---
description: <sanitized single-line from source frontmatter>
alwaysApply: false
---

<body with rewriteCursorPaths applied>
```

Agents are opt-in rules; they MUST NOT use `alwaysApply: true`.

## Skills and Commands

| Source | Output | Transform |
|--------|--------|-------------|
| `assets/skills/**/SKILL.md` | `.cursor/skills/<flat-name>/SKILL.md` | `listSkillsNested` + `rewriteCursorPaths` |
| `assets/commands/*.md` | `.cursor/commands/<name>.md` | `rewriteCursorPaths` only |
| `assets/architecture/*.md` | `.cursor/architecture/<file>.md` | `rewriteCursorPaths` |

## Path Rewrite Table

| Find | Replace |
|------|---------|
| `~/.claude/` | `~/.cursor/` |
| `.claude/` | `.cursor/` |
| `Claude Code` | `Cursor` |

## Enable / Disable Conventions

| Type | Enabled | Disabled |
|------|---------|----------|
| Rule (agent) | `rules/<name>.mdc` | `rules/<name>.mdc.disabled` |
| Command | `commands/<name>.md` | `commands/<name>.md.disabled` |
| Skill | `skills/<name>/` | `skills/<name>.disabled/` |

Config keys in `moicle-config.json` remain `agents`, `commands`, `skills`; `--target cursor` selects filesystem paths.

## CLI Entry Points

```bash
moicle install --target cursor [--global|--project|--all]
moicle list --target cursor [--global|--project]
moicle status --target cursor [--global|--project]
moicle enable|disable <item> --target cursor [--global|--project]
moicle uninstall --target cursor [--global|--project]
```

## Legacy Behavior

Prior MoiCle versions called `mergeAgentsToFile` → `~/.cursor/AGENTS.md`. That path is **removed**. Users may manually delete legacy `AGENTS.md` after reinstall.

## Non-Goals

- `mcp.json` injection
- Windsurf support
- Symlink install on Windows
