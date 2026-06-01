---
name: bootstrap
description: Bootstrap a new project with Claude Code support. Use when user says "/bootstrap", "new project", "create project", "init project", "start project".
---

# Bootstrap New Project

You are a project bootstrapping assistant. Guide the user through creating a new project with proper Claude Code support.

## Usage

```
/bootstrap
/bootstrap go          # Quick start with Go
/bootstrap react       # Quick start with React
/bootstrap flutter     # Quick start with Flutter
```

## Workflow

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ Brainstorm? │──▶│ Select Stack│──▶│ Read Arch   │──▶│ Create      │──▶│ Setup       │
│ (Optional)  │   │             │   │ Reference   │   │ Project     │   │ CLAUDE.md   │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
```

## IMPORTANT: Architecture Reference

Before creating any project structure, you MUST read the architecture reference files:

- **Clean Architecture**: `~/.claude/architecture/clean-architecture.md`
- **Go Backend**: `~/.claude/architecture/go-backend.md`
- **Laravel Backend**: `~/.claude/architecture/laravel-backend.md`
- **React Frontend**: `~/.claude/architecture/react-frontend.md`
- **Remix Fullstack**: `~/.claude/architecture/remix-fullstack.md`
- **Flutter Mobile**: `~/.claude/architecture/flutter-mobile.md`
- **Monorepo**: `~/.claude/architecture/monorepo.md`

## Step 0: Brainstorm First?

Ask the user if they want to brainstorm before creating the project:

```
Do you have a clear idea for your project?

1. Yes, let's create the project
2. Not yet, let's brainstorm first
```

If user selects **option 2**, run the `/brainstorm` command immediately. After brainstorming is complete, continue with Step 1.

---

## Step 1: Select Stack

Ask the user to select their preferred stack:

```
Which stack would you like to use?

1. Go + Gin (Backend API)
2. Laravel (Backend API - PHP)
3. React + Vite (Frontend SPA)
4. Remix (Full-stack React)
5. Flutter (Mobile/Desktop App)
6. Monorepo (Frontend + Backend)

Enter number (1-6):
```

## Step 2: Read Architecture Reference

Based on selection, READ the corresponding architecture file:

| Stack | Architecture File |
|-------|-------------------|
| Go + Gin | `go-backend.md` + `clean-architecture.md` + `hexagonal-architecture.md` |
| Laravel | `laravel-backend.md` + `clean-architecture.md` + `hexagonal-architecture.md` |
| React + Vite | `react-frontend.md` + `clean-architecture.md` |
| Remix | `remix-fullstack.md` + `clean-architecture.md` |
| Flutter | `flutter-mobile.md` + `clean-architecture.md` |
| Monorepo | `monorepo.md` + relevant app architectures |

> **Hexagonal (Ports & Adapters)** is the standard boundary pattern for backend stacks — read `hexagonal-architecture.md` alongside the stack doc. Frontends apply a lighter form (driven ports for API/storage).

## Step 3: Get Project Info

```
What is your project name?
(Use lowercase with hyphens, e.g., my-awesome-project)
```

## Step 4: Select Features

Present relevant features based on stack (see architecture file for details).

## Step 5: Create Project

Create project structure **exactly as defined in architecture reference file**.

## Step 6: Copy Architecture Reference

Copy relevant architecture files to project:

```
{project}/.claude/
├── agents/
└── architecture/
    ├── clean-architecture.md
    └── {stack}-specific.md
```

## Step 7: Setup CLAUDE.md

Create CLAUDE.md that references architecture:

```markdown
# {Project Name}

## Architecture

This project follows Clean Architecture. See:
- `.claude/architecture/clean-architecture.md`
- `.claude/architecture/{stack}.md`

## Quick Start
...
```

## Step 8: Initialize & Final Output

Run init commands and display success message with next steps.
