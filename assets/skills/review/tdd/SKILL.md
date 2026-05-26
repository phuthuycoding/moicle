---
name: review-tdd
description: Test-Driven Development workflow. Use when doing TDD, writing tests first, or when user says "tdd", "test first", "test driven", "red green refactor".
---

# Test-Driven Development (TDD) Workflow

Red-Green-Refactor cycle: write failing test → write minimal code to pass → refactor while keeping tests green.

## When to use this skill

- ✅ Implementing logic with clear input → output behavior (parsers, validators, business rules, usecases)
- ✅ Fixing a bug — write the failing test first, then fix (regression guard)
- ✅ Refactoring critical code where you need a safety net
- ❌ UI prototyping / visual tweaks → manual is faster
- ❌ Exploratory spike → use `/research:spike` (throwaway code, no tests needed)
- ❌ One-line config change → just change it

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

## Read Architecture First

Read the stack architecture doc for:
- Test file location convention (e.g., `_test.go` next to source, `__tests__/` for Jest)
- Test framework (Go testing, Jest, Pest, Flutter test)
- Mocking patterns for ports (interfaces)
- AAA (Arrange-Act-Assert) layout

---

## Phase 1: RED — Write a failing test

**Goal:** describe the behavior you want with a test that fails because the code doesn't exist yet.

### Steps
1. Pick ONE small requirement (the smallest behavior you can verify)
2. Write the test name as a sentence describing the behavior
3. Arrange: set up inputs and mocks
4. Act: call the method
5. Assert: verify the expected output / state change / event raised
6. Run the test — it MUST fail (compile error or assertion fail). If it passes, the test is wrong.

### Test name conventions
- `should_<expected_behavior>_when_<condition>` (snake_case for Go/Python)
- `it("returns X when Y", ...)` (Jest / Mocha)
- `test_<behavior>_<condition>` (PHPUnit)

### AAA pattern
```
// Arrange — set up inputs and mocks
// Act     — call the function under test
// Assert  — verify result / state / interactions
```

### Gate
- [ ] Test fails for the RIGHT reason (compile error or assertion fail, not a typo)
- [ ] Test name describes behavior, not implementation
- [ ] Only ONE behavior tested per test

---

## Phase 2: GREEN — Make it pass with minimal code

**Goal:** write the smallest amount of code that makes the test pass. **Resist** the urge to "do it properly" — refactor comes next.

### Rules
- **Minimal** means: hardcode return values if the test allows it; you'll triangulate with more tests
- Don't add code not required by a test
- Don't add error handling unless a test requires it
- Don't generalize until 3+ tests force you to

### Steps
1. Run the failing test (confirm RED)
2. Write just enough code to make it green
3. Run all tests — all must pass (not just the new one)
4. If other tests broke, you're not minimal — revert and try smaller

### Gate
- [ ] New test passes
- [ ] All previous tests still pass
- [ ] No untested behavior added

---

## Phase 3: REFACTOR — Clean up while green

**Goal:** improve structure without changing behavior. Tests must stay green throughout.

### What to refactor
- **Duplication** — extract function / method / class
- **Long methods** — split when one method does multiple things
- **Bad names** — rename to reveal intent (most underrated refactor)
- **Dead branches** — remove code no test exercises
- **Coupling** — break dependencies that make tests painful

### Rules
- **Run tests after every change** — green is the safety net
- **One refactor at a time** — extract method, run tests, rename, run tests, …
- **No new behavior** — if a refactor needs a new test, you're not refactoring, go back to RED

### When NOT to refactor
- Tests are flaky — fix the flakiness first
- You're under time pressure — skip refactor, leave a TODO with link to a follow-up task
- The code will be deleted soon — don't polish trash

### Gate
- [ ] All tests still green
- [ ] No new public API added
- [ ] Code is easier to read than before

---

## Test patterns per layer (DDD)

| Layer | Test type | Dependencies | Example |
|-------|-----------|--------------|---------|
| Value Object | Unit (pure) | None | `Money.add()` |
| Entity | Unit (pure) | None | `Order.cancel()` raises event |
| UseCase | Unit | Mock ports | `CreateOrder` calls `OrderStore.save()` |
| Handler / Controller | Integration | Real router, mock service | `POST /orders` returns 201 |
| Infrastructure | Integration | Real DB / testcontainers | `OrderRepository.save()` persists |
| Listener | Unit | Mock infra | `on_order_created` sends email |

### Mock vs real
- Mock **interfaces** (ports), not concrete classes
- Use real value objects and entities in tests — they're pure, no need to mock
- Use real DB in infra tests via testcontainers or in-memory variant

---

## Common Mistakes

| Mistake | Why it's bad | Fix |
|---------|--------------|-----|
| Writing tests AFTER the code | You'll test what's written, not what's needed | Always RED first |
| Testing implementation, not behavior | Refactor breaks tests | Assert on outputs / observable state |
| One test covers many behaviors | Fail message is unclear | One behavior per test |
| Mocking value objects | Brittle, no real benefit | Use real ones — they're pure |
| Skipping the REFACTOR phase | Tech debt accumulates | It's a phase, not optional |
| Test depends on order | Flaky | Each test sets up its own state |

---

## Final Report

```markdown
## TDD Cycle Complete: {feature}

### Cycles Done
| # | RED behavior | GREEN | REFACTOR |
|---|-------------|-------|----------|
| 1 | {behavior} | {code added} | {what cleaned} |
| 2 | ... | ... | ... |

### Test Coverage
- {N} tests, all passing
- Coverage: {%} (target: ≥80% for domain layer)

### Files
- Tests: {paths}
- Code: {paths}
```

---

## Hard Rules

- **RED first, always** — never write production code without a failing test driving it
- **Minimal GREEN** — hardcode if the test allows it; triangulate later
- **REFACTOR is a phase, not optional**
- **All tests green at all times** (except briefly during RED)
- **One behavior per test**, named after the behavior

---

## Related Skills

| When | Use |
|------|-----|
| Building a feature from scratch (with TDD inside) | `/feature:new` + this skill |
| Adding regression test for a bug | `/fix:hotfix` or `/fix:root-cause` → then this skill |
| Refactoring untested legacy code (add tests first) | `refactor` |
| Reviewing test quality on a PR | `/review:pr` |

---

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| RED | `@test-writer` | Write failing tests first |
| GREEN | Stack-specific dev agent | Minimal implementation |
| REFACTOR | `@refactor` | Clean up patterns |
| REFACTOR | `@code-reviewer` | Review refactored code |
| REFACTOR | `@perf-optimizer` | Performance tweaks (only with benchmarks) |
