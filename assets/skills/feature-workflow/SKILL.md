---
name: feature-workflow
description: Complete feature development workflow from start to finish. Use when implementing new features, building functionality, or when user says "implement feature", "add feature", "build feature", "create feature".
---

# Feature Development Workflow

End-to-end workflow for developing features with feedback loops and quality gates.

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| DESIGN | `@clean-architect` | Design Clean Architecture + MVVM |
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

## Phase 1: PLAN

**Goal**: Understand requirements and break down into tasks

### Actions
1. Clarify requirements with user
2. Identify affected files/modules
3. List acceptance criteria
4. Create task breakdown using TodoWrite

### Output
```markdown
## Feature: [Name]
### Requirements
- [ ] Requirement 1
- [ ] Requirement 2

### Affected Areas
- File/Module 1
- File/Module 2

### Tasks
1. Task 1
2. Task 2
```

### Gate
- [ ] Requirements clear
- [ ] Scope defined
- [ ] Tasks broken down

---

## Phase 2: DESIGN

**Goal**: Design architecture following Clean Architecture + MVVM

### Actions
1. Apply Clean Architecture principles:
   - Define Domain layer (entities, use cases, repository interfaces)
   - Define Data layer (repository implementations, data sources)
   - Define Presentation layer (ViewModels, Views)

2. Design data flow:
   ```
   View ──▶ ViewModel ──▶ UseCase ──▶ Repository ──▶ DataSource
   ```

3. Identify dependencies and DI setup

### Design Template
```markdown
## Architecture Design

### Domain Layer
- Entities: [list]
- Use Cases: [list]
- Repository Interfaces: [list]

### Data Layer
- Repository Implementations: [list]
- Data Sources: [list]
- Models/DTOs: [list]

### Presentation Layer
- ViewModels: [list]
- Views/Screens: [list]
- States: [list]

### Dependency Graph
[ASCII diagram]
```

### Gate
- [ ] Layers defined
- [ ] Dependencies flow inward only
- [ ] No domain layer external dependencies

---

## Phase 3: IMPLEMENT

**Goal**: Code the feature following the design

### Actions
1. Start from Domain layer (inside-out):
   - Create entities
   - Create use case interfaces
   - Create repository interfaces

2. Implement Data layer:
   - Create DTOs/models
   - Implement repositories
   - Implement data sources

3. Implement Presentation layer:
   - Create ViewModels
   - Create Views
   - Wire up DI

### Implementation Order
```
1. domain/entities/
2. domain/usecases/
3. domain/repositories/ (interfaces)
4. data/models/
5. data/datasources/
6. data/repositories/ (implementations)
7. presentation/viewmodels/
8. presentation/views/
9. di/modules/
```

### Gate
- [ ] All layers implemented
- [ ] Code compiles without errors
- [ ] Basic functionality works

---

## Phase 4: REVIEW

**Goal**: Review code quality, security, and best practices

### Actions
1. Self-review checklist:
   - [ ] Clean Architecture rules followed
   - [ ] SOLID principles applied
   - [ ] No code smells
   - [ ] Error handling in place
   - [ ] No hardcoded values

2. Security check:
   - [ ] Input validation
   - [ ] No sensitive data exposure
   - [ ] Proper authentication/authorization

3. Performance check:
   - [ ] No N+1 queries
   - [ ] Efficient algorithms
   - [ ] Proper caching

### Review Output
```markdown
## Code Review Summary

### Quality: [Good/Needs Work]
- Issue 1: [description] -> Fix: [solution]

### Security: [Pass/Fail]
- Issue 1: [description] -> Fix: [solution]

### Performance: [Pass/Fail]
- Issue 1: [description] -> Fix: [solution]
```

### Gate
- [ ] No critical issues
- [ ] All security issues resolved
- [ ] Performance acceptable

### Feedback Loop
If issues found:
1. Note issues in review output
2. Return to IMPLEMENT phase
3. Fix issues
4. Re-run REVIEW phase

---

## Phase 5: TEST

**Goal**: Ensure feature works correctly with tests

### Actions
1. Unit Tests:
   - Test entities (pure logic)
   - Test use cases (mock repositories)
   - Test ViewModels (mock use cases)

2. Integration Tests:
   - Test repository + data sources
   - Test use case flows

3. Run all tests:
   ```bash
   # Example commands
   flutter test           # Flutter
   go test ./...          # Go
   pnpm test              # React/Remix
   ```

### Test Coverage Target
- Domain layer: 90%+
- Data layer: 80%+
- Presentation layer: 70%+

### Gate
- [ ] All tests pass
- [ ] Coverage targets met
- [ ] Edge cases covered

### Feedback Loop
If tests fail:
1. Analyze failure
2. Return to IMPLEMENT phase
3. Fix code
4. Re-run tests

---

## Phase 6: COMPLETE

**Goal**: Finalize and deliver the feature

### Actions
1. Final checks:
   - [ ] All gates passed
   - [ ] Code formatted
   - [ ] No TODO comments left
   - [ ] Documentation updated (if needed)

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
- [ ] Feature implemented
- [ ] Tests passing
- [ ] Code reviewed
- [ ] Committed/PR created

---

## Quick Reference

### Phase Commands
| Phase | Key Actions |
|-------|-------------|
| PLAN | Clarify, breakdown, TodoWrite |
| DESIGN | Clean Architecture, layer design |
| IMPLEMENT | Code inside-out |
| REVIEW | Quality, security, performance |
| TEST | Unit, integration, run tests |
| COMPLETE | Commit, PR |

### When to Loop Back
- **REVIEW fails** → Return to IMPLEMENT
- **TEST fails** → Return to IMPLEMENT
- **Requirements change** → Return to PLAN

### Success Criteria
Feature is complete when:
1. All acceptance criteria met
2. All tests passing
3. Code review passed
4. Committed/PR created
