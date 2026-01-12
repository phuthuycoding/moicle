# MoiCle

## Overview

NPM CLI package providing AI agents, commands, skills, and architecture references to accelerate project development with Claude Code.

## Quick Reference

```bash
# Installation
npm install -g claude-agents-kit
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
claude-agents-kit/
├── bin/cli.js                      # CLI entry point (ES modules)
├── src/
│   ├── commands/
│   │   ├── install.js              # Interactive install
│   │   ├── uninstall.js            # Remove installations
│   │   ├── list.js                 # List installed items
│   │   ├── enable.js               # Enable items
│   │   ├── disable.js              # Disable items
│   │   ├── status.js               # Show status
│   │   └── postinstall.js          # npm postinstall message
│   └── utils/
│       ├── symlink.js              # File operations
│       └── config.js               # Config management
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
│       ├── feature-workflow/
│       └── hotfix-workflow/
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

## Skills

### feature-workflow
**Trigger:** "implement feature", "add feature", "build feature"

### hotfix-workflow
**Trigger:** "fix bug", "hotfix", "urgent fix", "production issue"

## Development

### Tech Stack
- Node.js >= 18, ES Modules
- Dependencies: chalk, commander, inquirer, ora

### Testing Locally
```bash
bun install
bun link
moicle install
```

### Key Conventions
- Agents MUST read architecture files before coding
- Config stored at `~/.claude/moicle-config.json`
- Disabled items renamed to `.md.disabled`
