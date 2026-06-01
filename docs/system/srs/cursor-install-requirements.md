---
doc_tier: srs
fragment: cursor-install-requirements
status: draft
change: moicle-cursor-support
---

# SRS Fragment: Cursor Install Requirements

## Functional Requirements

### FR-1 Native install layout

The MoiCle CLI SHALL install Cursor assets using per-file layout under `.cursor/rules/`, `.cursor/skills/`, `.cursor/commands/`, and `.cursor/architecture/` as specified in `specs/cursor-native-install/spec.md`.

### FR-2 Path transformation

The MoiCle CLI SHALL rewrite Claude-centric paths to Cursor paths in all generated files as specified in `specs/cursor-path-transform/spec.md`.

### FR-3 Scoped installation

The MoiCle CLI SHALL support global and project installation scopes for Cursor as specified in `specs/cursor-scoped-install/spec.md`.

### FR-4 CLI parity

The MoiCle CLI commands `list`, `status`, `enable`, `disable`, and `uninstall` SHALL accept `--target cursor` as specified in `specs/cursor-cli-parity/spec.md`.

### FR-5 User documentation

Published package documentation SHALL list Cursor as a supported editor with install examples as specified in `specs/cursor-docs/spec.md`.

## Non-Functional Requirements

### NFR-1 Idempotency

Re-running install without asset changes SHOULD not rewrite unchanged files (byte-identical skip).

### NFR-2 Windows compatibility

Install on Windows SHALL use file copy, not symlinks.

## Out of Scope

- MCP server configuration for Cursor
- Windsurf editor
- Automatic removal of legacy `AGENTS.md`
