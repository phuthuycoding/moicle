---
name: onboarding
description: Codebase onboarding workflow for understanding new projects. Use when joining a project, exploring codebase, or when user says "explain codebase", "onboard me", "new to project", "understand project", "explore codebase", "project overview".
---

# Codebase Onboarding Workflow

Complete workflow for understanding and navigating new codebases effectively.

## IMPORTANT: Read Architecture First

**Before analyzing the codebase, you MUST read the appropriate architecture reference:**

### Global Architecture Files
```
~/.claude/architecture/
├── clean-architecture.md    # Core principles for all projects
├── flutter-mobile.md        # Flutter + Riverpod
├── react-frontend.md        # React + Vite + TypeScript
├── go-backend.md            # Go + Gin
├── laravel-backend.md       # Laravel + PHP
├── remix-fullstack.md       # Remix fullstack
└── monorepo.md              # Monorepo structure
```

### Project-specific (if exists)
```
.claude/architecture/        # Project overrides
```

**Understanding the architecture first helps you grasp the codebase structure faster.**

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| SCAN | `@clean-architect` | Identify architecture patterns |
| ANALYZE | `@clean-architect` | Analyze layer structure and boundaries |
| ANALYZE | `@code-reviewer` | Code quality and conventions analysis |
| ANALYZE | `@security-audit` | Security patterns review |
| EXPLAIN | `@docs-writer` | Generate documentation/explanation |
| GUIDE | `@docs-writer` | Create navigation guide |

## Workflow Overview

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ 1. SCAN  │──▶│ 2. ANALYZE──▶│ 3. EXPLAIN──▶│ 4. GUIDE │
└──────────┘   └──────────┘   └──────────┘   └──────────┘
     │              │               │              │
     └──────────────┴───────────────┴──────────────┘
              Comprehensive Understanding
```

---

## Phase 1: SCAN

**Goal**: Get a quick overview of project structure and tech stack

### Actions
1. Identify project type and stack:
   ```bash
   # Check package files
   ls -la | grep -E "package.json|pubspec.yaml|go.mod|composer.json|requirements.txt"

   # Check framework markers
   ls -la | grep -E "next.config|vite.config|angular.json|remix.config"
   ```

2. **Identify and read the appropriate architecture doc** based on stack

3. Scan directory structure:
   ```bash
   tree -L 2 -I 'node_modules|vendor|dist|build|.git'
   # or
   ls -R | grep ":$" | sed -e 's/:$//' -e 's/[^-][^\/]*\//--/g'
   ```

4. Check tech stack and dependencies:
   - `package.json` (Node.js/JS)
   - `pubspec.yaml` (Flutter)
   - `go.mod` (Go)
   - `composer.json` (PHP/Laravel)
   - `requirements.txt` (Python)

5. Look for documentation:
   - README.md
   - CONTRIBUTING.md
   - docs/ directory
   - .claude/architecture/ (project-specific)

### Output Template
```markdown
## Project Scan Results

### Stack Identification
- **Primary Language**: [JavaScript/TypeScript/Dart/Go/PHP/Python]
- **Framework**: [React/Flutter/Gin/Laravel/Django/etc]
- **Architecture Doc**: [path to applicable architecture reference]
- **Build Tool**: [Vite/Webpack/Maven/Gradle/etc]
- **Package Manager**: [npm/bun/yarn/pub/go mod/composer]

### Directory Structure
```
project/
├── src/              # [description based on architecture doc]
├── tests/            # [testing structure]
├── config/           # [configuration]
└── docs/             # [documentation]
```

### Key Dependencies (Top 5)
1. [dependency] - [purpose]
2. [dependency] - [purpose]
3. [dependency] - [purpose]

