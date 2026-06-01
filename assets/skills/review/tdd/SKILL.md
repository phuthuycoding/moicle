---
name: review-tdd
description: Test-Driven Development workflow. Use when doing TDD, writing tests first, or when user says "tdd", "test first", "test driven", "red green refactor".
---

# Test-Driven Development (TDD) Workflow

Red-Green-Refactor cycle: write failing test → write minimal code to pass → refactor while green.

## When to use this skill

- ✅ Logic with clear input → output behavior (parsers, validators, business rules, usecases)
- ✅ Fixing a bug — failing test first, then fix (regression guard)
- ✅ Refactoring critical code where you need a safety net
- ❌ UI prototyping / visual tweaks → manual is faster
- ❌ Exploratory spike → use `/research-spike` (throwaway, no tests)
- ❌ One-line config change → just change it

## Read Architecture First

Detect stack via `~/.claude/architecture/_shared/stack-detection.md`. Architecture doc tells you:
- Test file location convention (`_test.go` next to source, `__tests__/`, `tests/Feature/`, etc.)
- Test framework (Go `testing`, Jest, Pest, `flutter_test`)
- Mocking pattern for ports
- AAA layout convention

---

## The TDD Cycle

```
       ┌──────┐    ┌───────┐    ┌──────────┐
   ┌──▶│ RED  │───▶│ GREEN │───▶│ REFACTOR │──┐
   │   └──────┘    └───────┘    └──────────┘  │
   │   (fail)      (minimal)    (cleanup)     │
   └──────────────────────────────────────────┘
              next requirement
```

---

## Phase 1: RED — failing test

**Goal:** describe wanted behavior with a test that fails because the code doesn't exist yet.

### Steps
1. Pick ONE small requirement (smallest verifiable behavior)
2. Name the test as a sentence describing behavior
3. Arrange: inputs + mocks
4. Act: call the method
5. Assert: verify output / state / interaction
6. Run — it MUST fail (compile error or assertion fail). If it passes, the test is wrong.

### Test naming
- `should_<behavior>_when_<condition>` (snake_case for Go / Python)
- `it("returns X when Y", ...)` (Jest / Mocha)
- `test_<behavior>_<condition>` (PHPUnit / Pest)

### AAA pattern
```
// Arrange — set up inputs and mocks
// Act     — call function under test
// Assert  — verify result / state / interactions
```

### Gate
- [ ] Test fails for the RIGHT reason (not a typo / missing import)
- [ ] Name describes behavior, not implementation
- [ ] One behavior per test

---

## Phase 2: GREEN — minimal code to pass

**Goal:** smallest amount of code to pass. **Resist** "doing it properly" — refactor is next.

### Rules
- **Minimal** means: hardcode return values if the test allows it; triangulate with more tests
- Don't add code not required by a test
- Don't add error handling unless a test requires it
- Don't generalize until 3+ tests force it

### Steps
1. Confirm RED
2. Write just enough code to pass
3. Run all tests — all must stay green
4. If others broke, you're not minimal — revert + try smaller

### Gate
- [ ] New test passes
- [ ] All previous tests still pass
- [ ] No untested behavior added

---

## Phase 3: REFACTOR — clean up while green

**Goal:** improve structure without changing behavior. Tests stay green throughout.

### What to refactor
- **Duplication** — extract function / method / class
- **Long methods** — split when one does multiple things
- **Bad names** — rename to reveal intent (the most underrated refactor)
- **Dead branches** — remove code no test exercises
- **Coupling** — break dependencies that make tests painful

### Rules
- **Run tests after every change** — green is your safety net
- **One refactor at a time** — extract method, run tests, rename, run tests, …
- **No new behavior** — if a refactor needs a new test, go back to RED

### When NOT to refactor
- Tests are flaky → fix flakiness first
- Under time pressure → skip, leave a `// TODO: refactor` linked to a follow-up
- Code about to be deleted → don't polish trash

### Gate
- [ ] All tests still green
- [ ] No new public API added
- [ ] Code easier to read than before

---

## Test patterns per layer (DDD)

