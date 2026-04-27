---
name: tdd
description: "Guide development through the Red-Green-Refactor cycle: write failing tests first, implement minimal code to pass, then refactor for quality — with architecture-aware test patterns and validation gates at each phase. Use when doing TDD, writing tests first, or when user says 'tdd', 'test first', 'test driven', 'red green refactor'."
user-invocable: true
triggers:
  - tdd
  - test first
  - test driven
  - red green refactor
  - writing tests first
---

# Test-Driven Development (TDD) Workflow

Red-Green-Refactor cycle for test-first development with architecture-aware patterns and quality gates.

## IMPORTANT: Read Architecture First

Read the appropriate architecture reference for test conventions, file locations, and framework choices:

- Global: `~/.claude/architecture/` (clean-architecture.md, flutter-mobile.md, react-frontend.md, go-backend.md, laravel-backend.md, remix-fullstack.md, monorepo.md)
- Project-specific: `.claude/architecture/` (overrides global if present)

## Workflow

```
┌──────┐   ┌───────┐   ┌─────────┐
│ RED  │──▶│ GREEN │──▶│REFACTOR │──▶ Next requirement → RED
└──────┘   └───────┘   └─────────┘
```

---

## Phase 1: RED — Write Failing Test

**Goal**: Write a test that fails because the feature doesn't exist yet.

1. Read architecture doc for: test file location pattern, test framework/runner, mocking patterns, naming conventions
2. Understand the requirement: inputs, expected outputs, edge cases
3. Write **one test for one behavior** using AAA pattern (Arrange-Act-Assert)
4. Run the test and verify it fails **for the right reason**

### Test locations by stack

| Stack | Location | Command |
|-------|----------|---------|
| Flutter | `test/[feature]_test.dart` | `flutter test` |
| React/Remix | `src/[feature].test.ts` | `bun test` |
| Go | `[package]_test.go` (same dir) | `go test ./...` |
| Laravel | `tests/Unit/[Feature]Test.php` | `php artisan test` |

### Gate
- [ ] Single test written following architecture conventions
- [ ] Test fails for the right reason
- [ ] Failure message is clear

---

## Phase 2: GREEN — Make It Pass

**Goal**: Write the **minimal** code to make the test pass. No more, no less.

1. Read architecture doc for: file creation location, naming conventions, layer boundaries, dependency injection
2. Write only enough code to pass the test — hardcoded values are fine at this stage
3. Run the test: must go from RED → GREEN
4. Verify no other tests are broken

**Key discipline**: Do not add features that aren't tested. Even if you know you'll need subtraction, if only addition is tested, only implement addition.

### Gate
- [ ] Target test passes
- [ ] No existing tests broken
- [ ] Minimal code written — no extras
- [ ] Architecture boundaries respected

---

## Phase 3: REFACTOR — Improve Code

**Goal**: Clean up code while keeping all tests green. No new functionality.

1. Read architecture doc for refactoring patterns
2. Identify opportunities: duplication, poor names, complex logic, architecture violations
3. Refactor in small steps — **run tests after every change**:
   ```bash
   flutter test        # Flutter
   go test ./...       # Go
   bun test            # React/Remix
   php artisan test    # Laravel
   ```
4. Focus on: removing duplication, improving naming, extracting methods (SRP), improving architecture compliance (layer boundaries, dependency injection, naming conventions from doc)

### Gate
- [ ] Code is cleaner and clearer
- [ ] Architecture compliance improved
- [ ] All tests still pass
- [ ] No new functionality added

---

## Repeat

After REFACTOR, return to RED for the next behavior. Continue the cycle until:
1. All required behaviors have tests
2. Code is clean and follows architecture patterns
3. All tests pass
4. No TODO or hardcoded values remain
