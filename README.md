# Claude Agents Kit

> Reusable AI agents, commands, and skills for Claude Code

Bộ công cụ giúp bootstrap và tăng tốc phát triển dự án với Claude Code thông qua các agents chuyên biệt, commands tự động hóa, và skills workflow.

## Features

- **16 AI Agents** - Agents chuyên biệt cho từng tech stack và task
- **2 Commands** - Wizard tự động hóa cho project setup và brainstorming
- **2 Skills** - Workflow tự động trigger cho feature development và hotfix
- **5 Templates** - Project templates với best practices

## Installation

```bash
npm install -g claude-agents-kit
```

## Quick Start

```bash
# Install agents, commands, skills
claude-kit install

# Chọn:
# 1. Global (~/.claude/)     - Dùng cho tất cả projects
# 2. Project (./.claude/)    - Chỉ project hiện tại
# 3. Both                    - Cả hai
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `claude-kit install` | Interactive installation menu |
| `claude-kit install --global` | Install to ~/.claude/ (symlinks) |
| `claude-kit install --project` | Install to ./.claude/ (copies) |
| `claude-kit install --all` | Install to both locations |
| `claude-kit list` | List all installed items |
| `claude-kit list --global` | List global installations only |
| `claude-kit list --project` | List project installations only |
| `claude-kit uninstall` | Interactive uninstall |
| `claude-kit uninstall --all` | Uninstall from everywhere |

## What's Included

### Developer Agents (6)

| Agent | Description |
|-------|-------------|
| `@flutter-mobile-dev` | Flutter/Dart mobile & desktop development |
| `@go-backend-dev` | Go + Gin backend API development |
| `@react-frontend-dev` | React + TypeScript frontend development |
| `@remix-fullstack-dev` | Remix full-stack development |
| `@rust-dev` | Rust systems programming |
| `@swift-ios-dev` | Swift/iOS native development |

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
| `/bootstrap` | Wizard tạo project mới với 5 stack options |
| `/brainstorm` | Brainstorm ý tưởng với 6 frameworks |

**Bootstrap Stacks:**
- Go + Gin (Backend API)
- React + Vite (Frontend SPA)
- Remix (Full-stack React)
- Flutter (Mobile/Desktop)
- Monorepo (Frontend + Backend)

**Brainstorm Frameworks:**
- First Principles
- SCAMPER
- Design Thinking
- Working Backwards
- 5 Whys
- Rapid Fire

### Skills (2)

Skills tự động trigger dựa trên context của conversation.

#### feature-workflow

```
PLAN → DESIGN → IMPLEMENT → REVIEW → TEST → COMPLETE
                              ↑         │
                              └────◀────┘
                             Feedback Loop
```

**Triggers:** "implement feature", "add feature", "build feature"

**Phases:**
1. **PLAN** - Phân tích requirements, tạo task breakdown
2. **DESIGN** - Thiết kế Clean Architecture + MVVM
3. **IMPLEMENT** - Code inside-out (Domain → Data → Presentation)
4. **REVIEW** - Review quality, security, performance
5. **TEST** - Unit tests, integration tests
6. **COMPLETE** - Commit, tạo PR

#### hotfix-workflow

```
IDENTIFY → REPRODUCE → FIX → VERIFY → DEPLOY
                        ↑       │
                        └───◀───┘
                         Fail? → ROLLBACK
```

**Triggers:** "fix bug", "hotfix", "urgent fix", "production issue"

**Phases:**
1. **IDENTIFY** - Xác định bug, assess severity
2. **REPRODUCE** - Reproduce bug, 5 Whys root cause
3. **FIX** - Minimal fix, no refactoring
4. **VERIFY** - Test fix, add regression test
5. **DEPLOY** - Commit, PR, deploy
6. **ROLLBACK** - Revert nếu fix gây issues mới

**Severity Levels:**
| Level | Response Time |
|-------|---------------|
| 🔴 CRITICAL | < 1 hour |
| 🟠 HIGH | < 4 hours |
| 🟡 MEDIUM | < 1 week |
| 🟢 LOW | Backlog |

## Usage Examples

### Using Agents

```bash
# Trong Claude Code, gọi agent bằng @
@code-reviewer Review this PR
@clean-architect Design user authentication module
@test-writer Write unit tests for UserService
```

### Using Commands

```bash
# Chạy command bằng /
/bootstrap
/brainstorm
```

### Skills Auto-trigger

```bash
# Skills tự động trigger dựa trên context
"Implement user authentication feature"  # → feature-workflow
"Fix the login bug in production"        # → hotfix-workflow
```

## Project Structure

```
claude-agents-kit/
├── bin/
│   └── cli.js                  # CLI entry point
├── src/
│   ├── commands/
│   │   ├── install.js          # Install command
│   │   ├── uninstall.js        # Uninstall command
│   │   ├── list.js             # List command
│   │   └── postinstall.js      # Post-install message
│   └── utils/
│       └── symlink.js          # Symlink/copy utilities
├── assets/
│   ├── agents/
│   │   ├── developers/         # Stack-specific agents
│   │   └── utilities/          # General utility agents
│   ├── commands/               # Claude Code commands
│   ├── skills/                 # Auto-triggered skills
│   └── templates/              # Project templates
├── package.json
├── CLAUDE.md
└── README.md
```

## How It Works

### Global Install (Symlinks)
- Tạo symlinks từ `~/.claude/` đến package trong `node_modules`
- Auto-update khi `npm update`
- Yêu cầu package phải tồn tại

### Project Install (Copies)
- Copy files vào `./.claude/`
- Standalone, không phụ thuộc package
- Commit được vào git

## Updating

```bash
npm update -g claude-agents-kit
claude-kit install --global  # Re-create symlinks
```

## Uninstalling

```bash
claude-kit uninstall --all
npm uninstall -g claude-agents-kit
```

## Requirements

- Node.js >= 18.0.0
- Claude Code CLI

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## License

MIT
