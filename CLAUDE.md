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
│       │   ├── new/                # /feature-new
│       │   ├── refactor/           # /feature-refactor
│       │   ├── api/                # /feature-api
│       │   ├── deprecate/          # /feature-deprecate
│       │   └── track/              # /feature-track
│       ├── fix/
│       │   ├── hotfix/             # /fix-hotfix
│       │   ├── root-cause/         # /fix-root-cause
│       │   ├── incident/           # /fix-incident
│       │   └── pr-comment/         # /fix-pr-comment
│       ├── review/
│       │   ├── branch/             # /review-branch
│       │   ├── pr/                 # /review-pr
│       │   ├── architect/          # /review-architect
│       │   └── tdd/                # /review-tdd
│       ├── research/
│       │   ├── web/                # /research-web
│       │   ├── spike/              # /research-spike
│       │   └── onboarding/         # /research-onboarding
│       ├── docs/
│       │   ├── write/              # /docs-write
│       │   └── sync/               # /docs-sync
│       └── marketing/
│           ├── content/            # /marketing-content
│           ├── seo-blog/           # /marketing-seo-blog
│           ├── logo/               # /marketing-logo
│           └── video/              # /marketing-video
├── package.json
└── README.md
```

## Architecture References

All agents reference these architecture files before coding:

| File | Use For |
|------|---------|
| `clean-architecture.md` | Core principles, all stacks |
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

## Skills (22)

Skills are organized into 6 groups in this repo as `skills/<group>/<action>/SKILL.md`. Claude Code only scans skills **one level deep** and uses the **folder name** as the slash-command name — it does not recurse into nested group folders. So the installer **flattens** each nested skill to a single-level `<group>-<action>` entry: `skills/fix/root-cause/` → `~/.claude/skills/fix-root-cause/` → `/fix-root-cause`. A hyphen is used (not a colon) because `:` is an invalid filename character on Windows. Old trigger phrases stay in `description` so Claude still auto-invokes the right skill from natural language.

See `README.md` for the decision matrix when multiple skills overlap.

### `/feature-*` — Build & Change
| Skill | Trigger phrases (auto-invoke) |
|-------|------------------------------|
| `/feature-new` | "implement feature", "add feature", "build feature", "create feature" |
| `/feature-refactor` | "refactor", "clean up", "improve code", "restructure", "migrate to ddd" |
| `/feature-api` | "integrate api", "add endpoint", "new api", "connect api" |
| `/feature-deprecate` | "deprecate", "remove feature", "sunset", "phase out" |
| `/feature-track` | "bắt đầu loop", "làm track này", "tracked loop", "checklist driven", "checkout branch and start track" |

### `/fix-*` — Bugs & Incidents
| Skill | Trigger phrases (auto-invoke) |
|-------|------------------------------|
| `/fix-hotfix` | "fix bug", "hotfix", "urgent fix", "production issue" |
| `/fix-root-cause` | "deep debug", "trace bug", "find root cause", "hard bug" |
| `/fix-incident` | "incident", "outage", "production down", "service down" |
| `/fix-pr-comment` | "fix pr comment", "fix review comment", "address pr feedback" |

### `/review-*` — Review & Quality
| Skill | Trigger phrases (auto-invoke) |
|-------|------------------------------|
| `/review-branch` | "review changes", "review branch", "check branch", "review before pr" |
| `/review-pr` | "review pr", "check pr", "review code", "pr review" |
| `/review-architect` | "architect-review", "architecture review", "review ddd" |
| `/review-tdd` | "tdd", "test first", "test driven", "red green refactor" |

### `/research-*` — Explore & Learn
| Skill | Trigger phrases (auto-invoke) |
|-------|------------------------------|
| `/research-web` | "research", "tìm giải pháp", "find best practice", "so sánh giải pháp" |
| `/research-spike` | "spike", "prototype", "poc", "explore" |
| `/research-onboarding` | "explain codebase", "onboard", "new to project", "understand project" |

### `/docs-*` — Project Documentation
| Skill | Trigger phrases (auto-invoke) |
|-------|------------------------------|
| `/docs-write` | "document", "generate docs", "write docs" |
| `/docs-sync` | "sync docs", "sync documentation", "doc sync" |

### `/marketing-*` — Brand & Content (wrapped by `/marketing` command)
| Skill | Trigger phrases (auto-invoke) |
|-------|------------------------------|
| `/marketing-content` | "write content", "content strategy", "content plan", "newsletter" |
| `/marketing-seo-blog` | "write seo blog", "seo blog", "evergreen post", "compare post", "blog for AI" |
| `/marketing-logo` | "design logo", "create logo", "brand identity" |
| `/marketing-video` | "create video", "video content", "video script" |

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
