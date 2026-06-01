---
doc_tier: basic_design
fragment: cursor-editor-support
status: draft
change: moicle-cursor-support
---

# Basic Design: Cursor Editor Support (MoiCle)

## Purpose

Extend the MoiCle npm CLI so Cursor IDE users receive the same packaged agents, commands, skills, and architecture references currently available to Claude Code, Codex CLI, and Antigravity users.

## Supported Editors (after change)

| Editor | Install target | Layout |
|--------|----------------|--------|
| Claude Code | `~/.claude/` or `./.claude/` | Native agents/commands/skills |
| Codex CLI | `~/.codex/` | Flat skills folder |
| Antigravity | `~/.gemini/` | Flat skills folder |
| **Cursor** | `~/.cursor/` or `./.cursor/` | **rules + skills + commands** |
| Windsurf | — | Out of scope |

## User Workflow

1. `npm install -g moicle`
2. `moicle install --target cursor --global` (or `--project` for repo-local)
3. Open project in Cursor; use rules, skills, and slash commands from `.cursor/`

## Capability Map

| Capability | User value |
|------------|------------|
| cursor-native-install | Full asset tree in Cursor-native paths |
| cursor-path-transform | Docs reference `~/.cursor/` not `~/.claude/` |
| cursor-scoped-install | Global vs project choice |
| cursor-cli-parity | list/status/enable/disable/uninstall |
| cursor-docs | README and help text updated |

## Documentation Sync Targets

When this change is merged, update:

- `README.md` — Current Support `[x] Cursor`, install examples
- `CLAUDE.md` — `--target cursor` in install section
- `AGENTS.md` — Editor matrix if present
- `src/commands/postinstall.ts` — Post-install hints
