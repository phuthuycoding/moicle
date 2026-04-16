---
name: new-feature
description: DDD feature development workflow with phase-based checks and review loop. Use when implementing new features, building functionality, or when user says "implement feature", "add feature", "build feature", "create feature", "new feature".
args: "[DOMAIN] [FEATURE]"
---

# DDD Feature Development Workflow

Build a new feature following DDD architecture, with automated checks after each phase and a review loop that keeps fixing until all checks pass.

**ARGUMENTS:** `<domain> <feature>` — e.g., `wallet savings`, `notification broadcast`, `catalog products`

## Read Architecture First

**Before starting, MUST read TWO files:**

1. **Core DDD spec**: `.claude/architecture/ddd-architecture.md`
2. **Stack-specific doc**: detect stack → read the corresponding architecture doc

### Stack Detection
| File | Stack Doc |
|------|-----------|
| `go.mod` | `go-backend.md` |
| `package.json` + `vite.config.*` | `react-frontend.md` |
| `pubspec.yaml` | `flutter-mobile.md` |
| `composer.json` | `laravel-backend.md` |
| `remix.config.*` | `remix-fullstack.md` |

### Architecture Files Location
```
.claude/architecture/{name}.md     # Project-specific (priority)
~/.claude/architecture/{name}.md   # Global
```

---

## Workflow

```
PHASE 1: Analyze & Plan
  → PHASE 2: Build Domain Layer
  → PHASE 3: Build Infrastructure Layer
  → PHASE 4: Build Application Layer
  → PHASE 5: Registration & Wiring
  → PHASE 6: Domain Tests
  → REVIEW LOOP (run /architect-review, fix issues, repeat until clean)
```

---

## PHASE 1: Analyze & Plan

### 1.1 Read Architecture Docs
1. Read `ddd-architecture.md` (core DDD rules)
2. Read stack-specific architecture doc
3. Extract: DDD directory structure, layer rules, hard rules, forbidden imports, check scripts

### 1.2 Read Reference Module
Pick a SMALL existing module in the project as reference. Read ALL its files to understand exact patterns:
- Entities, value objects, events, ports, usecases
- Service, handler, DTOs, listeners
- Infrastructure store/API implementations
- Registration in router/provider/registry

### 1.3 Plan Feature
Present to user:
- All entities and their fields
- All endpoints/screens/UI (depending on stack)
- All domain events
- All value objects
- Business rules summary
- Files to create/modify

### Rule Check Phase 1
- [ ] Architecture docs read and understood
- [ ] Reference module read
- [ ] Plan presented and **user CONFIRMED** before continuing

---

## PHASE 2: Build Domain Layer

Create in order: value objects → entities → events → ports → usecases

### 2.1 Value Objects (`valueobjects/`)
- Typed values with behavior methods
- Status with `IsTerminal()`, `CanTransitionTo()`
- **Only stdlib imports** — read Forbidden Imports from architecture doc

### 2.2 Entities (`entities/`)
- Constructor function/method
- Behavior methods that raise events (state transitions, calculations)
- Guard methods (isActive, canXxx)
- Business error types
- Only imports: stdlib + valueobjects + domain/shared

### 2.3 Events (`events/`)
- One file per event
- Extend/embed base event type
- Carry data needed by listeners (userID, amounts, names)

### 2.4 Ports (`ports/`)
- One file per interface
- Store interfaces use domain entity types and value objects
- DTOs for complex query results live here
- No infrastructure imports

### 2.5 UseCases (`usecases/`)
- Constructor with port dependencies + event dispatcher
- Split by concern: one file per action group
- Business logic lives HERE
- Dispatch entity events after successful save
- **No infrastructure imports** — read Forbidden Imports from architecture doc

