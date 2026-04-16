---
name: architect-review
description: DDD architecture compliance review with automated checks and review loop. Use when user says "architect-review", "architecture review", "review architecture", "check architecture", "review ddd", "ddd review".
args: "[ARCHITECTURE_NAME] [DOMAIN]"
---

# DDD Architecture Review

Review codebase against DDD architecture guidelines with automated checks and a review loop that keeps fixing until all checks pass.

## Usage

```bash
/architect-review go-backend wallet
/architect-review react-frontend
/architect-review
```

## Supported Architectures

Check for architecture files in these locations (in order):
1. **Project-specific**: `.claude/architecture/`
2. **Global**: `~/.claude/architecture/`

### Built-in Architectures

| Name | File | Aliases |
|------|------|---------|
| `ddd-architecture` | `ddd-architecture.md` | `ddd`, `core` |
| `go-backend` | `go-backend.md` | `go` |
| `react-frontend` | `react-frontend.md` | `react` |
| `flutter-mobile` | `flutter-mobile.md` | `flutter` |
| `laravel-backend` | `laravel-backend.md` | `laravel` |
| `remix-fullstack` | `remix-fullstack.md` | `remix` |
| `monorepo` | `monorepo.md` | `mono` |

---

## Phase 0: RESOLVE ARCHITECTURE

### If argument provided
1. Normalize name using alias table
2. Search: `.claude/architecture/{name}.md` → `~/.claude/architecture/{name}.md`
3. Found → Phase 1
4. Not found → REJECT with available architectures list. **STOP.**

### If NO argument
1. Auto-detect stack from project files:
   - `go.mod` → `go-backend`
   - `package.json` + `vite.config` → `react-frontend`
   - `pubspec.yaml` → `flutter-mobile`
   - `composer.json` → `laravel-backend`
   - `remix.config` → `remix-fullstack`
2. If detected → confirm with user
3. If not detected → list available, ask user to select

### Gate
- [ ] Architecture file loaded
- [ ] Domain name identified (if provided)

---

## Phase 1: LOAD GUIDELINE & EXTRACT RULES

Read the architecture file completely. Also read `ddd-architecture.md` (core DDD spec) as the base reference.

### Extract from architecture doc:

1. **DDD Directory Structure** — expected folder layout
2. **Layer Rules** — import/dependency rules per layer
3. **Hard Rules** — forbidden imports, naming conventions
4. **Forbidden Imports** — specific packages/modules NOT allowed in domain
5. **Check Scripts** — automated bash commands for validation
6. **Wiring Pattern** — how modules are registered
7. **Test Patterns** — how each layer should be tested

### Gate
- [ ] Core DDD rules loaded
- [ ] Stack-specific rules loaded
- [ ] Check scripts extracted
- [ ] Review checklist prepared

---

## Phase 2: AUTOMATED CHECKS

Run the check scripts from the architecture doc. These vary per stack but follow this pattern:

### Standard Checks (all stacks)

```bash
echo "=== R1: Build ==="
{stack_build_command} && echo "PASS" || echo "FAIL"

echo "=== R2: Lint/Vet ==="
{stack_lint_command} && echo "PASS" || echo "FAIL"

echo "=== R3: Domain Purity (no framework imports) ==="
{grep_forbidden_imports_in_domain} && echo "FAIL" || echo "PASS"

echo "=== R4: No Cross-Domain Imports ==="
{check_domain_A_not_importing_domain_B} && echo "FAIL" || echo "PASS"

echo "=== R5: No Circular Imports ==="
{build_and_check_cycles} && echo "FAIL" || echo "PASS"

echo "=== R6: Tests Exist ==="
{find_test_files_in_domain} | wc -l

echo "=== R7: Tests Pass ==="
{stack_test_command} && echo "PASS" || echo "FAIL"

echo "=== R8: Wiring Registered ==="
{check_routes_or_providers_registered}

echo "=== R9: Event Names Match Registry ==="
{check_event_names_consistency}

echo "=== R10: Async Context Safety ==="
{check_no_request_context_in_goroutines}
```

### Stack-Specific Check Scripts

Read the **Check Scripts** section from the loaded architecture doc and run those exact commands.

### Output
Record PASS/FAIL for each check. Continue to Phase 3 regardless — manual review catches what automated checks miss.

### Gate
- [ ] All automated checks executed
- [ ] Results recorded

---

## Phase 3: ARCHITECTURE REVIEW (Manual)

Read files and check DDD compliance. Focus on **architecture structure**, NOT business logic correctness.

