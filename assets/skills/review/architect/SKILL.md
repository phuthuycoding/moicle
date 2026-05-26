---
name: review-architect
description: DDD architecture compliance review with automated checks and review loop. Use when user says "architect-review", "architecture review", "review architecture", "check architecture", "review ddd", "ddd review".
args: "[ARCHITECTURE_NAME] [DOMAIN]"
---

# DDD Architecture Review

Audit a codebase (or a single domain) against DDD rules with automated checks, manual review, and a fix loop until score ≥ B.

## When to use this skill

- ✅ Verify DDD compliance after `/feature:new` or `/feature:refactor`
- ✅ Periodic audit of an existing codebase
- ✅ Quality gate before merging architectural changes
- ❌ Full PR review (arch + code + security + tests) → use `/review:pr`
- ❌ Self-review own branch before push → use `/review:branch`
- ❌ Security-only audit → use `@security-audit` agent

## Usage

```
/review:architect <architecture> [domain]
/review:architect              # auto-detect stack
```

Examples: `/review:architect go-backend wallet`, `/review:architect react-frontend`.

## Supported architectures

Aliases: `ddd → ddd-architecture`, `go → go-backend`, `react → react-frontend`, `flutter → flutter-mobile`, `laravel → laravel-backend`, `remix → remix-fullstack`, `nestjs → nodejs-nestjs`, `mono → monorepo`.

Files live at `.claude/architecture/{name}.md` (project) → `~/.claude/architecture/{name}.md` (global).

---

## Workflow

```
RESOLVE → LOAD RULES → AUTOMATED CHECKS → MANUAL REVIEW → REPORT → FIX LOOP
```

---

## Phase 0: RESOLVE ARCHITECTURE

### Argument provided
1. Normalize via alias table → search project then global
2. Found → Phase 1. Not found → reject with available list, STOP.

### No argument
1. Detect stack via `~/.claude/architecture/_shared/stack-detection.md`
2. Detected → confirm with user. Not detected → list options, ask.

### Gate
- [ ] Architecture file loaded
- [ ] Domain identified (if scoped)

---

## Phase 1: LOAD RULES

Read `ddd-architecture.md` (core) + the stack doc. Extract:
- DDD directory layout
- Layer import rules + forbidden imports
- Hard rules (HR1-HR15)
- Stack-specific check scripts
- Wiring + test patterns

### Gate
- [ ] Core + stack rules loaded
- [ ] Check scripts extracted
- [ ] Review checklist prepared

---

## Phase 2: AUTOMATED CHECKS

Run the stack-specific check scripts from the architecture doc. They follow this universal pattern (adapt per stack):

```bash
echo "R1: Build"        ; {build}        && echo PASS || echo FAIL
echo "R2: Lint/Vet"     ; {lint}         && echo PASS || echo FAIL
echo "R3: Domain pure"  ; {grep_forbidden in domain/} && echo FAIL || echo PASS
echo "R4: No cross-dom" ; {grep_domain_A in domain_B} && echo FAIL || echo PASS
echo "R5: No cycles"    ; {cycle_check}  && echo FAIL || echo PASS
echo "R6: Tests exist"  ; {find_tests_in_domain} | wc -l
echo "R7: Tests pass"   ; {test}         && echo PASS || echo FAIL
echo "R8: Wiring reg"   ; {check_routes_registered}
echo "R9: Event names"  ; {check_event_consistency}
echo "R10: Async ctx"   ; {check_no_request_context_in_goroutines}
```

Record PASS/FAIL per check. Continue to Phase 3 either way — manual review catches what automated misses.

### Gate
- [ ] All 10 automated checks run
- [ ] PASS/FAIL recorded

---

## Phase 3: MANUAL REVIEW

Focus on **architecture structure**, not business correctness. 10 areas:

### D — Directory Structure
- D1 `domain/{domain}/` exists with proper subdirs
- D2 Has `entities/`, `ports/`, `usecases/` at minimum
- D3 `valueobjects/` separate (not mixed in entities)
- D4 `events/` separate, 1 file per event
- D5 Application layer: `ports/{transport}/`, `services/`, `listeners/`
- D6 Infrastructure implements ports
- D7 No legacy dirs (`modules/`, flat structure)

### E — Entities
- E1 Has constructor (`New{Entity}` / `create()`)
- E2 Has behavior methods (NOT anemic)
- E3 Raises domain events on state change
- E4 No framework imports
- E5 Has mappers (if persisted)

