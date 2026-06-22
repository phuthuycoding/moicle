# MoiCle

[![npm version](https://img.shields.io/npm/v/moicle.svg)](https://www.npmjs.com/package/moicle)
[![npm downloads](https://img.shields.io/npm/dm/moicle.svg)](https://www.npmjs.com/package/moicle)
[![license](https://img.shields.io/npm/l/moicle.svg)](https://github.com/phuthuycoding/moicle/blob/master/LICENSE)
[![node](https://img.shields.io/node/v/moicle.svg)](https://nodejs.org)
[![GitHub stars](https://img.shields.io/github/stars/phuthuycoding/moicle?style=social)](https://github.com/phuthuycoding/moicle)

> Reusable AI agents, commands, skills, and architecture references for Claude Code

**If you find this project useful, please consider giving it a ⭐ on [GitHub](https://github.com/phuthuycoding/moicle)!**

A toolkit to bootstrap and accelerate project development with Claude Code through specialized agents, automation commands, workflow skills, and unified architecture references.

## Features

- **16 AI Agents** - 6 developer agents + 10 utility agents
- **4 Commands** - Wizards for bootstrap, brainstorm, documentation, and marketing
- **9 Skills** - Mode-based, auto-triggered workflows for the full SDLC (feature, bug, review, research, docs, marketing)
- **9 Architecture References** - DDD + Hexagonal + stack-specific patterns


## Current Support

- [x] Claude
- [x] Codex CLI
- [x] Antigravity
- [x] Cursor
- [ ] Windsurf

Older MoiCle versions merged agents into `~/.cursor/AGENTS.md`. Re-run `moicle install --target cursor` for native `.cursor/rules/*.mdc` layout; you may delete legacy `AGENTS.md` manually.

## Installation

```bash
npm install -g moicle
```

## Quick Start

```bash
# Install agents, commands, skills, architecture
moicle install

# Install for Codex CLI
moicle install --target codex --global

# Install for Antigravity
moicle install --target antigravity --global

# Install for Cursor (rules, commands, skills, architecture)
moicle install --target cursor --global
moicle install --target cursor --project

# Choose:
# 1. Pick Claude Code, Codex CLI, or Antigravity
# 2. Pick global or project scope
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `moicle install` | Interactive installation menu |
| `moicle install --global` | Install to ~/.claude/ (symlinks) |
| `moicle install --project` | Install to ./.claude/ (copies) |
| `moicle install --target codex --global` | Install Codex skills + architecture to ~/.codex/ |
| `moicle install --target codex --project` | Install Codex skills + architecture to ./.codex/ |
| `moicle install --target cursor --global` | Install Cursor rules, commands, skills to ~/.cursor/ |
| `moicle install --target cursor --project` | Install Cursor assets to ./.cursor/ |
| `moicle list --target cursor` | List Cursor rules, commands, and skills |
| `moicle status` | Show enabled/disabled status |
| `moicle enable <item>` | Enable an agent/command/skill |
| `moicle disable <item>` | Disable an agent/command/skill |
| `moicle uninstall` | Remove installations |

## What's Included

### Architecture References (9)

| File | Description |
|------|-------------|
| `clean-architecture.md` | Core Clean Architecture principles |
| `hexagonal-architecture.md` | Ports & Adapters boundary pattern |
| `go-backend.md` | Go + Gin project structure |
| `laravel-backend.md` | Laravel + PHP project structure |
| `nodejs-nestjs.md` | Node.js + NestJS + Prisma (DDD + Hexagonal) |
| `react-frontend.md` | React + Vite project structure |
| `remix-fullstack.md` | Remix fullstack structure |
| `flutter-mobile.md` | Flutter mobile structure |
| `monorepo.md` | Monorepo structure |

### Developer Agents (6)

| Agent | Description |
|-------|-------------|
| `@flutter-mobile-dev` | Flutter/Dart mobile & desktop development |
| `@go-backend-dev` | Go + Gin backend API development |
| `@laravel-backend-dev` | Laravel + PHP backend API development |
| `@nodejs-backend-dev` | Node.js + NestJS + Prisma backend development |
| `@react-frontend-dev` | React + TypeScript frontend development |
| `@remix-fullstack-dev` | Remix full-stack development |

### Utility Agents (10)

| Agent | Description |
|-------|-------------|
| `@api-designer` | RESTful & GraphQL API design |
| `@clean-architect` | Clean Architecture + MVVM patterns |
| `@code-reviewer` | Code review for quality, security, performance |
| `@db-designer` | Database schema design |
| `@devops` | CI/CD, Docker, Kubernetes, Infrastructure |
| `@docs-writer` | Technical documentation |
| `@perf-optimizer` | Performance analysis & optimization |
| `@refactor` | Code refactoring & cleanup |
| `@security-audit` | Security vulnerability analysis |
| `@test-writer` | Unit & integration test writing |

### Commands (3)

| Command | Description |
|---------|-------------|
| `/bootstrap` | Wizard to create new project with 5 stack options |
| `/brainstorm` | Brainstorm ideas with 6 frameworks |
| `/doc` | Scan project and generate documentation |

### Skills (9)

Skills are grouped by a `<group>-` prefix. Type `/<group>-` then `Tab` in Claude Code to see all skills in a group. Each skill bundles several related workflows into **modes** chosen at the top of the file — pick a mode (or let Claude pick it from your natural-language phrasing).

**`/feature-*` — Build & Change**

| Skill | Modes | When to use |
|-------|-------|-------------|
| `/feature-build` | NEW · REFACTOR · API · DEPRECATE | Build a new DDD feature, restructure existing code, add/integrate an API, or safely sunset a feature |
| `/feature-track` | — | Plan + approve, then run a tracked loop: branch → checklist → per-item test/implement/verify/commit |

**`/fix-*` — Bugs & Incidents**

| Skill | Modes | When to use |
|-------|-------|-------------|
| `/fix-bug` | QUICK · DEEP | QUICK: fix fast with rollback plan · DEEP: trace a hard / recurring / intermittent bug |
| `/fix-incident` | — | Production outage / on-call workflow |

**`/review-*` — Review & Quality**

| Skill | Modes | When to use |
|-------|-------|-------------|
| `/review-code` | SELF · PR · ARCHITECT · TDD · ADDRESS | Self-review a branch, review a teammate's PR, deep DDD audit, test-first development, or address PR comments |

**`/research-*` — Explore & Learn**

| Skill | Modes | When to use |
|-------|-------|-------------|
| `/research-explore` | WEB · SPIKE · ONBOARDING | Research solutions via docs, validate by building a prototype, or ramp up on a new codebase |

**`/docs-*` — Project Documentation**

| Skill | Modes | When to use |
|-------|-------|-------------|
| `/docs-sync` | SINGLE · FULL | SINGLE: hand-author one doc · FULL: auto-generate the whole docs site with review loop |

**`/marketing-*` — Brand & Content** (wrapped by the `/marketing` command)

| Skill | Modes | When to use |
|-------|-------|-------------|
| `/marketing-content` | STRATEGY · POST | Multi-post content strategy, or write ONE evergreen post optimized for Search + AI |
| `/marketing-brand` | LOGO · VIDEO | Logo + brand identity spec, or video script/storyboard/production plan |

### Skill decision matrix

When more than one skill / mode could fit, use this matrix:

| Situation | Use | Not |
|-----------|-----|-----|
| Bug just happened in prod, need fix in <1h | `/fix-bug` (QUICK) | `/fix-bug` DEEP (too slow) |
| Bug keeps coming back after "fixes" | `/fix-bug` (DEEP) | `/fix-bug` QUICK (will repeat) |
| About to push / open PR | `/review-code` (SELF) | `/review-code` PR (that's for others') |
| Reviewing teammate's PR | `/review-code` (PR) | `/review-code` SELF (that's for own branch) |
| Want to verify DDD compliance only | `/review-code` (ARCHITECT) | `/review-code` PR (broader scope) |
| Don't know the right solution yet | `/research-explore` (WEB) | SPIKE (skip if you can decide from docs) |
| Need to validate an idea by building | `/research-explore` (SPIKE) | `/feature-build` NEW (commit only after spike) |
| Driving a multi-step task as a checklist with commit-per-step | `/feature-track` | `/feature-build` NEW (single full DDD feature), `/review-code` TDD (one unit, no branch/commit) |
| Writing README / API docs by hand | `/docs-sync` (SINGLE) | `/docs-sync` FULL (overkill for single file) |
| Generating full docs site from codebase | `/docs-sync` (FULL) | `/docs-sync` SINGLE (manual is slower) |

### Backward compatibility

The 22 original skills were consolidated into 9 mode-based skills. Old trigger phrases still work — they're kept in each skill's `description` so Claude auto-invokes the right skill **and the right mode** when the user says e.g. "deep debug" (→ `/fix-bug` DEEP), "hotfix" (→ `/fix-bug` QUICK), "review changes" (→ `/review-code` SELF). The flattened name `/group-action` is the explicit invocation form.

## Architecture-First Approach

All agents reference architecture files to ensure consistency:

```
~/.claude/
├── agents/
├── commands/
├── skills/
└── architecture/          # Architecture references
    ├── clean-architecture.md
    ├── go-backend.md
    ├── laravel-backend.md
    ├── nodejs-nestjs.md
    ├── react-frontend.md
    ├── remix-fullstack.md
    ├── flutter-mobile.md
    └── monorepo.md
```

When an agent is invoked, it **reads the architecture file first** before coding according to the defined structure.

For Codex CLI, MoiCle installs architecture docs into `~/.codex/architecture` or `./.codex/architecture`, and converts MoiCle agents, commands, and existing skills into native Codex skills under `.codex/skills`. Restart Codex after a global install so the new skills are loaded.

For Antigravity, MoiCle installs architecture docs into `~/.gemini/architecture` or `./.gemini/architecture`, and converts MoiCle agents, commands, and existing skills into native Antigravity skills under `.gemini/skills`.

## Usage Examples

### Using Commands

```bash
# Bootstrap new project
/bootstrap                              # Interactive wizard
/bootstrap go                           # Quick start with Go + Gin
/bootstrap react                        # Quick start with React + Vite
/bootstrap flutter                      # Quick start with Flutter
/bootstrap landing using monorepo       # Create landing page with monorepo structure

# Brainstorm ideas
/brainstorm                             # Interactive framework selection
/brainstorm first-principles            # Use First Principles framework
/brainstorm scamper                     # Use SCAMPER framework
/brainstorm design-thinking             # Use Design Thinking framework

# Generate documentation
/doc                                    # Interactive documentation wizard
/doc diagrams                           # Generate architecture diagrams
/doc usecases                           # Generate use case specifications
/doc workflows                          # Generate workflow documentation
```

### Using Agents

```bash
# Agents will automatically read architecture reference before coding
@go-backend-dev Implement user authentication module
@react-frontend-dev Create dashboard page with charts
@clean-architect Review this PR's architecture
```

### Enable/Disable Agents

```bash
# Disable unused agents
moicle disable @rust-dev
moicle disable @swift-ios-dev

# Enable again
moicle enable @rust-dev

# View status
moicle status
```

## Project Structure

```
claude-agents-kit/
├── bin/
│   └── cli.js
├── src/
│   ├── commands/
│   │   ├── install.js
│   │   ├── uninstall.js
│   │   ├── list.js
│   │   ├── enable.js
│   │   ├── disable.js
│   │   └── status.js
│   └── utils/
│       ├── symlink.js
│       └── config.js
├── assets/
│   ├── agents/
│   │   ├── developers/
│   │   └── utilities/
│   ├── architecture/        # Architecture references
│   ├── commands/
│   └── skills/
├── package.json
└── README.md
```

## Requirements

- Node.js >= 18.0.0
- Claude Code CLI

## Donate

If you find this project useful, consider buying me a coffee!

**USDT / ETH / BNB:**
```
0xf3b2a531cb2774c77a751cdb10e043992eff5a2c
```

| Network | Token |
|---------|-------|
| Ethereum (ERC-20) | USDT, ETH |
| Binance Smart Chain (BEP-20) | USDT, BNB |

## License

GPL-3.0
