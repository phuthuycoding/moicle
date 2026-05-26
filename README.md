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
- **21 Skills** - Auto-triggered workflows for the full SDLC (feature, bug, review, release, ops, content)
- **8 Architecture References** - DDD + stack-specific patterns


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

Skills are grouped into 6 namespaces. Type `/<group>:<tab>` in Claude Code to see all skills in a group.

**`/feature:*` — Build & Change**

| Skill | When to use |
|-------|-------------|
| `/feature:new` | Build a new feature end-to-end following DDD |
| `/feature:refactor` | Restructure existing module to DDD or improve internals |
| `/feature:api` | Add a new endpoint or integrate an external API |
| `/feature:deprecate` | Safely sunset a feature, API, or module |

**`/fix:*` — Bugs & Incidents**

| Skill | When to use |
|-------|-------------|
| `/fix:hotfix` | Fix a bug fast with a rollback plan |
| `/fix:root-cause` | Hard-to-trace bug that has been "fixed" multiple times |
| `/fix:incident` | Production outage / on-call workflow |
| `/fix:pr-comment` | Address review comments on an existing PR |

**`/review:*` — Review & Quality**

| Skill | When to use |
|-------|-------------|
| `/review:branch` | Self-review your branch BEFORE pushing / opening PR |
| `/review:pr` | Review someone else's open PR |
| `/review:architect` | DDD compliance check (called by `/feature:new` / `/feature:refactor`) |
| `/review:tdd` | Drive implementation with test-first discipline |

**`/research:*` — Explore & Learn**

| Skill | When to use |
|-------|-------------|
| `/research:web` | Search the web for solutions / best practices |
| `/research:spike` | Time-boxed prototype to learn / decide |
| `/research:onboarding` | Get up to speed on a new codebase |

**`/docs:*` — Project Documentation**

| Skill | When to use |
|-------|-------------|
| `/docs:write` | Author docs manually (README / API / ARCH / CONTRIB) |
| `/docs:sync` | Auto-generate structured docs from codebase with review loop |

**`/marketing:*` — Brand & Content** (wrapped by the `/marketing` command)

| Skill | When to use |
|-------|-------------|
| `/marketing:content` | Multi-post content strategy (pillars, calendar, channels) |
| `/marketing:seo-blog` | Write ONE evergreen blog post optimized for Search + AI tools |
| `/marketing:logo` | Logo + brand identity specification |
| `/marketing:video` | Video script, storyboard, production plan |

### Skill decision matrix

When more than one skill could fit, use this matrix:

| Situation | Use | Not |
|-----------|-----|-----|
| Bug just happened in prod, need fix in <1h | `/fix:hotfix` | `/fix:root-cause` (too slow) |
| Bug keeps coming back after "fixes" | `/fix:root-cause` | `/fix:hotfix` (will repeat) |
| About to push / open PR | `/review:branch` | `/review:pr` (that's for others') |
| Reviewing teammate's PR | `/review:pr` | `/review:branch` (that's for own branch) |
| Want to verify DDD compliance only | `/review:architect` | `/review:pr` (broader scope) |
| Don't know the right solution yet | `/research:web` | `/research:spike` (skip if you can decide from docs) |
| Need to validate an idea by building | `/research:spike` | `/feature:new` (commit only after spike) |
| Writing README / API docs by hand | `/docs:write` | `/docs:sync` (overkill for single file) |
| Generating full docs site from codebase | `/docs:sync` | `/docs:write` (manual is slower) |

### Backward compatibility

Old trigger phrases still work — they're kept in the skill `description` so Claude auto-invokes the right skill when the user says e.g. "deep debug", "hotfix", "review changes". The namespace `/group:action` is the new explicit invocation form.

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