### VO — Value Objects
- VO1 In `valueobjects/`, not entities
- VO2 Only stdlib imports
- VO3 Immutable with behavior methods
- VO4 Used by entities + ports (not raw strings)

### P — Ports
- P1 `ports/` dir exists (no inline interfaces in usecases)
- P2 One file per port
- P3 Each file has interface + related DTOs
- P4 Domain types in signatures (not primitives)
- P5 Platform-agnostic naming (`URLParser` not `ShopeeURLParser`)
- P6 No infrastructure imports

### EV — Events
- EV1 One file per event
- EV2 Extends base event type
- EV3 Carries data for listeners
- EV4 Name matches registry

### U — UseCases
- U1 Uses port interfaces (not inline)
- U2 Split by concern (≤200 lines/file)
- U3 Business logic lives here (not in handler / store / service)
- U4 No infrastructure imports
- U5 Dispatches events after persistence
- U6 No `deps.go` inline interfaces

### SVC — Services
- SVC1 Thin wrapper, delegates to usecases
- SVC2 No infrastructure imports

### H — Handlers / Controllers
- H1 Has registration function
- H2 Thin (parse → service → respond)
- H3 No business logic
- H4 DTOs in separate file

### L — Listeners
- L1 One per event (`on_{event}` naming)
- L2 Side-effects only
- L3 Registered in event bus
- L4 Background context (not request ctx)

### I — Infrastructure
- I1 Implements port interface
- I2 Has mappers (domain ↔ persistence)
- I3 No business logic
- I4 Compile-time interface check (where possible)

### Gate
- [ ] All 10 areas reviewed
- [ ] Findings categorized by severity (see `~/.claude/architecture/_shared/severity-levels.md`)

---

## Phase 4: REPORT

```markdown
## Architecture Review: {architecture} / {domain}

### Automated (R1-R10)
| # | Check | Status |
|---|-------|--------|
| R1 | Build | PASS/FAIL |
| ... | ... | ... |

### Manual review
| Area | Status | Violations |
|------|--------|------------|
| Directory (D1-D7) | OK / ISSUE | ... |
| Entities (E1-E5) | OK / ISSUE | ... |
| ... | ... | ... |

### Violations
1. [SEVERITY] code:file:line — description
2. ...

### Recommended fixes
1. ...

### Overall Score: {A/B/C/D/F}
```

### Scoring

| Score | Criteria |
|-------|----------|
| **A** | 0 violations, all R1-R10 PASS |
| **B** | 0 CRITICAL/HIGH, max 3 MEDIUM |
| **C** | 0 CRITICAL, max 2 HIGH |
| **D** | Has CRITICAL or 3+ HIGH |
| **F** | Multiple CRITICAL — architecture broken |

### Gate
- [ ] Report generated
- [ ] Score calculated
- [ ] All violations have file:line

---

## Phase 5: FIX LOOP (if user confirms)

```
LOOP:
  1. Fix all violations
  2. Re-run automated checks (Phase 2)
  3. Re-run manual review (Phase 3)
  4. IF violations severity ≥ MEDIUM → GOTO 1
  5. IF only LOW or none → BREAK, final report
```

Verify after each iteration: build passes, tests pass, domain purity holds.

---

## Calling from other skills

`/feature:new` and `/feature:refactor` call this skill at the end of their workflows. When called from another skill:
- Skip Phase 0 (architecture already known)
- Skip user confirmation for fixes (auto-fix in loop)
- Report final score back to caller

---

## Hard Rules

- **All CRITICAL/HIGH must be fixed** before merge
- **MEDIUM allowed with waiver** (explicit decision + comment)
- **Don't grade-inflate** — if it's a HIGH, mark HIGH
- **Don't skip Phase 3** — automated checks miss structural issues
- **File:line for every violation** — author shouldn't have to grep

---

## Related Skills

| When | Use |
|------|-----|
| Full PR review (arch + code + security + tests) | `/review:pr` |
| Self-review own branch before push | `/review:branch` |
| Refactor to fix violations | `/feature:refactor` |
| Add tests if missing | `/review:tdd` |
| Called from `/feature:new` / `/feature:refactor` | automatic |

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| LOAD | `@clean-architect` | Interpret architecture rules |
| AUTOMATED | `@devops` | Build / lint / test scripts |
| MANUAL | `@code-reviewer` | Spot violations |
| FIX | Stack-specific dev agent | Apply fixes |