### Rule Check Phase 2
Run the **Domain Purity** check scripts from the stack architecture doc:
```bash
# Example (Go):
go build ./internal/domain/$DOMAIN/... && echo "PASS" || echo "FAIL"
go vet ./internal/domain/$DOMAIN/... && echo "PASS" || echo "FAIL"
grep -rn {forbidden_imports} internal/domain/$DOMAIN/ && echo "FAIL" || echo "PASS"

# Example (React):
npx tsc --noEmit && echo "PASS" || echo "FAIL"
grep -rn "from 'react'" src/domain/$DOMAIN/ && echo "FAIL" || echo "PASS"

# Example (Flutter):
dart analyze lib/domain/$DOMAIN/ && echo "PASS" || echo "FAIL"
grep -rn "package:flutter" lib/domain/$DOMAIN/ && echo "FAIL" || echo "PASS"
```

---

## PHASE 3: Build Infrastructure Layer

### 3.1 Persistence Models (if applicable)
- ORM models, Prisma schema, Freezed classes
- Table/collection configuration
- Helper functions for atomic updates

### 3.2 Store/API Implementation
- Implements port interfaces from domain
- Compile-time interface check (where language supports it)
- Mapper functions: domain entity ↔ persistence model
- NO business logic — pure persistence/communication
- Use context consistently

### Rule Check Phase 3
```bash
# Build infrastructure layer
{stack_build_command_for_infra}
```

---

## PHASE 4: Build Application Layer

### 4.1 Service
- Thin wrapper delegating to usecases
- Can orchestrate cross-domain calls if needed

### 4.2 Transport/Handler/Controller/Screen
- Registration/wiring function: create store → usecase → service → handler → routes
- Thin handlers: parse input → call service → return output
- DTOs in separate file

### 4.3 Listeners (if domain has events)
- One file per event
- Side-effects only (notifications, SSE, analytics, async jobs)
- Use background context for async work
- Register in event bus/registry

### Rule Check Phase 4
```bash
# Build application layer
{stack_build_command_for_application}
```

---

## PHASE 5: Registration & Wiring

### 5.1 Router/Provider Registration
- Add routes/screens/providers for the new module
- Wire service dependencies between modules if needed

### 5.2 Persistence Setup
- Add model migrations/schemas
- Run migrations if needed

### 5.3 Event Registry
- Register all new event listeners
- Verify event name strings match between events and registry

### Rule Check Phase 5
```bash
# Full build
{stack_full_build_command}
```

---

## PHASE 6: Domain Tests

### 6.1 Value Object Tests
- All status transitions
- Terminal states
- Behavior methods
- Edge cases

### 6.2 Entity Tests
- Constructor
- State transitions
- Event collection after state change
- Guard methods
- Edge cases (boundary values)

### 6.3 UseCase Tests
- Mock port interfaces
- Happy path for each method
- Validation errors
- Business rules
- Event dispatching

### Rule Check Phase 6
```bash
# Run domain tests
{stack_test_command_for_domain}
```

---

## REVIEW LOOP

After all phases complete, run the architecture review. **Keep looping until ALL checks pass.**

```
LOOP:
  1. Run /architect-review {stack} {domain}
  2. Collect violations
  3. IF violations with severity >= MEDIUM:
     a. Fix all violations
     b. Run build to verify
     c. Run tests to verify
     d. GOTO 1
  4. IF score >= B:
     BREAK → Final Report
```

---

## Final Report

When review loop passes:

```markdown
## Feature Complete: {domain}/{feature}

### Files Created
- List all new files

### Files Modified
- List all modified files

### Endpoints/Screens (depending on stack)
| Method/Route | Description |
|-------------|-------------|

### Domain Events
| Event | Listeners |
|-------|-----------|

### Test Coverage
- X test files, Y test functions
- Areas covered: value objects, entities, usecases

### Review Status: ALL CHECKS PASS
- Build: PASS
- Lint: PASS
- Domain purity: PASS
- Tests: PASS (X/X)
- Architecture score: {A/B}
```

---

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| PLAN | `@clean-architect` | Architecture design |
| IMPLEMENT | Stack-specific dev agent | Code per architecture |
| IMPLEMENT | `@db-designer` | Database schema |
| IMPLEMENT | `@api-designer` | API design |
| REVIEW | `@code-reviewer` | Code quality |
| REVIEW | `@security-audit` | Security check |
| TEST | `@test-writer` | Write tests |
