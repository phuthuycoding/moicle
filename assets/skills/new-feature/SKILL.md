---
name: new-feature
description: Complete feature development workflow from start to finish. Use when implementing new features, building functionality, or when user says "implement feature", "add feature", "build feature", "create feature", "new feature".
---

# Feature Development Workflow

End-to-end workflow for developing features with feedback loops and quality gates.

## IMPORTANT: Read Architecture First

**Before starting any phase, you MUST read the appropriate architecture reference:**

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

**Follow the structure and patterns defined in these files exactly.**

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| DESIGN | `@clean-architect` | Design based on architecture docs |
| IMPLEMENT | `@react-frontend-dev`, `@go-backend-dev`, `@laravel-backend-dev`, `@flutter-mobile-dev`, `@remix-fullstack-dev` | Stack-specific implementation |
| IMPLEMENT | `@db-designer` | Database schema design |
| IMPLEMENT | `@api-designer` | API design (REST/GraphQL) |
| REVIEW | `@code-reviewer` | Code quality review |
| REVIEW | `@security-audit` | Security vulnerabilities check |
| REVIEW | `@perf-optimizer` | Performance optimization |
| TEST | `@test-writer` | Unit/integration/e2e tests |
| COMPLETE | `@docs-writer` | Documentation (if needed) |

## Workflow Overview

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ 1. PLAN  │──▶│ 2. DESIGN│──▶│3. IMPLEMENT──▶│ 4. REVIEW│──▶│ 5. TEST  │──▶│6. COMPLETE
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
                                                   │              │
                                                   └──────◀───────┘
                                                    Feedback Loop
```

---

## Phase 1: PLAN

**Goal**: Understand requirements and break down into tasks

### Actions
1. Clarify requirements with user
2. **Identify project stack** (Flutter, React, Go, Laravel, Remix, etc.)
3. **Read the appropriate architecture doc** for this stack
4. Identify affected files/modules based on architecture
5. List acceptance criteria
6. Create task breakdown using TodoWrite

### Output
```markdown
## Feature: [Name]

### Stack & Architecture
- Stack: [Flutter/React/Go/Laravel/Remix]
- Architecture Doc: [path to architecture file]

### Requirements
- [ ] Requirement 1
- [ ] Requirement 2

### Affected Areas (based on architecture)
- [Layer/Module 1]
- [Layer/Module 2]

### Tasks
1. Task 1
2. Task 2
```

### Gate
- [ ] Requirements clear
- [ ] Architecture doc read
- [ ] Scope defined based on architecture
- [ ] Tasks broken down

---

## Phase 2: DESIGN

**Goal**: Design feature following the project's architecture

### Actions
1. **Re-read architecture doc** for the specific stack
2. Apply architecture principles from the doc:
   - Identify which layers are affected
   - Define components for each layer
   - Follow naming conventions from doc

3. Design data flow based on architecture patterns

### Design Template
```markdown
## Architecture Design

### Reference
- Architecture Doc: [path]
- Pattern: [pattern from doc]

### Layers Affected (from architecture doc)
- Layer 1: [components]
- Layer 2: [components]
- Layer 3: [components]

### Data Flow (from architecture doc)
[Follow the data flow pattern defined in doc]

### Dependencies
[List dependencies following DI pattern from doc]
```

### Gate
- [ ] Design follows architecture doc
- [ ] Layers properly defined
- [ ] Dependencies follow doc patterns

---

## Phase 3: IMPLEMENT

**Goal**: Code the feature following the architecture doc

### Actions
1. **Read implementation order from architecture doc**
2. Follow the directory structure from doc
3. Follow naming conventions from doc
4. Use patterns defined in doc (DI, state management, etc.)

### Implementation Checklist
```markdown
## Implementation (following [stack] architecture)

Reference: [architecture doc path]

### Directory Structure (from doc)
[Follow exact structure from architecture doc]

### Implementation Order (from doc)
[Follow order defined in architecture doc]

### Code Conventions (from doc)
[Follow conventions defined in architecture doc]
```

### Gate
- [ ] Structure matches architecture doc
- [ ] All layers implemented per doc
- [ ] Code compiles without errors
- [ ] Basic functionality works

---

## Phase 4: REVIEW

**Goal**: Review code quality against architecture doc

### Actions
1. **Compare implementation with architecture doc**
2. Check architecture rules are followed:
   - [ ] Layer boundaries respected
   - [ ] Dependencies flow correctly
   - [ ] Patterns used correctly

3. Security check:
   - [ ] Input validation
   - [ ] No sensitive data exposure
   - [ ] Proper authentication/authorization

4. Performance check:
   - [ ] Efficient queries
   - [ ] Proper caching (if in doc)
   - [ ] No obvious bottlenecks

### Review Output
```markdown
## Code Review Summary

### Architecture Compliance: [Pass/Fail]
- Reference: [architecture doc]
- Issues: [list]

### Quality: [Good/Needs Work]
- Issues: [list]

### Security: [Pass/Fail]
- Issues: [list]

### Performance: [Pass/Fail]
- Issues: [list]
```

### Gate
- [ ] Architecture doc followed
- [ ] No critical issues
- [ ] Security issues resolved

### Feedback Loop
If issues found → Return to IMPLEMENT phase → Fix → Re-review

---

## Phase 5: TEST

**Goal**: Ensure feature works with tests

### Actions
1. **Read testing patterns from architecture doc**
2. Write tests following doc conventions:
   - Test locations from doc
   - Mocking patterns from doc
   - Coverage expectations from doc

3. Run tests:
   ```bash
   # Use test command from architecture doc
   flutter test           # Flutter
   go test ./...          # Go
   bun test               # React/Remix
   php artisan test       # Laravel
   ```

### Gate
- [ ] Tests follow architecture doc patterns
- [ ] All tests pass
- [ ] Coverage acceptable

### Feedback Loop
If tests fail → Return to IMPLEMENT → Fix → Re-test

---

## Phase 6: COMPLETE

**Goal**: Finalize and deliver the feature

### Actions
1. Final checks:
   - [ ] All gates passed
   - [ ] Code formatted (use formatter from doc)
   - [ ] No TODO comments left

2. Git operations:
   ```bash
   git add .
   git commit -m "feat: [feature description]"
   ```

3. Create PR (if applicable):
   ```bash
   gh pr create --title "feat: [feature]" --body "[description]"
   ```

### Completion Checklist
- [ ] Feature follows architecture doc
- [ ] Tests passing
- [ ] Code reviewed
- [ ] Committed/PR created

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
| Phase | Key Actions |
|-------|-------------|
| PLAN | Read arch doc, clarify, breakdown |
| DESIGN | Design per arch doc |
| IMPLEMENT | Code per arch doc |
| REVIEW | Check arch compliance |
| TEST | Test per arch doc patterns |
| COMPLETE | Commit, PR |

### When to Loop Back
- **REVIEW fails** → Return to IMPLEMENT
- **TEST fails** → Return to IMPLEMENT
- **Requirements change** → Return to PLAN

### Success Criteria
Feature is complete when:
1. Follows architecture doc
2. All acceptance criteria met
3. All tests passing
4. Code review passed
5. Committed/PR created
