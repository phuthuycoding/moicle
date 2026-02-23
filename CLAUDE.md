# MoiCle

## Overview

NPM CLI package providing AI agents, commands, skills, and architecture references to accelerate project development with Claude Code.

## Quick Reference

```bash
# Installation
npm install -g moicle
moicle install

# Commands
moicle install --global   # Symlinks to ~/.claude/
moicle install --project  # Copies to ./.claude/
moicle list               # List installed
moicle status             # Show enabled/disabled
moicle enable <item>      # Enable agent/command/skill
moicle disable <item>     # Disable agent/command/skill
moicle uninstall          # Remove
```

## Project Structure

```
moicle/
├── bin/cli.js                      # CLI entry point
├── src/                            # TypeScript source
│   ├── types.ts                    # Type definitions
│   ├── index.ts                    # Exports
│   ├── commands/
│   │   ├── install.ts              # Interactive install
│   │   ├── uninstall.ts            # Remove installations
│   │   ├── list.ts                 # List installed items
│   │   ├── enable.ts               # Enable items (tabs UI)
│   │   ├── disable.ts              # Disable items (tabs UI)
│   │   ├── status.ts               # Show status
│   │   └── postinstall.ts          # npm postinstall message
│   └── utils/
│       ├── symlink.ts              # File operations
│       └── config.ts               # Config management
├── dist/                           # Compiled JS (gitignored)
├── assets/
│   ├── agents/
│   │   ├── developers/             # 5 stack-specific agents
│   │   └── utilities/              # 10 utility agents
│   ├── architecture/               # Architecture references
│   │   ├── clean-architecture.md
│   │   ├── go-backend.md
│   │   ├── laravel-backend.md
│   │   ├── react-frontend.md
│   │   ├── remix-fullstack.md
│   │   ├── flutter-mobile.md
│   │   └── monorepo.md
│   ├── commands/
│   │   ├── bootstrap.md
│   │   └── brainstorm.md
│   └── skills/
│       ├── new-feature/
│       ├── hotfix/
│       ├── pr-review/
│       ├── release/
│       ├── refactor/
│       ├── tdd/
│       ├── onboarding/
│       ├── spike/
│       ├── documentation/
│       ├── api-integration/
│       ├── incident-response/
│       ├── deprecation/
│       ├── fix-pr-comment/
│       └── architect-review/
├── package.json
└── README.md
```

## Architecture References

All agents reference these architecture files before coding:

| File | Use For |
|------|---------|
| `clean-architecture.md` | Core principles, all stacks |
| `go-backend.md` | Go + Gin projects |
| `laravel-backend.md` | Laravel + PHP projects |
| `react-frontend.md` | React + Vite projects |
| `remix-fullstack.md` | Remix projects |
| `flutter-mobile.md` | Flutter projects |
| `monorepo.md` | Monorepo projects |

## Agents

### Developer Agents
| Agent | Tech Stack |
|-------|------------|
| `@flutter-mobile-dev` | Flutter, Dart |
| `@go-backend-dev` | Go, Gin |
| `@laravel-backend-dev` | Laravel, PHP |
| `@react-frontend-dev` | React, TypeScript, Vite |
| `@remix-fullstack-dev` | Remix, React |

### Utility Agents
| Agent | Purpose |
|-------|---------|
| `@api-designer` | REST/GraphQL API design |
| `@clean-architect` | Clean Architecture + MVVM |
| `@code-reviewer` | Code review |
| `@db-designer` | Database schema |
| `@devops` | CI/CD, Docker, K8s |
| `@docs-writer` | Documentation |
| `@perf-optimizer` | Performance |
| `@refactor` | Refactoring |
| `@security-audit` | Security |
| `@test-writer` | Testing |

## Commands

### /bootstrap
Project wizard with 5 stacks - reads architecture files first.

### /brainstorm
6 ideation frameworks: First Principles, SCAMPER, Design Thinking, Working Backwards, 5 Whys, Rapid Fire.

## Skills (15)

| Skill | Trigger |
|-------|---------|
| `new-feature` | "implement feature", "add feature", "build feature" |
| `hotfix` | "fix bug", "hotfix", "urgent fix", "production issue" |
| `pr-review` | "review pr", "check pr", "review code" |
| `release` | "release", "deploy", "ship" |
| `refactor` | "refactor", "clean up", "improve code" |
| `tdd` | "tdd", "test first", "test driven" |
| `onboarding` | "explain codebase", "onboard", "new to project" |
| `spike` | "spike", "research", "prototype", "poc" |
| `documentation` | "document", "generate docs", "write docs" |
| `api-integration` | "integrate api", "add endpoint", "new api" |
| `incident-response` | "incident", "outage", "production down" |
| `deprecation` | "deprecate", "remove feature", "sunset" |
| `go-module` | "generate go module", "scaffold go", "new go module" |
| `fix-pr-comment` | "fix pr comment", "gh-fix-comment", "address pr feedback" |
| `architect-review` | "architect-review", "architecture review", "review architecture" |

## Development

### Tech Stack
- Node.js >= 18, TypeScript, ES Modules
- Dependencies: chalk, commander, inquirer, ora
- DevDependencies: typescript, @types/node, @types/inquirer

### Build & Test
```bash
bun install
bun run build
bun link
moicle install
```

### Key Conventions
- Agents MUST read architecture files before coding
- Config stored at `~/.claude/moicle-config.json`
- Disabled items renamed to `.md.disabled`
- Enable/disable commands have interactive tabs UI (Agents, Commands, Skills)