### 3.1 Directory Structure

| # | Check | What to look for |
|---|-------|-----------------|
| D1 | Domain dir exists | `domain/{domain}/` with proper subdirs |
| D2 | Required subdirs | `entities/`, `ports/`, `usecases/` at minimum |
| D3 | Value objects separate | `valueobjects/` dir, NOT mixed in `entities/` |
| D4 | Events separate | `events/` dir with 1 file per event |
| D5 | Application layer | `application/ports/{transport}/`, `services/`, `listeners/` |
| D6 | Infrastructure layer | Implements port interfaces |
| D7 | No legacy dirs | No `modules/`, `pkg/` (for Go), or flat structure |

### 3.2 Entities

| # | Check | What to look for |
|---|-------|-----------------|
| E1 | Has constructor | Factory function/method: `New{Entity}()`, `create()`, etc. |
| E2 | Has behavior methods | State transitions, calculations, guard checks — NOT anemic |
| E3 | Raises domain events | Collects/emits events on state changes |
| E4 | No framework imports | Only stdlib + domain/shared + valueobjects |
| E5 | Has mappers (if applicable) | ToModel/FromModel or equivalent for persistence mapping |

### 3.3 Value Objects

| # | Check | What to look for |
|---|-------|-----------------|
| VO1 | Separate directory | In `valueobjects/`, NOT in `entities/` |
| VO2 | Only stdlib imports | No external packages, no domain/shared |
| VO3 | Immutable with behavior | Typed values with query methods (IsPending, CanTransitionTo) |
| VO4 | Used by entities/ports | Entities and ports reference VO types, not raw strings |

### 3.4 Ports

| # | Check | What to look for |
|---|-------|-----------------|
| P1 | `ports/` folder exists | MUST have `ports/` — inline interfaces in usecases is a violation |
| P2 | One file per port | `{store_name}.go/.ts/.dart/.php` — not all in one file |
| P3 | Interface + related DTOs | Each file has interface + its param/result types |
| P4 | Domain types in signatures | Return entities/VOs, not primitives for typed values |
| P5 | Platform-agnostic naming | `URLParser`, NOT `ShopeeURLParser` |
| P6 | No infrastructure imports | Only stdlib + entities + valueobjects + shared |

### 3.5 Events

| # | Check | What to look for |
|---|-------|-----------------|
| EV1 | One file per event | `{event_name}` naming, not multiple events in one file |
| EV2 | Extends base event | Embeds/extends shared BaseEvent |
| EV3 | Carries data for listeners | UserID, amounts, names — enough for side-effects |
| EV4 | Name matches registry | Event name string matches event bus registration |

### 3.6 UseCases

| # | Check | What to look for |
|---|-------|-----------------|
| U1 | Uses port interfaces | From `ports/` package, NOT inline interface definitions |
| U2 | Split by concern | One file per action group, max ~200 lines per file |
| U3 | Business logic lives here | Not in controller, not in store, not in service |
| U4 | No infrastructure imports | No ORM, no HTTP framework, no cache client |
| U5 | Dispatches domain events | After successful persistence, dispatches collected events |
| U6 | No `deps.go` or similar | Interfaces MUST be in `ports/`, not inline |

### 3.7 Services

| # | Check | What to look for |
|---|-------|-----------------|
| SVC1 | Thin wrapper | Delegates to usecases, no business logic |
| SVC2 | No infrastructure imports | No ORM, no HTTP framework |

### 3.8 Handlers/Controllers

| # | Check | What to look for |
|---|-------|-----------------|
| H1 | Registration function | `Register{Module}Routes` or equivalent wiring |
| H2 | Thin handlers | Parse input -> call service -> return output |
| H3 | No business logic | Logic is in usecases, not here |
| H4 | DTOs separate | Request/Response types in separate file |

### 3.9 Listeners

| # | Check | What to look for |
|---|-------|-----------------|
| L1 | One per event | `on_{event_name}` naming |
| L2 | Side-effects only | Notifications, SSE, analytics — no business logic |
| L3 | Registered in event bus | Listed in registry/event bus setup |
| L4 | Background context | Async work uses background context, not request context |

### 3.10 Infrastructure/Store

| # | Check | What to look for |
|---|-------|-----------------|
| I1 | Implements port interface | All methods from the port interface |
| I2 | Has mappers | Converts between domain entities and persistence models |
| I3 | No business logic | Pure persistence — queries, saves, deletes |
| I4 | Compile-time check | Interface compliance verified at compile time (where possible) |