### Documentation Available
- [ ] README.md
- [ ] Architecture docs (.claude/architecture/)
- [ ] API documentation
- [ ] Contributing guide
```

### Gate
- [ ] Stack identified
- [ ] Architecture doc read
- [ ] Directory structure mapped
- [ ] Dependencies listed

---

## Phase 2: ANALYZE

**Goal**: Deep dive into architecture, patterns, and conventions

### Actions
1. **Analyze architecture based on the reference doc**:
   - Identify layers (from architecture doc)
   - Find data flow patterns (from architecture doc)
   - Map dependency injection patterns (from architecture doc)

2. **Identify code patterns and conventions**:
   ```bash
   # Find main entry points
   grep -r "main\|index\|app" --include="*.{js,ts,dart,go,php,py}"

   # Find common patterns
   grep -r "class\|interface\|type\|struct" --include="*.{js,ts,dart,go,php}"

   # Find state management
   grep -r "useState\|Provider\|Redux\|Riverpod\|Bloc" --include="*.{js,ts,dart}"
   ```

3. **Analyze configuration**:
   - Environment variables (.env, .env.example)
   - Config files (config/, .config/)
   - Build configuration

4. **Check testing setup**:
   - Test framework (Jest, Vitest, PHPUnit, Go test)
   - Test directory structure
   - Coverage setup

5. **Review code quality setup**:
   - Linter configuration (.eslintrc, analysis_options.yaml)
   - Formatter (prettier, gofmt, php-cs-fixer)
   - Pre-commit hooks

### Analysis Output
```markdown
## Architecture Analysis

### Reference Document
**Architecture Doc**: [path]
**Pattern**: [Clean Architecture/MVVM/MVC/etc]

### Layer Structure (from architecture doc)
1. **[Layer 1 - e.g., Presentation]**
   - Location: [directory path]
   - Responsibilities: [from doc]
   - Key files: [list]

2. **[Layer 2 - e.g., Domain]**
   - Location: [directory path]
   - Responsibilities: [from doc]
   - Key files: [list]

3. **[Layer 3 - e.g., Data]**
   - Location: [directory path]
   - Responsibilities: [from doc]
   - Key files: [list]

### Data Flow (from architecture doc)
```
[User Input] → [Presentation] → [Domain] → [Data] → [External APIs/DB]
              ←                ←          ←
```

### Key Patterns Identified
- **State Management**: [pattern used]
- **Dependency Injection**: [pattern used]
- **Routing**: [pattern used]
- **API Communication**: [pattern used]
- **Error Handling**: [pattern used]

### Naming Conventions
- **Files**: [convention - kebab-case, snake_case, PascalCase]
- **Classes**: [convention]
- **Functions**: [convention]
- **Constants**: [convention]

### Code Quality
- **Linter**: [ESLint/Dart Analyzer/golangci-lint/etc]
- **Formatter**: [Prettier/dartfmt/gofmt/etc]
- **Testing**: [Jest/PHPUnit/Go test/etc]
- **Coverage Target**: [percentage if specified]

### Configuration
- **Environment Variables**: [.env location and key vars]
- **Config Files**: [list important configs]
- **Build Config**: [description]
```

### Gate
- [ ] Architecture pattern identified (matches doc)
- [ ] Layers mapped (per architecture doc)
- [ ] Code conventions documented
- [ ] Testing setup understood

---

## Phase 3: EXPLAIN

**Goal**: Generate comprehensive documentation/explanation

### Actions
1. **Create architectural overview** following the reference doc
2. **Document key components** in each layer
3. **Map common workflows** (how data flows through layers)
4. **List important files** and their purposes
5. **Document setup process**

### Explanation Template
```markdown
## Codebase Explanation

### Project Overview
**Name**: [project name]
**Purpose**: [what it does]
**Stack**: [tech stack]
**Architecture**: [pattern - with reference to doc]

---

### Architecture Overview

This project follows **[architecture pattern from doc]**

#### Directory Structure Explained
```
project/
├── [layer1]/              # [Purpose based on architecture doc]
│   ├── [component]/       # [Specific purpose]
│   └── [component]/       # [Specific purpose]
├── [layer2]/              # [Purpose based on architecture doc]
│   ├── [component]/       # [Specific purpose]
│   └── [component]/       # [Specific purpose]
└── [layer3]/              # [Purpose based on architecture doc]
    ├── [component]/       # [Specific purpose]
    └── [component]/       # [Specific purpose]
```

