# Claude Agents Kit

## Overview

Bộ công cụ cung cấp AI agents và commands có sẵn để bootstrap và tăng tốc phát triển dự án với Claude Code.

## Project Structure

```
agents/
├── developers/          # 6 agents cho các tech stack
│   ├── flutter-mobile-dev.md
│   ├── go-backend-dev.md
│   ├── react-frontend-dev.md
│   ├── remix-fullstack-dev.md
│   ├── rust-dev.md
│   └── swift-ios-dev.md
└── utilities/           # 10 agents tiện ích
    ├── api-designer.md
    ├── clean-architect.md
    ├── code-reviewer.md
    ├── db-designer.md
    ├── devops.md
    ├── docs-writer.md
    ├── perf-optimizer.md
    ├── refactor.md
    ├── security-audit.md
    └── test-writer.md

commands/
├── bootstrap.md         # Wizard tạo project mới
└── brainstorm.md        # Brainstorm với 6 frameworks

.claude/skills/          # Auto-triggered skills
├── feature-workflow/    # Feature development workflow
└── hotfix-workflow/     # Bug fix với rollback plan

templates/               # Project templates cho 5 stack
├── flutter/
├── go-gin/
├── monorepo/
├── react-vite/
└── remix/
```

## Commands

### /bootstrap
Wizard tạo project mới với các stack:
- Go + Gin (Backend API)
- React + Vite (Frontend SPA)
- Remix (Full-stack React)
- Flutter (Mobile/Desktop)
- Monorepo (Frontend + Backend)

### /brainstorm
Brainstorm ý tưởng với 6 frameworks:
- First Principles
- SCAMPER
- Design Thinking
- Working Backwards
- 5 Whys
- Rapid Fire

## Skills

### feature-workflow
Auto-triggered khi implement features. Workflow 6 phases với feedback loops:

```
PLAN → DESIGN → IMPLEMENT → REVIEW → TEST → COMPLETE
                              ↑         │
                              └────◀────┘
                             Feedback Loop
```

**Phases:**
1. **PLAN** - Phân tích requirements, tạo task breakdown
2. **DESIGN** - Thiết kế Clean Architecture + MVVM
3. **IMPLEMENT** - Code inside-out từ Domain → Data → Presentation
4. **REVIEW** - Review quality, security, performance
5. **TEST** - Unit tests, integration tests
6. **COMPLETE** - Commit, tạo PR

**Trigger:** Tự động khi nói "implement feature", "add feature", "build feature"

### hotfix-workflow
Quick bug fix workflow với rollback plan:

```
IDENTIFY → REPRODUCE → FIX → VERIFY → DEPLOY
                        ↑       │
                        └───◀───┘
                         Fail?
                           ↓
                       ROLLBACK
```

**Phases:**
1. **IDENTIFY** - Xác định bug, assess severity
2. **REPRODUCE** - Reproduce bug, 5 Whys root cause
3. **FIX** - Minimal fix, no refactoring
4. **VERIFY** - Test fix, add regression test
5. **DEPLOY** - Commit, PR, deploy
6. **ROLLBACK** - Revert nếu fix gây issues mới

**Severity Levels:**
- 🔴 CRITICAL - Response < 1 hour
- 🟠 HIGH - Response < 4 hours
- 🟡 MEDIUM - Response < 1 week
- 🟢 LOW - Backlog

**Trigger:** Tự động khi nói "fix bug", "hotfix", "urgent fix", "production issue"

## Installation

```bash
git clone https://github.com/yourname/claude-agents-kit.git ~/.claude-kit
~/.claude-kit/install.sh
```

Script `install.sh` sẽ tạo symlinks trong `~/.claude/agents/` và `~/.claude/commands/`.

## Conventions

- Agents sử dụng markdown format với instructions chi tiết
- Templates chứa CLAUDE.md mẫu cho từng stack
- Commands sử dụng interactive workflow với AskUserQuestion
