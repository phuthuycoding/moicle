---
name: architect-review
description: Architecture compliance review workflow. Reviews codebase against specific architecture guidelines. Use when user says "architect-review", "architecture review", "review architecture", "check architecture compliance".
args: ARCHITECTURE_NAME
---

# Architecture Review Workflow

Review codebase compliance against a specific architecture guideline.

## Usage

```bash
# With architecture name - review immediately
/architect-review clean-architecture
/architect-review react-frontend
/architect-review go-backend

# Without argument - will ask user to select
/architect-review
```

## Supported Architectures

Check for architecture files in these locations (in order):

1. **Project-specific**: `.claude/architecture/`
2. **Global**: `~/.claude/architecture/`

### Built-in Architectures

| Name | File | Description |
|------|------|-------------|
| `clean-architecture` | `clean-architecture.md` | Clean Architecture layers & principles |
| `react-frontend` | `react-frontend.md` | React + Vite + TypeScript |
| `go-backend` | `go-backend.md` | Go + Gin |
| `laravel-backend` | `laravel-backend.md` | Laravel + PHP |
| `remix-fullstack` | `remix-fullstack.md` | Remix fullstack |
| `flutter-mobile` | `flutter-mobile.md` | Flutter + Dart + Riverpod |
| `monorepo` | `monorepo.md` | Monorepo structure |

### Name Aliases

Support short names for convenience:

| Alias | Maps to |
|-------|---------|
| `clean` | `clean-architecture` |
| `react` | `react-frontend` |
| `go` | `go-backend` |
| `laravel` | `laravel-backend` |
| `remix` | `remix-fullstack` |
| `flutter` | `flutter-mobile` |

---

## Phase 0: RESOLVE ARCHITECTURE

**Goal**: Determine which architecture to review against

### If argument provided (`/architect-review {ARCHITECTURE_NAME}`)

1. Normalize the name using alias table above
2. Search for the architecture file:
   - First check: `.claude/architecture/{name}.md`
   - Then check: `~/.claude/architecture/{name}.md`
3. If file found → proceed to Phase 1
4. If file NOT found → **REJECT** with message:

```markdown
## ❌ Architecture Not Supported

Architecture `{ARCHITECTURE_NAME}` is not available.

### Available architectures:
[List all .md files found in both architecture directories]

### To add a custom architecture:
Place your architecture guideline file at:
- Project: `.claude/architecture/{name}.md`
- Global: `~/.claude/architecture/{name}.md`
```

**STOP HERE. Do not proceed with review.**

### If NO argument provided (`/architect-review`)

1. Scan both architecture directories for available `.md` files:
   ```bash
   ls .claude/architecture/*.md 2>/dev/null
   ls ~/.claude/architecture/*.md 2>/dev/null
   ```

2. If NO architecture files found → **REJECT**:
   ```markdown
   ## ❌ No Architecture Guidelines Found

   No architecture guideline files found in:
   - `.claude/architecture/`
   - `~/.claude/architecture/`

   Install moicle to get built-in architecture guidelines:
   ```bash
   npm install -g moicle && moicle install
   ```
   ```

   **STOP HERE.**

3. If files found → **ASK USER** to select which architecture to review against. Present the list of available architectures.

4. User selects → proceed to Phase 1

### Gate
- [ ] Architecture name resolved
- [ ] Architecture file exists and is readable
- [ ] Architecture guideline content loaded

---

## Phase 1: LOAD GUIDELINE

**Goal**: Read and understand the architecture guideline

### Actions

1. **Read the architecture file** completely
2. Extract key review criteria:
   - Layer structure & boundaries
   - Dependency rules (what depends on what)
   - Directory/folder structure conventions
   - Naming conventions
   - Design patterns required
   - Data flow patterns
   - Testing patterns
   - Anti-patterns to avoid

