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

- **15 AI Agents** - Specialized agents for each tech stack and task
- **3 Commands** - Automation wizards for project setup, brainstorming, and documentation
- **12 Skills** - Auto-triggered workflows for feature development, hotfix, PR review, and more
- **7 Architecture References** - Clean Architecture patterns for all stacks


## Current Support

- [x] Claude
- [x] Codex CLI
- [ ] Antigravity
- [ ] Cursor
- [ ] Windsurf

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

# Choose:
# 1. Pick Claude Code or Codex CLI
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
| `moicle list` | List all installed items |
| `moicle status` | Show enabled/disabled status |
| `moicle enable <item>` | Enable an agent/command/skill |
| `moicle disable <item>` | Disable an agent/command/skill |
| `moicle uninstall` | Remove installations |

## What's Included

### Architecture References (8)

| File | Description |
|------|-------------|
| `clean-architecture.md` | Core Clean Architecture principles |
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

### Skills (21)

| Skill | Trigger |
|-------|---------|
| `new-feature` | "implement feature", "add feature", "build feature" |
| `hotfix` | "fix bug", "hotfix", "urgent fix", "production issue" |
| `pr-review` | "review pr", "check pr", "review code" |
| `review-changes` | "review changes", "review branch", "check branch", "review before pr" |
| `release` | "release", "deploy" |
| `deep-debug` | "deep debug", "trace bug", "find root cause", "hard bug" |
| `refactor` | "refactor", "clean up", "improve code" |
| `tdd` | "tdd", "test first", "test driven" |
| `onboarding` | "explain codebase", "onboard", "new to project" |
| `spike` | "spike", "prototype", "poc" |
| `research` | "research", "tìm giải pháp", "find best practice" |
| `documentation` | "document", "generate docs", "write docs" |
| `api-integration` | "integrate api", "add endpoint", "new api" |
| `incident-response` | "incident", "outage", "production down" |
| `deprecation` | "deprecate", "remove feature", "sunset" |
| `fix-pr-comment` | "fix pr comment", "address pr feedback" |
| `architect-review` | "architect-review", "architecture review", "review ddd" |
| `sync-docs` | "sync docs", "sync documentation", "doc sync" |
| `logo-design` | "design logo", "brand identity" |
| `video-content` | "create video", "video content", "video strategy" |
| `content-writer` | "write content", "content strategy", "blog post" |

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