---

### Key Components

#### 1. [Component Name]
- **Location**: [path]
- **Layer**: [which layer from architecture doc]
- **Purpose**: [what it does]
- **Key Files**:
  - `[file1]` - [purpose]
  - `[file2]` - [purpose]
- **Dependencies**: [what it depends on]

#### 2. [Component Name]
- **Location**: [path]
- **Layer**: [which layer from architecture doc]
- **Purpose**: [what it does]
- **Key Files**:
  - `[file1]` - [purpose]
  - `[file2]` - [purpose]
- **Dependencies**: [what it depends on]

(Repeat for top 5-10 components)

---

### Common Workflows

#### Workflow 1: [e.g., User Authentication]
```
1. User enters credentials in [Presentation Layer Component]
2. [UseCase/Service] validates input
3. [Repository/Data Source] calls API
4. Response flows back through layers
5. UI updates with result
```

**Files Involved**:
- [file1] - [role]
- [file2] - [role]
- [file3] - [role]

#### Workflow 2: [e.g., Data Fetching]
```
[Describe step by step following architecture layers]
```

**Files Involved**:
- [file1] - [role]
- [file2] - [role]

---

### Important Files Reference

#### Core Files
- `[file]` - [purpose]
- `[file]` - [purpose]

#### Configuration
- `[file]` - [purpose]
- `[file]` - [purpose]

#### Entry Points
- `[file]` - [main entry]
- `[file]` - [test entry]

---

### Setup & Development

#### Installation
```bash
# [step-by-step installation based on project]
```

#### Development Commands
```bash
# Start dev server
[command]

# Run tests
[command]

# Build
[command]

# Lint
[command]
```

#### Environment Variables
Required variables (see .env.example):
- `[VAR]` - [purpose]
- `[VAR]` - [purpose]

---

### Testing Strategy
- **Unit Tests**: [location and pattern]
- **Integration Tests**: [location and pattern]
- **E2E Tests**: [location and pattern if available]
- **Run Tests**: `[command]`

---

### Code Style & Conventions
- **Code Style**: [description]
- **Naming**: [conventions]
- **Comments**: [when and how]
- **Linting**: [configuration]
```

### Gate
- [ ] Architecture explained clearly
- [ ] Key components documented
- [ ] Workflows mapped
- [ ] Setup instructions provided

---

## Phase 4: GUIDE

**Goal**: Create a practical navigation guide for common tasks

### Actions
1. **Create task-based guides** (how to add features, fix bugs)
2. **Document where to find things** (quick reference)
3. **List common gotchas** and solutions
4. **Provide quick wins** (easy first tasks)

### Guide Template
```markdown
## Navigation Guide

### How to Add a New Feature

Following the **[architecture pattern from doc]**, here's the step-by-step:

1. **Define in Domain Layer** (if applicable):
   - Create entity: `[path]/entities/`
   - Create use case: `[path]/usecases/`

2. **Implement in Data Layer**:
   - Create repository: `[path]/repositories/`
   - Create data source: `[path]/datasources/`

3. **Build in Presentation Layer**:
   - Create UI component: `[path]/screens/` or `[path]/pages/`
   - Add state management: `[path]/providers/` or `[path]/stores/`

4. **Add Tests**:
   - Unit tests: `[path]/test/`
   - Integration tests: `[path]/test/`

5. **Update Documentation**:
   - Update README if needed
   - Add inline documentation

### How to Fix a Bug

1. **Locate the Layer** (use architecture doc):
   - UI bug? → Check Presentation layer at `[path]`
   - Business logic bug? → Check Domain layer at `[path]`
   - Data bug? → Check Data layer at `[path]`

2. **Find Related Files**:
   - Search by feature: `grep -r "[feature_name]" [layer_path]`
   - Check recent changes: `git log --oneline [file]`

3. **Fix Following Patterns** (from architecture doc)

4. **Test**:
   - Run existing tests: `[command]`
   - Add regression test

### Where to Find Things

