---
name: feature-refactor
description: DDD refactoring workflow with phase-based checks and review loop. Refactor existing code to DDD architecture or improve existing DDD structure. Use when user says "refactor", "clean up", "improve code", "restructure", "migrate to ddd", "refactor ddd".
args: "[MODULE] [DOMAIN]"
---

# DDD Refactor Workflow

Restructure existing code into DDD layers, or fix drift in an existing DDD module. **Preserves behavior** — refactor structure, never change logic.

**ARGUMENTS:** `<module> <domain>` — e.g., `marketing notification`, `users identity`, `products catalog`

## When to use this skill

- ✅ Migrating a legacy module into DDD layers
- ✅ Existing DDD module has drifted (fat controller, anemic entity, mixed concerns)
- ✅ Splitting one domain into multiple bounded contexts
- ❌ Building a brand-new feature → use `/feature-new`
- ❌ Just renaming files / variables → just do it
- ❌ Fixing a bug → use `/fix-hotfix` or `/fix-root-cause`

## Read Architecture First

Detect stack via `~/.claude/architecture/_shared/stack-detection.md`. Load `ddd-architecture.md` + stack doc.

---

## Workflow

```
0 FOUNDATION → 1 ANALYZE → 2 DOMAIN → 3 INFRA → 4 APP → 5 TESTS → 6 CLEANUP → REVIEW LOOP
```

Each phase has a Rule Check. Do not skip any phase.

---

## Phase 0: FOUNDATION

**New project (no `domain/` yet):** create
- `domain/shared/` — base event types, event collector, dispatcher interface
- Event bus infrastructure
- App bootstrap/config struct

**Existing project:** verify
```bash
ls {domain_root}/shared/ 2>/dev/null && echo PASS || echo NEED SETUP
ls {eventbus_path}/ 2>/dev/null && echo PASS || echo NEED SETUP
```

If FAIL → set up foundation before continuing.

### Gate
- [ ] Shared domain types exist
- [ ] Event infrastructure exists (if domain raises events)

---

## Phase 1: ANALYZE

**Goal:** read ALL source files in the old module before touching anything.

### Read
- All files in the module dir
- Related models / types / enums
- Routes / providers / screens for this module
- Existing tests (CRITICAL — used in Phase 5)

### Output to user
```markdown
## Refactor Plan: {module} → {domain}

### Current state
- Entities/models: {list with fields}
- Usecases (functions): {list with 1-line logic summary}
- DTOs: {list}
- Cross-module calls: {list}
- Side-effects: {notifications / SSE / analytics / async jobs}
- External deps: {DB, cache, messaging}
- Endpoints/screens: {list with method + path}
- Test files: {list with case counts}

### Proposed DDD structure
- Value objects to extract: {list}
- Entities: {list}
- Events: {list}
- Ports: {list}
- Usecases: {list}
- Listeners: {list}
```

### Gate
- [ ] All module files read
- [ ] Plan presented to user
- [ ] **User CONFIRMED** before continuing

---

## Phase 2: DOMAIN LAYER

Create `domain/{domain}/` (or add to existing).

### Order: VO → entities → events → ports → usecases

- **Value Objects** (`valueobjects/`) — extract typed values (status strings, rates, amounts). Immutable + behavior methods. Stdlib imports only.
- **Entities** (`entities/`) — convert old models. Constructor + behavior methods + event collection. Add mappers to/from persistence. No framework imports.
- **Events** (`events/`) — one file per event. Extract from existing direct side-effect calls.
- **Ports** (`ports/`) — one file per interface. Store ports (persistence), adapter ports (external services). Platform-agnostic naming (`URLParser` not `ShopeeURLParser`). No infra imports.
- **UseCases** (`usecases/`) — extract business logic from old controllers/handlers/services. Import from `ports/`. Split by concern, ≤200 lines/file. No infra imports.

### Gate
```bash
{build_domain} && echo PASS || echo FAIL
{grep_forbidden in domain/} && echo FAIL || echo PASS
{cross_domain_check} && echo FAIL || echo PASS
```

---

## Phase 3: INFRASTRUCTURE LAYER

