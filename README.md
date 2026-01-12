# MoiCle

> Reusable AI agents, commands, skills, and architecture references for Claude Code

Bộ công cụ giúp bootstrap và tăng tốc phát triển dự án với Claude Code thông qua các agents chuyên biệt, commands tự động hóa, skills workflow, và architecture references thống nhất.

## Features

- **15 AI Agents** - Agents chuyên biệt cho từng tech stack và task
- **2 Commands** - Wizard tự động hóa cho project setup và brainstorming
- **2 Skills** - Workflow tự động trigger cho feature development và hotfix
- **7 Architecture References** - Clean Architecture patterns cho mọi stack

## Installation

```bash
npm install -g claude-agents-kit
```

## Quick Start

```bash
# Install agents, commands, skills, architecture
moicle install

# Chọn:
# 1. Global (~/.claude/)     - Dùng cho tất cả projects
# 2. Project (./.claude/)    - Chỉ project hiện tại
# 3. Both                    - Cả hai
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
| `/bootstrap` | Wizard tạo project mới với 5 stack options |
| `/brainstorm` | Brainstorm ý tưởng với 6 frameworks |

### Skills (2)

| Skill | Trigger |
|-------|---------|
| `feature-workflow` | "implement feature", "add feature" |
| `hotfix-workflow` | "fix bug", "hotfix", "urgent fix" |

## Architecture-First Approach

Tất cả agents đều reference đến architecture files để đảm bảo consistency:

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

Khi agent được gọi, nó sẽ **đọc architecture file trước** rồi mới code theo đúng structure.

## Usage Examples

### Using Agents

```bash
# Agents sẽ tự đọc architecture reference trước khi code
@go-backend-dev Implement user authentication module
@react-frontend-dev Create dashboard page with charts
@clean-architect Review this PR's architecture
```

### Enable/Disable Agents

```bash
# Disable agents không dùng
moicle disable @rust-dev
moicle disable @swift-ios-dev

# Enable lại
moicle enable @rust-dev

# Xem status
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
│   ├── architecture/        # NEW: Architecture references
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
