# Claude Agents Kit

## Overview

NPM CLI package cung cấp AI agents, commands, và skills để tăng tốc phát triển dự án với Claude Code.

## Quick Reference

```bash
# Installation
npm install -g claude-agents-kit
claude-kit install

# Commands
claude-kit install --global   # Symlinks to ~/.claude/
claude-kit install --project  # Copies to ./.claude/
claude-kit list               # List installed
claude-kit uninstall          # Remove
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
│   │   └── postinstall.js          # npm postinstall message
│   └── utils/
│       └── symlink.js              # File operations
├── assets/
│   ├── agents/
│   │   ├── developers/             # 6 stack-specific agents
│   │   │   ├── flutter-mobile-dev.md
│   │   │   ├── go-backend-dev.md
│   │   │   ├── react-frontend-dev.md
│   │   │   ├── remix-fullstack-dev.md
│   │   │   ├── rust-dev.md
│   │   │   └── swift-ios-dev.md
│   │   └── utilities/              # 10 utility agents
│   │       ├── api-designer.md
│   │       ├── clean-architect.md
│   │       ├── code-reviewer.md
│   │       ├── db-designer.md
│   │       ├── devops.md
│   │       ├── docs-writer.md
│   │       ├── perf-optimizer.md
│   │       ├── refactor.md
│   │       ├── security-audit.md
│   │       └── test-writer.md
│   ├── commands/
│   │   ├── bootstrap.md            # Project wizard
│   │   └── brainstorm.md           # Ideation frameworks
│   ├── skills/
│   │   ├── feature-workflow/       # Feature development
│   │   │   └── SKILL.md
│   │   └── hotfix-workflow/        # Bug fix workflow
│   │       └── SKILL.md
│   └── templates/                  # 5 project templates
│       ├── flutter/
│       ├── go-gin/
│       ├── monorepo/
│       ├── react-vite/
│       └── remix/
├── package.json
└── README.md
```

## Agents

### Developer Agents
| Agent | Tech Stack |
|-------|------------|
| `@flutter-mobile-dev` | Flutter, Dart, Mobile/Desktop |
| `@go-backend-dev` | Go, Gin, REST API |
| `@react-frontend-dev` | React, TypeScript, Vite |
| `@remix-fullstack-dev` | Remix, React, Full-stack |
| `@rust-dev` | Rust, Systems programming |
| `@swift-ios-dev` | Swift, iOS, UIKit/SwiftUI |

### Utility Agents
| Agent | Purpose |
|-------|---------|
| `@api-designer` | REST/GraphQL API design |
| `@clean-architect` | Clean Architecture + MVVM |
| `@code-reviewer` | Quality, security, performance review |
| `@db-designer` | Database schema design |
| `@devops` | CI/CD, Docker, K8s |
| `@docs-writer` | Technical documentation |
| `@perf-optimizer` | Performance optimization |
| `@refactor` | Code refactoring |
| `@security-audit` | Security analysis |
| `@test-writer` | Unit/integration tests |

## Commands

### /bootstrap
Project wizard với 5 stacks:
- Go + Gin (Backend)
- React + Vite (Frontend)
- Remix (Full-stack)
- Flutter (Mobile/Desktop)
- Monorepo

### /brainstorm
6 ideation frameworks:
- First Principles
- SCAMPER
- Design Thinking
- Working Backwards
- 5 Whys
- Rapid Fire

## Skills

### feature-workflow
```
PLAN → DESIGN → IMPLEMENT → REVIEW → TEST → COMPLETE
                              ↑         │
                              └────◀────┘
```
**Trigger:** "implement feature", "add feature", "build feature"

### hotfix-workflow
```
IDENTIFY → REPRODUCE → FIX → VERIFY → DEPLOY → ROLLBACK?
```
**Trigger:** "fix bug", "hotfix", "urgent fix", "production issue"

**Severity:** 🔴 CRITICAL (<1h) | 🟠 HIGH (<4h) | 🟡 MEDIUM (<1w) | 🟢 LOW

## Development

### Tech Stack
- Node.js >= 18
- ES Modules
- Dependencies: chalk, commander, inquirer, ora

### File Conventions
- Agents: Markdown với YAML frontmatter
- Skills: SKILL.md trong folder riêng
- Commands: Markdown với interactive prompts

### Testing Locally
```bash
npm install
npm link
claude-kit install
```

### Publishing
```bash
npm login
npm publish
```