### Output
```markdown
## Architecture Guideline Summary

### Architecture: {name}
### Source: {file path}

### Key Principles
1. {principle 1}
2. {principle 2}
3. {principle 3}

### Layer Structure
{layer diagram or description from guideline}

### Dependency Rules
- {rule 1}
- {rule 2}

### Required Patterns
- {pattern 1}
- {pattern 2}

### Directory Structure
{expected structure from guideline}

### Naming Conventions
- {convention 1}
- {convention 2}
```

### Gate
- [ ] Guideline fully read
- [ ] Key criteria extracted
- [ ] Review checklist prepared

---

## Phase 2: SCAN CODEBASE

**Goal**: Analyze current codebase structure against the architecture

### Actions

1. **Map project structure**:
   ```bash
   # Get overall structure (exclude common non-source dirs)
   find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.go" -o -name "*.php" -o -name "*.dart" -o -name "*.js" -o -name "*.jsx" \) \
     -not -path "*/node_modules/*" -not -path "*/vendor/*" -not -path "*/.dart_tool/*" -not -path "*/build/*" -not -path "*/dist/*" | head -100
   ```

2. **Check directory structure** against guideline:
   - Does folder structure match expected layout?
   - Are there unexpected directories?
   - Are required directories missing?

3. **Check layer boundaries**:
   - Read key files in each layer
   - Check imports/dependencies
   - Verify dependency direction follows guideline rules

4. **Check naming conventions**:
   - File names follow convention?
   - Class/function names follow convention?
   - Module/package names follow convention?

5. **Check design patterns**:
   - Required patterns implemented?
   - Anti-patterns present?
   - Correct use of dependency injection?

6. **Check data flow**:
   - Data flows in correct direction per guideline?
   - Proper DTOs/entities at layer boundaries?

### Output
```markdown
## Codebase Scan Results

### Directory Structure
- Expected: {from guideline}
- Actual: {current structure}
- Match: [✅ Yes / ⚠️ Partial / ❌ No]

### Files Analyzed: {count}
### Layers Identified: {list}
```

### Gate
- [ ] Project structure mapped
- [ ] Key files identified per layer
- [ ] Dependencies analyzed

---

## Phase 3: REVIEW

**Goal**: Detailed compliance review with findings

### Review Dimensions

#### 1. Layer Boundaries ⚠️ CRITICAL

- [ ] Each layer only depends on allowed layers (per guideline)
- [ ] No circular dependencies between layers
- [ ] Infrastructure doesn't leak into domain
- [ ] Presentation doesn't directly access data layer
- [ ] Business logic is in the correct layer

#### 2. Directory Structure

- [ ] Folders match guideline layout
- [ ] Files are in correct locations
- [ ] No misplaced files across layers
- [ ] Required directories exist

#### 3. Naming Conventions

- [ ] Files follow naming pattern from guideline
- [ ] Classes/structs/types follow naming convention
- [ ] Functions/methods follow naming convention
- [ ] Variables follow naming convention
- [ ] Constants follow naming convention

#### 4. Design Patterns

- [ ] Required patterns are implemented (Repository, UseCase, etc.)
- [ ] Patterns are used correctly
- [ ] No anti-patterns present
- [ ] Dependency injection done properly

#### 5. Data Flow

- [ ] Data flows in correct direction
- [ ] Proper DTOs at boundaries
- [ ] No domain entities exposed to presentation
- [ ] Proper mapping between layers

#### 6. Testing Structure

- [ ] Tests follow guideline test structure
- [ ] Test files in correct locations
- [ ] Mocking follows guideline patterns
- [ ] Test naming conventions followed

### Severity Levels

| Level | Description | Action |
|-------|-------------|--------|
| 🚨 **Critical** | Core architecture violation | Must fix |
| ⚠️ **Major** | Significant deviation from guideline | Should fix |
| ℹ️ **Minor** | Small inconsistency | Nice to fix |
| 💡 **Suggestion** | Improvement opportunity | Optional |

### Gate
- [ ] All 6 dimensions reviewed
- [ ] Findings categorized by severity
- [ ] Specific file:line references provided

---

## Phase 4: REPORT

**Goal**: Generate comprehensive architecture compliance report

### Report Template

