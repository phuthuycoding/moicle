# MoiCle

> Reusable AI agents, commands, skills, and architecture references for Claude Code

A toolkit to bootstrap and accelerate project development with Claude Code through specialized agents, automation commands, workflow skills, and unified architecture references.

## Features

- **15 AI Agents** - Specialized agents for each tech stack and task
- **2 Commands** - Automation wizards for project setup and brainstorming
- **2 Skills** - Auto-triggered workflows for feature development and hotfix
- **7 Architecture References** - Clean Architecture patterns for all stacks


## Current Support

- [x] Claude
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

# Choose:
# 1. Global (~/.claude/)     - Use for all projects
# 2. Project (./.claude/)    - Current project only
# 3. Both                    - Both locations
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `moicle install` | Interactive installation menu |
| `moicle install --global` | Install to ~/.claude/ (symlinks) |
| `moicle install --project` | Install to ./.claude/ (copies) |
| `moicle list` | List all installed items |
| `moicle status` | Show enabled/disabled status |
| `moicle enable <item>` | Enable an agent/command/skill |
| `moicle disable <item>` | Disable an agent/command/skill |
| `moicle uninstall` | Remove installations |

## What's Included

### Architecture References (7)

| File | Description |
|------|-------------|
| `clean-architecture.md` | Core Clean Architecture principles |
| `go-backend.md` | Go + Gin project structure |
| `laravel-backend.md` | Laravel + PHP project structure |
| `react-frontend.md` | React + Vite project structure |
| `remix-fullstack.md` | Remix fullstack structure |
| `flutter-mobile.md` | Flutter mobile structure |
| `monorepo.md` | Monorepo structure |

### Developer Agents (5)

| Agent | Description |
|-------|-------------|
| `@flutter-mobile-dev` | Flutter/Dart mobile & desktop development |
| `@go-backend-dev` | Go + Gin backend API development |
| `@laravel-backend-dev` | Laravel + PHP backend API development |
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

### Commands (2)

| Command | Description |
|---------|-------------|
| `/bootstrap` | Wizard to create new project with 5 stack options |
| `/brainstorm` | Brainstorm ideas with 6 frameworks |

### Skills (2)

| Skill | Trigger |
|-------|---------|
| `feature-workflow` | "implement feature", "add feature" |
| `hotfix-workflow` | "fix bug", "hotfix", "urgent fix" |

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
    ├── react-frontend.md
    ├── remix-fullstack.md
    ├── flutter-mobile.md
    └── monorepo.md
```

When an agent is invoked, it **reads the architecture file first** before coding according to the defined structure.

## Usage Examples

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
