# Stack Detection — Canonical Reference

Used by skills that need to pick the right stack-specific architecture doc and conventions.

## Detection Rules

Check files in this order. **First match wins.**

| File / Pattern | Stack | Architecture doc |
|----------------|-------|------------------|
| `go.mod` | Go + Gin | `go-backend.md` |
| `package.json` contains `"@nestjs/core"` | NestJS | `nodejs-nestjs.md` |
| `package.json` + `vite.config.*` (no NestJS) | React + Vite | `react-frontend.md` |
| `package.json` + `remix.config.*` | Remix | `remix-fullstack.md` |
| `pubspec.yaml` | Flutter / Dart | `flutter-mobile.md` |
| `composer.json` | Laravel / PHP | `laravel-backend.md` |
| Workspace root has `pnpm-workspace.yaml` / `turbo.json` / `nx.json` | Monorepo | `monorepo.md` (plus the per-package stack above) |

## Architecture Files Location (priority order)

```
.claude/architecture/{name}.md     # Project-specific — highest priority
~/.claude/architecture/{name}.md   # Global
```

Always load **two files**:
1. `ddd-architecture.md` — cross-stack DDD core rules
2. The stack-specific doc from the table above

## When stack is ambiguous

- Multi-stack monorepo: ask the user which package / app the task targets
- New project (no lock files yet): ask the user
- Multiple lock files (e.g., `go.mod` + `package.json` for a hybrid service): both stacks apply; usually backend = primary
