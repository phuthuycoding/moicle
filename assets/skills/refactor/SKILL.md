---
name: refactor
description: DDD refactoring workflow with phase-based checks and review loop. Refactor existing code to DDD architecture or improve existing DDD structure. Use when user says "refactor", "clean up", "improve code", "restructure", "migrate to ddd", "refactor ddd".
args: "[MODULE] [DOMAIN]"
---

# DDD Refactor Workflow

Refactor existing code into DDD architecture, or improve existing DDD structure. Execute phases sequentially, run rule checks after each phase.

**ARGUMENTS:** `<module> <domain>` — e.g., `marketing notification`, `users identity`, `products catalog`

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
PHASE 0: Foundation Check
  → PHASE 1: Analyze Current Module
  → PHASE 2: Build Domain Layer
  → PHASE 3: Build Infrastructure Layer
  → PHASE 4: Build Application Layer
  → PHASE 5: Domain Tests
  → PHASE 6: Integration & Cleanup
  → REVIEW LOOP (run /architect-review, fix, repeat until clean)
```

Each phase has a Rule Check. DO NOT skip any phase.

---

## PHASE 0: Foundation Check

Verify DDD foundation exists in the project.

### For new DDD projects (no domain/ dir yet)
Create shared foundation:
- `domain/shared/` — base event types, event collector, event dispatcher interface
- Event bus / dispatcher infrastructure
- Bootstrap/app config struct

### For existing DDD projects
Verify foundation is intact:
```bash
# Check shared domain types exist
ls {domain_root}/shared/ 2>/dev/null && echo "PASS" || echo "NEED SETUP"

# Check event infrastructure exists (if applicable)
ls {eventbus_path}/ 2>/dev/null && echo "PASS" || echo "NEED SETUP"
```

If any FAIL → create foundation first before proceeding.

---

## PHASE 1: Analyze Current Module

Read ALL source files before making any changes.

### Actions
1. Read all files in the current module/feature directory
2. Read related models/types
3. Read related enums/constants
4. Read current routes/screens/providers for this module

### Output (report to user)
- All entities/models and their fields
- All usecases (functions/methods) and their logic
- All DTOs (request/response structs)
- All validators (if any)
- All cross-module calls
- All events/side-effects (notifications, SSE, analytics)
- All external dependencies (DB, cache, messaging, etc.)
- All endpoints/screens/UI elements

### Rule Check Phase 1
- [ ] All module files read and understood
- [ ] All entities, usecases, dependencies, endpoints listed
- [ ] Report presented to user and **CONFIRM received** before continuing

---

## PHASE 2: Create Domain Layer

Create `domain/{domain}/` (if first module in this domain) or add to existing.

### 2.1 Value Objects (`valueobjects/`)
- Extract typed values from existing code (status strings, rates, amounts)
- Immutable with behavior methods
- **Only stdlib imports** — check Forbidden Imports from architecture doc

### 2.2 Entities (`entities/`)
- Convert existing model fields to domain entity
- Add constructor function/method
- Add behavior methods (state transitions, calculations)
- Add event collection (collect events on state changes)
- Add mappers to/from persistence models (if applicable)
- **No framework imports**

### 2.3 Events (`events/`)
- One file per domain event
- Extend/embed base event type
- Carry data needed by listeners
- Extract from existing direct side-effect calls (SSE, notifications, etc.)

### 2.4 Ports (`ports/`)
- One file per port interface
- Store ports: persistence interface from existing repository/DB calls
- Adapter ports: external service interfaces
- Platform-agnostic naming
- **No infrastructure imports**

### 2.5 UseCases (`usecases/`)
- Extract business logic from existing controllers/handlers/services
- Import port interfaces from `ports/`
- Split by concern: one file per action group
- Business logic lives HERE
- **No infrastructure imports**

### Rule Check Phase 2
Run check scripts from architecture doc:
```bash
# Build domain layer
{stack_build_command_for_domain}

# Check domain purity
{grep_forbidden_imports_in_domain} && echo "FAIL" || echo "PASS"