### Gate
- [ ] All 10 areas reviewed
- [ ] Findings categorized by severity

---

## Phase 4: REPORT

### Severity Levels

| Level | Meaning | Examples |
|-------|---------|---------|
| **CRITICAL** | Architecture broken | Build fails, circular imports, domain imports framework |
| **HIGH** | DDD violation | Cross-domain import, business logic in wrong layer, no ports dir, inline interfaces |
| **MEDIUM** | Structure issue | Anemic entity, fat controller, missing events, missing tests, missing json tags |
| **LOW** | Convention issue | File naming, redundant code, DTOs in wrong package |

**ALL levels must be fixed.**

### Report Template

```markdown
## Architecture Review: {architecture} / {domain}

### Automated Checks
| # | Check | Status |
|---|-------|--------|
| R1 | Build | PASS/FAIL |
| R2 | Lint/Vet | PASS/FAIL |
| R3 | Domain purity | PASS/FAIL |
| R4 | No cross-domain imports | PASS/FAIL |
| R5 | No circular imports | PASS/FAIL |
| R6 | Tests exist | PASS/WARN |
| R7 | Tests pass | PASS/FAIL |
| R8 | Wiring registered | PASS/FAIL |
| R9 | Event names consistent | PASS/N/A |
| R10 | Async context safety | PASS/N/A |

### Architecture Review
| Area | Status | Violations |
|------|--------|------------|
| Directory Structure (D1-D7) | OK/ISSUE | ... |
| Entities (E1-E5) | OK/ISSUE | ... |
| Value Objects (VO1-VO4) | OK/ISSUE | ... |
| Ports (P1-P6) | OK/ISSUE | ... |
| Events (EV1-EV4) | OK/N/A | ... |
| UseCases (U1-U6) | OK/ISSUE | ... |
| Services (SVC1-SVC2) | OK/ISSUE | ... |
| Handlers (H1-H4) | OK/ISSUE | ... |
| Listeners (L1-L4) | OK/N/A | ... |
| Infrastructure (I1-I4) | OK/ISSUE | ... |

### Violations Found
1. [SEVERITY] Code — file:line — description
2. ...

### Recommended Fixes
1. Fix description
2. ...

### Overall Score: {A/B/C/D/F}
```

### Scoring

| Score | Criteria |
|-------|----------|
| **A** | 0 violations, all automated checks PASS |
| **B** | 0 CRITICAL/HIGH, max 3 MEDIUM |
| **C** | 0 CRITICAL, max 2 HIGH |
| **D** | Has CRITICAL or 3+ HIGH |
| **F** | Multiple CRITICAL, architecture fundamentally broken |

### Gate
- [ ] Report generated
- [ ] Score calculated
- [ ] All violations listed with file:line

---

## Phase 5: REVIEW LOOP (if user confirms fix)

**Keep looping until ALL checks pass and score is A or B.**

```
LOOP:
  1. Fix all violations found in report
  2. Run automated checks (Phase 2)
  3. Run architecture review (Phase 3)
  4. Collect violations
  5. IF violations with severity >= MEDIUM:
     a. Fix violations
     b. GOTO 1
  6. IF only LOW violations or none:
     BREAK → Report final status
```

### After Each Fix Iteration
```bash
# Verify build still works
{stack_build_command}

# Verify tests still pass
{stack_test_command}

# Re-check domain purity
{grep_forbidden_imports_in_domain}
```

---

## Calling from Other Skills

This skill is designed to be called by `new-feature` and `refactor` skills at the end of their workflows:

```
# From new-feature skill, after Phase 5 (registration):
→ Run /architect-review {detected_stack} {domain}
→ Review loop until score >= B

# From refactor skill, after Phase 4 (cleanup):
→ Run /architect-review {detected_stack} {domain}
→ Review loop until score >= B
```

When called from another skill:
- Skip Phase 0 (architecture already known)
- Skip user confirmation for fixes (auto-fix in loop)
- Report final score back to calling skill

---

## Quick Reference

### Architecture Files Location
```
.claude/architecture/{name}.md     # Project-specific (priority)
~/.claude/architecture/{name}.md   # Global
```

### Aliases
```
ddd → ddd-architecture
go → go-backend
react → react-frontend
flutter → flutter-mobile
laravel → laravel-backend
remix → remix-fullstack
mono → monorepo
```

### Review Areas (10)
```
D: Directory Structure    E: Entities        VO: Value Objects
P: Ports                  EV: Events         U: UseCases
SVC: Services             H: Handlers        L: Listeners
I: Infrastructure
```
