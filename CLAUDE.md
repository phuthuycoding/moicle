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
moicle install --target cursor --global   # Cursor rules, commands, skills → ~/.cursor/
moicle install --target cursor --project  # Cursor assets → ./.cursor/
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
│   │   ├── brainstorm.md
│   │   └── marketing.md
│   └── skills/                     # nested in repo, flattened to /group-action on install
│       ├── feature/
│       │   ├── build/              # /feature-build (modes: NEW/REFACTOR/API/DEPRECATE)
│       │   └── track/              # /feature-track
│       ├── fix/
│       │   ├── bug/                # /fix-bug (modes: QUICK/DEEP)
│       │   └── incident/           # /fix-incident
│       ├── review/
│       │   └── code/               # /review-code (modes: SELF/PR/ARCHITECT/TDD/ADDRESS)
│       ├── research/
│       │   └── explore/            # /research-explore (modes: WEB/SPIKE/ONBOARDING)
│       ├── docs/
│       │   └── sync/               # /docs-sync (modes: SINGLE/FULL)
│       ├── marketing/
│       │   ├── content/            # /marketing-content (modes: STRATEGY/POST)
│       │   └── brand/              # /marketing-brand (modes: LOGO/VIDEO)
│       ├── challenge/              # /challenge (standalone, no group, no modes)
│       └── cleanup/                # /cleanup (standalone, modes: DEAD-CODE/DUPLICATE)
├── package.json
└── README.md
```

## Architecture References

Agents follow the **project's own pattern first** (see `_shared/read-project-first.md`); these docs are references/fallbacks — used when the project already uses the pattern, is greenfield, or you just need stack commands:

| File | Use For |
|------|---------|
| `_shared/read-project-first.md` | **Match the project, not the textbook** — read first (all skills) |
| `_shared/engineering-principles.md` | **Senior bar for all agents** — simple first / no overengineering, business-first thinking, challenge fit/risk/worth, no garbage code, no valueless comments |
| `clean-architecture.md` | Core principles, all stacks |
| `ddd-architecture.md` | DDD layers (domain / ports / usecases) — only when the project uses DDD |
| `hexagonal-architecture.md` | Ports & Adapters boundary pattern |
| `go-backend.md` | Go + Gin projects |
| `laravel-backend.md` | Laravel + PHP projects |
| `nodejs-nestjs.md` | Node.js + NestJS + Prisma projects |
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
| `@nodejs-backend-dev` | Node.js, NestJS, TypeScript, Prisma |
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

### /marketing
Comprehensive marketing plan wizard - combines logo design, video content, and content writing skills into a unified go-to-market strategy.

## Skills (10)

Skills are organized into 6 groups in this repo as `skills/<group>/<action>/SKILL.md`. Claude Code only scans skills **one level deep** and uses the **folder name** as the slash-command name — it does not recurse into nested group folders. So the installer **flattens** each nested skill to a single-level `<group>-<action>` entry: `skills/fix/bug/` → `~/.claude/skills/fix-bug/` → `/fix-bug`. A hyphen is used (not a colon) because `:` is an invalid filename character on Windows. A single-level folder with a `SKILL.md` directly inside (e.g. `skills/challenge/`) is kept as-is → `/challenge`.

Each skill consolidates several related workflows into **modes** selected at the top of the SKILL.md. All old trigger phrases stay in `description` so Claude still auto-invokes the right skill (and the right mode) from natural language — e.g. "hotfix" → `/fix-bug` QUICK, "deep debug" → `/fix-bug` DEEP.

See `README.md` for the decision matrix when multiple skills/modes overlap.

### `/feature-*` — Build & Change
| Skill | Modes | Trigger phrases (auto-invoke) |
|-------|-------|------------------------------|
| `/feature-build` | NEW / REFACTOR / API / DEPRECATE | "implement feature", "add feature", "refactor", "migrate to ddd", "integrate api", "add endpoint", "deprecate", "sunset" |
| `/feature-track` | — | "bắt đầu loop", "làm track này", "tracked loop", "checklist driven", "checkout branch and start track" |

### `/fix-*` — Bugs & Incidents
| Skill | Modes | Trigger phrases (auto-invoke) |
|-------|-------|------------------------------|
| `/fix-bug` | QUICK / DEEP | "fix bug", "hotfix", "urgent fix", "production issue", "deep debug", "trace bug", "find root cause", "hard bug" |
| `/fix-incident` | — | "incident", "outage", "production down", "service down" |

### `/review-*` — Review & Quality
| Skill | Modes | Trigger phrases (auto-invoke) |
|-------|-------|------------------------------|
| `/review-code` | SELF / PR / ARCHITECT / TDD / ADDRESS | "review changes", "review branch", "review pr", "check pr", "architecture review", "review ddd", "tdd", "test first", "fix pr comment", "address pr feedback" |

### `/research-*` — Explore & Learn
| Skill | Modes | Trigger phrases (auto-invoke) |
|-------|-------|------------------------------|
| `/research-explore` | WEB / SPIKE / ONBOARDING | "research", "tìm giải pháp", "find best practice", "spike", "prototype", "poc", "explain codebase", "onboard", "understand project" |

### `/docs-*` — Project Documentation
| Skill | Modes | Trigger phrases (auto-invoke) |
|-------|-------|------------------------------|
| `/docs-sync` | SINGLE / FULL | "document", "generate docs", "write docs", "sync docs", "sync documentation", "doc sync" |

### `/marketing-*` — Brand & Content (wrapped by `/marketing` command)
| Skill | Modes | Trigger phrases (auto-invoke) |
|-------|-------|------------------------------|
| `/marketing-content` | STRATEGY / POST | "write content", "content strategy", "content plan", "newsletter", "write seo blog", "evergreen post", "compare post", "blog for AI" |
| `/marketing-brand` | LOGO / VIDEO | "design logo", "create logo", "brand identity", "create video", "video content", "video script" |

### `/challenge` — Self-Critique (standalone, no group)
| Skill | Modes | Trigger phrases (auto-invoke) |
|-------|-------|------------------------------|
| `/challenge` | — | "challenge", "rethink", "check kĩ hơn", "soi lại", "phản biện", "tối ưu chưa", "is this optimal", "double check this", "any duplication", "có lặp code không", "did I overengineer" |

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