# Check no cross-domain imports
{check_cross_domain_imports}
```

---

## PHASE 3: Create Infrastructure Layer

### 3.1 Store/API Implementation
- Implement interfaces from `domain/{domain}/ports/`
- Use mapper functions (domain entity ↔ persistence model)
- Compile-time interface check (where possible)
- NO business logic — pure persistence
- Keep existing persistence models where they are

### Rule Check Phase 3
```bash
# Build infrastructure
{stack_build_command_for_infra}
```

---

## PHASE 4: Create Application Layer

### 4.1 Listeners (extract from existing side-effects)
- **CRITICAL:** Side-effects (notifications, SSE, analytics, async jobs) MUST NOT be called directly in usecases or infrastructure
- They MUST flow through: entity collects events → usecase dispatches → listener handles
- One file per event listener
- Register in event bus/registry

### 4.2 Service
- Thin wrapper delegating to domain usecases
- NO business logic

### 4.3 Handler/Controller/Screen
- Registration/wiring function
- Thin: parse input → call service → return output
- DTOs in separate file
- All endpoints/routes must match the old ones (same path + method)

### Rule Check Phase 4
```bash
# Build application layer
{stack_build_command_for_application}
```

---

## PHASE 5: Domain Tests

**CRITICAL:** MUST read old tests before writing new ones. Copy all test cases and business scenarios to domain tests. Do not lose any test coverage.

### 5.1 Process
1. Read ALL test files in old module
2. List all test cases and business scenarios
3. Write domain tests covering all those scenarios
4. Focus on business logic (pure unit tests, no integration needed yet)

### 5.2 Entity Tests
- Behavior methods (state transitions, validations, calculations)
- Edge cases (zero values, boundary conditions)
- Business rules
- NO mocking needed — pure tests

### 5.3 UseCase Tests
- Mock port interfaces
- All business flows (happy path + error cases)
- Input validation
- Domain event collection (if applicable)

### Rule Check Phase 5
```bash
# Run domain tests
{stack_test_command_for_domain}
```

---

## PHASE 6: Integration & Cleanup

### 6.1 Update Router/Provider/Registry
- Add new registration calls
- Remove old module routes/registrations
- All endpoints/screens must match the old ones

### 6.2 Remove Old Module
- Delete old module directory ONLY AFTER verifying build + test pass
- DO NOT delete shared models/types that other modules still use

### Rule Check Phase 6
```bash
# Full build
{stack_full_build_command}

# Verify old module removed
test -d {old_module_path} && echo "FAIL: old module exists" || echo "PASS"

# Verify no old imports remain
grep -r "{old_module_import}" --include="*.{ext}" . && echo "FAIL: old imports" || echo "PASS"
```

---

## REVIEW LOOP

After all phases complete, run the full architecture review. **Keep looping until ALL checks pass.**

```
LOOP:
  1. Run /architect-review {stack} {domain}
  2. Collect violations
  3. IF violations with severity >= MEDIUM:
     a. Fix all violations
     b. Run full build to verify
     c. Run all tests to verify
     d. GOTO 1
  4. IF score >= B:
     BREAK → Final Report
```

---

## Final Report

When review loop passes with score >= B:

```markdown
## Refactor Complete: {module} → {domain}

### Files Created
- List all new files

### Files Modified
- List all modified files

### Files Deleted
- List old module files removed

### Endpoints/Screens Preserved
| Before | After | Status |
|--------|-------|--------|
| All old routes | Same routes, new handlers | Verified |

### Domain Events
| Event | Listeners |
|-------|-----------|

### Test Coverage
- X test files, Y test functions
- All old test cases migrated: YES
- Areas covered: value objects, entities, usecases

### Review Status: ALL CHECKS PASS
- Build: PASS
- Lint: PASS
- Domain purity: PASS
- Old module removed: PASS
- No old imports: PASS
- Tests: PASS (X/X)
- Architecture score: {A/B}
```

---

## Interaction Rules

1. After each phase, report Rule Check results to user
2. If a rule fails → auto-fix if you know how, otherwise ask user
3. **DO NOT skip any phase** — all rules must pass before moving to next
4. If unsure about business logic → **READ the old code carefully, DO NOT invent new logic**
5. Preserve behavior — refactor structure only, DO NOT change logic
6. **MUST read old test files** before writing new tests
7. When multiple modules map to same domain → first module creates domain dir, subsequent add to it
8. After completing a module, ask user if they want to refactor the next module

---

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| ANALYZE | `@refactor` | Identify refactoring opportunities |
| ANALYZE | `@code-reviewer` | Code smell detection |
| PLAN | `@clean-architect` | Architecture alignment |
| REFACTOR | Stack-specific dev agent | Code per architecture |
| TEST | `@test-writer` | Write domain tests |
| REVIEW | `@code-reviewer` | Final quality check |