| What | Where |
|------|-------|
| API endpoints | `[path]` |
| Database models | `[path]` |
| UI components | `[path]` |
| Business logic | `[path]` |
| State management | `[path]` |
| Constants | `[path]` |
| Utils/Helpers | `[path]` |
| Config | `[path]` |
| Tests | `[path]` |
| Types/Interfaces | `[path]` |

### Common Tasks Quick Reference

#### Add a new API endpoint
```bash
1. Define route in [path]
2. Create controller in [path]
3. Add service logic in [path]
4. Update types in [path]
5. Test with [command]
```

#### Add a new UI component
```bash
1. Create component in [path]
2. Add styles in [path]
3. Export from [path]
4. Use in [path]
```

#### Add a new database table/model
```bash
1. Create migration in [path]
2. Define model in [path]
3. Add repository in [path]
4. Run migration: [command]
```

### Common Gotchas & Solutions

1. **[Gotcha 1]**
   - Problem: [description]
   - Solution: [how to fix]

2. **[Gotcha 2]**
   - Problem: [description]
   - Solution: [how to fix]

3. **[Gotcha 3]**
   - Problem: [description]
   - Solution: [how to fix]

### Quick Wins (Easy First Tasks)

Good first issues to familiarize yourself:

1. **Fix a typo or improve documentation**
   - Files: README.md, comments
   - Impact: Low risk, good learning

2. **Add a simple utility function**
   - Location: `[path]/utils/`
   - Pattern: [describe pattern]

3. **Add a test for existing code**
   - Location: `[path]/test/`
   - Framework: [test framework]

4. **Improve error messages**
   - Location: `[path]/errors/`
   - Pattern: [describe pattern]

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/[name]

# Make changes following architecture

# Commit (follow conventional commits)
git commit -m "[type]: [description]"

# Push and create PR
git push origin feature/[name]
gh pr create
```

### Getting Help

- **Architecture Reference**: `~/.claude/architecture/[stack].md`
- **Project Docs**: `docs/` or `README.md`
- **Code Comments**: Well-documented files in `[path]`
- **Tests as Examples**: `[path]/test/` shows usage patterns
```

### Gate
- [ ] Task guides created
- [ ] Navigation reference provided
- [ ] Common gotchas documented
- [ ] Quick wins identified

---

## Quick Reference

### Architecture Docs
| Stack | Doc |
|-------|-----|
| All | `clean-architecture.md` |
| Flutter | `flutter-mobile.md` |
| React | `react-frontend.md` |
| Go | `go-backend.md` |
| Laravel | `laravel-backend.md` |
| Remix | `remix-fullstack.md` |
| Monorepo | `monorepo.md` |

### Phase Summary
| Phase | Key Actions | Output |
|-------|-------------|--------|
| SCAN | Identify stack, read arch doc, map structure | Project overview |
| ANALYZE | Deep dive into layers, patterns, conventions | Architecture analysis |
| EXPLAIN | Document components, workflows, setup | Comprehensive guide |
| GUIDE | Create task guides, navigation, quick wins | Practical handbook |

### Onboarding Checklist

After completing this workflow, you should understand:
- [ ] Project tech stack and dependencies
- [ ] Architecture pattern and layers
- [ ] Directory structure and where to find things
- [ ] How to add new features (following architecture)
- [ ] How to fix bugs (following architecture)
- [ ] Testing strategy and how to run tests
- [ ] Development workflow and commands
- [ ] Common patterns and conventions
- [ ] Where to get help

### Success Criteria

Onboarding is complete when you can:
1. Explain the project architecture (based on reference doc)
2. Locate any component or feature quickly
3. Add a simple feature following the architecture
4. Run tests and understand the output
5. Navigate the codebase confidently

### Next Steps After Onboarding

1. **Pick a Quick Win** - Complete an easy first task
2. **Read Architecture Doc** - Deep dive into the specific patterns
3. **Pair with Code** - Review existing features to learn patterns
4. **Ask Questions** - Clarify anything unclear
5. **Start Contributing** - Begin with small features following the architecture