- Implement port interfaces from `domain/{domain}/ports/`
- Mapper functions: domain entity ↔ persistence model
- Compile-time interface check (where supported)
- NO business logic
- Keep existing persistence models in place

### Gate
- [ ] Infra build passes
- [ ] All port interfaces implemented

---

## Phase 4: APPLICATION LAYER

### 4.1 Listeners (extract side-effects)
**CRITICAL:** Side-effects (notifications, SSE, analytics, jobs) **MUST NOT** be called directly in usecases or infra. Flow must be: entity collects event → usecase dispatches → listener handles.

- One file per event listener
- Register in event bus

### 4.2 Service
- Thin wrapper, delegates to usecases. No business logic.

### 4.3 Handler / Controller / Screen
- Registration / wiring function
- Thin: parse → service → return
- DTOs in separate file
- **All endpoints must match the old paths + methods**

### Gate
- [ ] App build passes
- [ ] Every old endpoint has a new handler at the same path

---

## Phase 5: TESTS

**CRITICAL:** read old tests first, copy every scenario. Do not lose coverage.

1. Read all old test files
2. List all test cases + business scenarios
3. Write domain tests covering all of them

### What to test
- **Entities** — behavior methods, edge cases, business rules (pure, no mocks)
- **UseCases** — happy + error paths, validation, event collection (mock ports)
- **Value Objects** — transitions, calculations, edge cases (pure)

### Gate
- [ ] Old test count ≤ new test count
- [ ] Every old scenario covered
- [ ] `{test_command}` passes

---

## Phase 6: INTEGRATION & CLEANUP

### 6.1 Wire up the new module
- Add registration calls in router / provider / registry
- Remove old module registrations
- Endpoints/screens match old paths

### 6.2 Remove old module
- Delete old directory **only after** build + tests pass
- Do NOT delete shared models/types other modules still use

### Gate
```bash
{full_build} && echo PASS || echo FAIL
test -d {old_module_path} && echo "FAIL: still there" || echo PASS
grep -r "{old_import_path}" --include="*.{ext}" . && echo "FAIL: stale imports" || echo PASS
```

---

## Review Loop

After Phase 6, call `/review-architect {stack} {domain}`. Loop until score ≥ B.

```
LOOP:
  1. /review-architect {stack} {domain}
  2. IF violations severity ≥ MEDIUM:
       fix all → full build → all tests → GOTO 1
  3. IF score ≥ B → BREAK
```

---

## Final Report

```markdown
## Refactor Complete: {module} → {domain}

### Changes
- Files created: {N}
- Files modified: {N}
- Files deleted: {N}

### Endpoints preserved
| Old path | New handler | Status |
|----------|-------------|--------|

### Domain events introduced
| Event | Listener(s) |
|-------|-------------|

### Tests
- Files: {N}, cases: {M}
- All old scenarios migrated: YES

### Review score: {A/B}
- Build / Lint / Domain purity / Old module removed / No stale imports / Tests: all PASS
```

---

## Hard Rules

- **Preserve behavior** — never change business logic during refactor
- **MUST read old tests** before writing new ones (no scenario lost)
- **MUST read old code** carefully — don't invent logic from variable names
- **All endpoints keep their paths** — refactor is invisible to clients
- **Don't skip phases** — Rule Checks gate the next phase
- **Multiple modules → same domain:** first module creates the domain dir, others add to it
- **One module at a time** — finish one before starting the next

---

## Related Skills

| When | Use |
|------|-----|
| Building from scratch (no existing code) | `/feature-new` |
| Just adding tests to untested code | `/review-tdd` |
| Reviewing the refactor before merging | `/review-branch` |
| Final architecture check (called automatically in review loop) | `/review-architect` |

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| ANALYZE | `@refactor` | Identify refactor scope |
| ANALYZE | `@code-reviewer` | Smell detection |
| PLAN | `@clean-architect` | Architecture alignment |
| BUILD | Stack-specific dev agent | Implementation |
| TESTS | `@test-writer` | Domain tests |
| REVIEW | `@code-reviewer` | Final quality check |