```markdown
# Architecture Compliance Report

## Overview
- **Architecture**: {name}
- **Guideline**: {file path}
- **Project**: {project name/path}
- **Date**: {date}
- **Overall Score**: {A/B/C/D/F}

## Score Breakdown

| Dimension | Score | Status |
|-----------|-------|--------|
| Layer Boundaries | {1-10} | {✅/⚠️/❌} |
| Directory Structure | {1-10} | {✅/⚠️/❌} |
| Naming Conventions | {1-10} | {✅/⚠️/❌} |
| Design Patterns | {1-10} | {✅/⚠️/❌} |
| Data Flow | {1-10} | {✅/⚠️/❌} |
| Testing Structure | {1-10} | {✅/⚠️/❌} |

## Grading Scale
- **A (9-10)**: Excellent compliance, follows guideline closely
- **B (7-8)**: Good compliance, minor deviations
- **C (5-6)**: Moderate compliance, notable gaps
- **D (3-4)**: Poor compliance, significant violations
- **F (1-2)**: Non-compliant, does not follow architecture

---

## 🚨 Critical Violations ({count})

### Violation 1: {title}
- **Dimension**: {Layer Boundaries / Design Patterns / etc.}
- **Location**: `{file}:{line}`
- **Guideline Says**: {what the guideline requires}
- **Actual**: {what the code does}
- **Impact**: {why this matters}
- **Fix**:
  ```
  {suggested fix or approach}
  ```

### Violation 2: ...

---

## ⚠️ Major Issues ({count})

### Issue 1: {title}
- **Dimension**: {dimension}
- **Location**: `{file}:{line}`
- **Guideline Says**: {requirement}
- **Actual**: {current state}
- **Fix**: {how to fix}

---

## ℹ️ Minor Issues ({count})

- [{file}:{line}] - {description}
- [{file}:{line}] - {description}

---

## 💡 Suggestions ({count})

- {suggestion 1}
- {suggestion 2}

---

## Compliance Summary

### What's Done Well ✅
- {strength 1}
- {strength 2}
- {strength 3}

### What Needs Improvement ⚠️
- {area 1}
- {area 2}

### Recommended Action Plan

#### Priority 1 (Critical - Fix Immediately)
1. {action 1}
2. {action 2}

#### Priority 2 (Major - Fix Soon)
1. {action 1}
2. {action 2}

#### Priority 3 (Minor - Fix When Possible)
1. {action 1}
2. {action 2}

---

## Architecture Reference

Key sections from the guideline that are most relevant:
- {section 1}: {brief summary}
- {section 2}: {brief summary}
```

### Gate
- [ ] Report generated with all sections
- [ ] Score calculated
- [ ] Action plan provided
- [ ] Specific file references included

---

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| SCAN | `@clean-architect` | Architecture compliance analysis |
| REVIEW | `@code-reviewer` | Code quality check |
| REVIEW | `@security-audit` | Security pattern compliance |
| REPORT | `@docs-writer` | Generate detailed report |

---

## Quick Reference

### Architecture Files Location
```
# Project-specific (priority)
.claude/architecture/{name}.md

# Global
~/.claude/architecture/{name}.md
```

### Supported Architectures
```
clean-architecture  (alias: clean)
react-frontend      (alias: react)
go-backend          (alias: go)
laravel-backend     (alias: laravel)
remix-fullstack     (alias: remix)
flutter-mobile      (alias: flutter)
monorepo
```

### Review Dimensions
| # | Dimension | Weight |
|---|-----------|--------|
| 1 | Layer Boundaries | Critical |
| 2 | Directory Structure | High |
| 3 | Naming Conventions | Medium |
| 4 | Design Patterns | High |
| 5 | Data Flow | High |
| 6 | Testing Structure | Medium |

---

## Success Criteria

Architecture review is complete when:
1. Architecture guideline loaded and understood
2. Codebase scanned thoroughly
3. All 6 dimensions reviewed
4. Findings categorized by severity
5. Compliance score calculated
6. Action plan provided with priorities
7. Specific file:line references for all findings