| Layer | Test type | Dependencies | Example |
|-------|-----------|--------------|---------|
| Value Object | Unit (pure) | None | `Money.add()` |
| Entity | Unit (pure) | None | `Order.cancel()` raises event |
| UseCase | Unit | Mock ports | `CreateOrder` calls `OrderStore.save()` |
| Service | Unit | Mock usecase | Delegates correctly |
| Handler / Controller | Integration | Real router, mock service | `POST /orders` returns 201 |
| Infrastructure | Integration | Real DB / testcontainers | `OrderRepository.save()` persists |
| Listener | Unit | Mock infra | `on_order_created` sends email |
| API contract (cross-service) | Contract test | Real / sandboxed external | OpenAPI / Pact / Wiremock |

### Mock vs real — decision table

| Dependency type | Use real | Use stub / fake | Use mock |
|-----------------|----------|-----------------|----------|
| Value objects, entities (pure) | ✅ always | — | never (brittle) |
| Stdlib (time, fs, env) | mostly — use clock / fs abstraction in domain | for determinism | rarely |
| Repository / port | testcontainers in infra tests | in-memory fake for usecase tests | only when verifying call args |
| External HTTP API | sandbox URL in integration | wiremock / msw for predictable cases | for failure-mode tests |
| Auth / session | real in integration | fake user in unit | rarely |
| Time | clock abstraction | fixed clock in tests | rarely |

**Stub vs fake vs mock:**
- **Stub** — returns canned values (`returnsBalance(100)`)
- **Fake** — working in-memory implementation (`InMemoryOrderStore`)
- **Mock** — records calls + verifies them (`expect(store.save).toHaveBeenCalledWith(...)`)

Prefer **fake** for repository tests (closest to real behavior). Use **mock** only when call args are the assertion.

### Property-based testing

For pure logic with many edge cases (parsers, math, encoders), use property-based tests:

- Go: `testing/quick`, `gopter`
- TS / JS: `fast-check`
- Python: `hypothesis`
- Dart: `glados`

Pattern: "for all valid input X, property P holds." Generates 100s of cases including edge cases you wouldn't think of.

Example (TS, fast-check):
```ts
test("reverse twice = identity", () => {
  fc.assert(fc.property(fc.array(fc.string()), (arr) => {
    expect(reverse(reverse(arr))).toEqual(arr);
  }));
});
```

Use it for: serializers, parsers, math, sorting, encoding/decoding. Not for: business workflows.

---

## Common Mistakes

| Mistake | Why it's bad | Fix |
|---------|--------------|-----|
| Writing tests AFTER the code | Tests what's written, not what's needed | Always RED first |
| Testing implementation, not behavior | Refactor breaks tests | Assert outputs / observable state |
| One test, many behaviors | Failure message unclear | One behavior per test |
| Mocking value objects | Brittle, no benefit | Use real — they're pure |
| Skipping REFACTOR | Tech debt accumulates | It's a phase, not optional |
| Test depends on order | Flaky | Each test sets up its own state |
| Slow tests (>1s each) | People stop running them | Move to integration tier; keep unit <100ms |
| 100% coverage chase | Forces tests for trivial code | Aim for high-value coverage on domain |

---

## Final Report

```markdown
## TDD Cycle Complete: {feature}

### Cycles
| # | RED (behavior) | GREEN (code added) | REFACTOR |
|---|----------------|--------------------|----------|
| 1 | rejects negative amount | guard in constructor | extracted validator |
| 2 | transitions PENDING → ACTIVE | added transition method | — |

### Test Coverage
- {N} tests, all passing
- Domain coverage: {%} (target ≥80%)

### Files
- Tests: {paths}
- Code:  {paths}
```

---

## Hard Rules

- **RED first, always** — no production code without a failing test driving it
- **Minimal GREEN** — hardcode if test allows; triangulate later
- **REFACTOR is a phase, not optional**
- **All tests green at all times** (except briefly during RED)
- **One behavior per test**, named after the behavior
- **Unit tests <100ms each** — slow tests don't get run
- **Test behavior, not implementation** — refactor must not break tests

---

## Related Skills

| When | Use |
|------|-----|
| Building feature from scratch (with TDD inside) | `/feature-new` + this skill |
| Adding regression test for a bug | `/fix-hotfix` or `/fix-root-cause` → then this skill |
| Refactoring untested legacy code | `/feature-refactor` (add tests first) |
| Reviewing test quality on a PR | `/review-pr` |

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| RED | `@test-writer` | Failing tests first |
| GREEN | Stack-specific dev agent | Minimal implementation |
| REFACTOR | `@refactor` | Patterns + cleanup |
| REFACTOR | `@code-reviewer` | Review refactored code |
| REFACTOR | `@perf-optimizer` | Perf tweaks (only with benchmarks) |
