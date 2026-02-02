---
name: tdd
description: Test-Driven Development workflow. Use when doing TDD, writing tests first, or when user says "tdd", "test first", "test driven", "red green refactor".
---

# Test-Driven Development (TDD) Workflow

Red-Green-Refactor cycle for test-first development with quality gates.

## IMPORTANT: Read Architecture First

**Before starting TDD, you MUST read the appropriate architecture reference:**

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

**Understand the test patterns and conventions defined in these files.**

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| RED | `@test-writer` | Write failing tests first |
| GREEN | `@react-frontend-dev`, `@go-backend-dev`, `@laravel-backend-dev`, `@flutter-mobile-dev`, `@remix-fullstack-dev` | Minimal implementation |
| REFACTOR | `@refactor` | Clean up code |
| REFACTOR | `@code-reviewer` | Review refactored code |
| REFACTOR | `@perf-optimizer` | Performance optimization |

## Workflow Overview

```
         ┌─────────────────────────────────┐
         │       TDD CYCLE                 │
         │                                 │
         │   ┌──────┐   ┌───────┐   ┌─────────┐
         │   │ RED  │──▶│ GREEN │──▶│REFACTOR │
         │   └──────┘   └───────┘   └─────────┘
         │       ▲                         │
         │       │                         │
         │       └─────────────────────────┘
         │           Next requirement
         └─────────────────────────────────┘

RED:      Write a failing test
GREEN:    Make it pass (minimal code)
REFACTOR: Improve code (keep tests green)
```

---

## Phase 1: RED - Write Failing Test

**Goal**: Write a test that fails because the feature doesn't exist yet

### Actions

1. **Read architecture doc** for test conventions:
   - Test file location pattern
   - Test framework/runner
   - Mocking patterns
   - Naming conventions

2. **Understand the requirement**:
   - What should this code do?
   - What are the inputs?
   - What are the expected outputs?
   - What are the edge cases?

3. **Write a single failing test**:
   ```
   // Start with ONE test for ONE behavior
   // Don't write multiple tests at once
   // Follow test patterns from architecture doc
   ```

4. **Run the test and verify it fails**:
   - Test MUST fail for the right reason
   - Failure message should be clear
   - If test passes unexpectedly → investigate

### Test Patterns by Stack

#### Flutter
```dart
// test/[feature]_test.dart
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('[Feature]', () {
    test('should [expected behavior]', () {
      // Arrange

      // Act

      // Assert
      expect(actual, expected);
    });
  });
}
```

#### React/TypeScript
```typescript
// src/[feature].test.ts
import { describe, it, expect } from 'vitest';

describe('[Feature]', () => {
  it('should [expected behavior]', () => {
    // Arrange

    // Act

    // Assert
    expect(actual).toBe(expected);
  });
});
```

#### Go
```go
// [package]_test.go
package mypackage

import "testing"

func Test[Feature](t *testing.T) {
    // Arrange

    // Act

    // Assert
    if got != want {
        t.Errorf("got %v, want %v", got, want)
    }
}
```

#### Laravel/PHP
```php
// tests/Unit/[Feature]Test.php
namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class FeatureTest extends TestCase
{
    public function test_should_expected_behavior()
    {
        // Arrange

        // Act

        // Assert
        $this->assertEquals($expected, $actual);
    }
}
```

### Output
```markdown
## RED Phase

### Test Written
**File**: [path to test file]
**Test Name**: `test_[behavior]`

### Test Code
[code snippet]

### Expected Failure
**Reason**: [why it should fail - feature not implemented]

### Test Run Result
```bash
[test command from architecture doc]
[failure output]
```
```

### Gate
- [ ] Architecture doc read for test patterns
- [ ] Single test written (AAA pattern)
- [ ] Test follows architecture conventions
- [ ] Test fails for the RIGHT reason
- [ ] Failure message is clear

---

## Phase 2: GREEN - Make It Pass

**Goal**: Write the minimal code to make the test pass (no more, no less)

### Principles

1. **Minimal code** - Write only enough to pass the test
2. **No gold-plating** - Don't add features not tested
3. **Simple first** - Hardcode if needed, refactor later
4. **Follow architecture** - Respect layer boundaries from doc

### Actions

1. **Read architecture doc** for implementation patterns:
   - Where to create the file
   - Naming conventions
   - Layer boundaries
   - Dependency injection patterns

2. **Write minimal implementation**:
   ```
   // Quick and dirty is OK at this stage
   // Even hardcoded values are fine if test passes
   // Focus on making test green, not perfect code
   ```

3. **Run the test**:
   ```bash
   # Use test command from architecture doc
   flutter test           # Flutter
   go test ./...          # Go
   bun test               # React/Remix
   php artisan test       # Laravel
   ```

4. **Verify test passes**:
   - Test goes from RED → GREEN
   - No other tests broken
   - All tests in suite still pass

### Implementation Examples

#### Start Simple
```typescript
// ❌ Don't write this first:
function calculate(a: number, b: number, operation: string): number {
  switch(operation) {
    case 'add': return a + b;
    case 'subtract': return a - b;
    case 'multiply': return a * b;
    default: throw new Error('Invalid operation');
  }
}

// ✅ Do write this first (if test only checks addition):
function calculate(a: number, b: number): number {
  return a + b; // Just make test pass
}
```

### Output
```markdown
## GREEN Phase

### Implementation
**File**: [path to implementation file]
**Architecture Reference**: [layer from doc]

### Code Written
[minimal code snippet]

### Test Run Result
```bash
[test command]
✓ All tests pass
```

### Verification
- [ ] Target test passes
- [ ] No existing tests broken
- [ ] Code follows architecture doc structure
```

### Gate
- [ ] Test passes (RED → GREEN)
- [ ] Minimal code written (no extras)
- [ ] Architecture boundaries respected
- [ ] All tests in suite pass

---

## Phase 3: REFACTOR - Improve Code

**Goal**: Clean up code while keeping all tests green

### Principles

1. **Keep tests green** - Run tests after each refactor
2. **Small steps** - One refactor at a time
3. **Follow architecture** - Improve architecture compliance
4. **No new functionality** - Tests stay same

### Refactoring Checklist

#### Code Quality
- [ ] Remove duplication (DRY)
- [ ] Improve naming (clear, descriptive)
- [ ] Extract methods/functions (SRP)
- [ ] Simplify logic (reduce complexity)
- [ ] Remove magic numbers/strings

#### Architecture Compliance
- [ ] Follow patterns from architecture doc
- [ ] Respect layer boundaries
- [ ] Use dependency injection (if in doc)
- [ ] Follow naming conventions from doc
- [ ] Match directory structure from doc

#### Test Quality
- [ ] Remove test duplication
- [ ] Improve test names
- [ ] Add test helpers (if needed)
- [ ] Follow test patterns from doc

### Actions

1. **Read architecture doc** for refactoring patterns

2. **Identify refactoring opportunities**:
   ```
   - Duplicated code?
   - Poor names?
   - Complex logic?
   - Architecture violations?
   - Performance issues?
   ```

3. **Refactor in small steps**:
   ```
   1. Make one small change
   2. Run tests → must stay GREEN
   3. Commit (optional)
   4. Repeat
   ```

4. **Run full test suite after each change**:
   ```bash
   # After EVERY refactor
   flutter test           # Flutter
   go test ./...          # Go
   bun test               # React/Remix
   php artisan test       # Laravel
   ```

### Refactoring Patterns

#### Extract Method
```typescript
// Before
function process(data: Data): Result {
  const cleaned = data.trim().toLowerCase();
  const validated = cleaned.length > 0 && cleaned.length < 100;
  if (!validated) throw new Error('Invalid');
  return { value: cleaned };
}

// After
function process(data: Data): Result {
  const cleaned = cleanData(data);
  validateData(cleaned);
  return createResult(cleaned);
}

function cleanData(data: Data): string {
  return data.trim().toLowerCase();
}

function validateData(data: string): void {
  if (data.length === 0 || data.length >= 100) {
    throw new Error('Invalid');
  }
}

function createResult(value: string): Result {
  return { value };
}
```

#### Remove Duplication
```go
// Before
func Add(a, b int) int {
    if a < 0 { return 0 }
    if b < 0 { return 0 }
    return a + b
}

func Subtract(a, b int) int {
    if a < 0 { return 0 }
    if b < 0 { return 0 }
    return a - b
}

// After
func Add(a, b int) int {
    return calculate(a, b, func(x, y int) int { return x + y })
}

func Subtract(a, b int) int {
    return calculate(a, b, func(x, y int) int { return x - y })
}

func calculate(a, b int, op func(int, int) int) int {
    if a < 0 || b < 0 { return 0 }
    return op(a, b)
}
```

#### Improve Architecture Compliance
```typescript
// Before (violates layer separation)
// ui/UserProfile.tsx
function UserProfile() {
  const user = fetch('/api/users/1').then(r => r.json()); // ❌ Direct API call
  return <div>{user.name}</div>;
}

// After (follows architecture doc)
// ui/UserProfile.tsx
function UserProfile() {
  const user = useUserRepository().getUser(1); // ✅ Uses repository layer
  return <div>{user.name}</div>;
}

// data/repositories/UserRepository.ts
export function useUserRepository() {
  return {
    getUser: (id: number) => fetch(`/api/users/${id}`).then(r => r.json())
  };
}
```

### Output
```markdown
## REFACTOR Phase

### Refactorings Applied

1. **[Refactoring Name]**
   - Before: [description/code]
   - After: [description/code]
   - Reason: [why this improves code]
   - Architecture compliance: [how it follows doc]

2. **[Refactoring Name]**
   - Before: [description/code]
   - After: [description/code]
   - Reason: [why this improves code]

### Test Run After Each Refactor
```bash
[test command]
✓ All tests still pass
```

### Architecture Compliance
- [ ] Follows patterns from [architecture doc]
- [ ] Layer boundaries respected
- [ ] Naming conventions followed
```

### Gate
- [ ] Code improved (cleaner, clearer)
- [ ] Architecture compliance improved
- [ ] All tests still pass (GREEN)
- [ ] No new functionality added
- [ ] Committed (optional)

---

## TDD Best Practices

### Test Quality

#### Good Test Names
```
✅ test_should_return_empty_list_when_no_items_found
✅ test_should_throw_error_when_invalid_email
✅ test_should_calculate_total_with_tax

❌ test_user
❌ test1
❌ test_it_works
```

#### AAA Pattern (Arrange-Act-Assert)
```typescript
test('should calculate discount', () => {
  // Arrange - Setup
  const price = 100;
  const discountPercent = 10;

  // Act - Execute
  const result = calculateDiscount(price, discountPercent);

  // Assert - Verify
  expect(result).toBe(90);
});
```

#### Test One Thing
```typescript
// ❌ Testing multiple things
test('user service', () => {
  expect(createUser()).toBeDefined();
  expect(updateUser()).toBeTruthy();
  expect(deleteUser()).toBeNull();
});

// ✅ One test per behavior
test('should create user with valid data', () => {
  expect(createUser(validData)).toBeDefined();
});

test('should update existing user', () => {
  expect(updateUser(user, newData)).toBeTruthy();
});

test('should delete user and return null', () => {
  expect(deleteUser(userId)).toBeNull();
});
```

### TDD Discipline

#### Write Test First
```
❌ Wrong order:
1. Write code
2. Write test
3. Run test

✅ TDD order:
1. Write test (RED)
2. Write code (GREEN)
3. Refactor (GREEN)
```

#### Smallest Steps
```
✅ Start with simplest test:
test('should return empty array when no input', () => {
  expect(process([])).toEqual([]);
});

Then build up:
test('should process single item', () => {
  expect(process([1])).toEqual([2]);
});

test('should process multiple items', () => {
  expect(process([1, 2, 3])).toEqual([2, 4, 6]);
});
```

#### Run Tests Frequently
```bash
# After writing test (should fail)
bun test

# After writing code (should pass)
bun test

# After refactoring (should still pass)
bun test

# Run tests constantly!
```

### Common TDD Mistakes

#### ❌ Writing Multiple Tests Before Code
```typescript
// Don't do this:
describe('Calculator', () => {
  test('should add', () => {});
  test('should subtract', () => {});
  test('should multiply', () => {});
  test('should divide', () => {});
});
// Then implement all at once

// Do this instead: One test at a time
// Write test for add → implement add → refactor
// Write test for subtract → implement subtract → refactor
// ...
```

#### ❌ Skipping RED Phase
```
Don't assume test will fail - VERIFY IT!

1. Write test
2. Run test → see it FAIL
3. Then write code

If test passes without implementation:
- Test might be wrong
- Feature might already exist
- False positive
```

#### ❌ Over-implementing in GREEN Phase
```typescript
// ❌ Test only checks addition, but you implement:
function calculate(a, b, operation) {
  switch(operation) {
    case 'add': return a + b;
    case 'subtract': return a - b; // Not tested!
    case 'multiply': return a * b; // Not tested!
  }
}

// ✅ Only implement what test needs:
function calculate(a, b) {
  return a + b; // Just this
}
```

#### ❌ Refactoring Without Running Tests
```
Every refactor MUST be followed by test run:

1. Extract method → run tests
2. Rename variable → run tests
3. Simplify logic → run tests

Never skip this step!
```

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

### TDD Cycle Summary
| Phase | Key Actions | Gate |
|-------|-------------|------|
| **RED** | Write failing test | Test fails (right reason) |
| **GREEN** | Minimal code to pass | Test passes |
| **REFACTOR** | Clean code | Tests still pass |

### Test Commands by Stack
```bash
# Flutter
flutter test
flutter test --coverage

# Go
go test ./...
go test -v ./...
go test -cover ./...

# React/Remix
bun test
bun test --coverage
bun test --watch

# Laravel
php artisan test
php artisan test --coverage
php artisan test --parallel
```

### Test File Locations
| Stack | Location Pattern |
|-------|------------------|
| Flutter | `test/[feature]_test.dart` |
| React | `src/[feature].test.ts` |
| Go | `[package]_test.go` (same dir) |
| Laravel | `tests/Unit/[Feature]Test.php` |
| Remix | `app/[feature].test.ts` |

### TDD Mantras

```
🔴 RED:      "Write a test that fails"
🟢 GREEN:    "Make it work"
🔵 REFACTOR: "Make it right"

"Test first, code second"
"One test, one behavior"
"Minimal code, maximum coverage"
"Refactor fearlessly, tests protect you"
```

### When to Loop Back

- After REFACTOR → Return to RED for next behavior
- Test won't fail → Fix the test (RED)
- Test won't pass → Fix the code (GREEN)
- Code is messy → Refactor (REFACTOR)

### Success Criteria

TDD session complete when:
1. All behaviors have tests (RED → GREEN)
2. Code is clean (REFACTOR)
3. All tests pass
4. Architecture compliance verified
5. No TODO/hardcoded values left

---

## TDD Workflow Example

### Example: Implementing a Shopping Cart

#### Cycle 1: Add item

**RED**
```typescript
test('should add item to empty cart', () => {
  const cart = new ShoppingCart();
  cart.addItem({ id: 1, name: 'Book', price: 10 });
  expect(cart.items).toHaveLength(1);
});
// Run: ❌ FAIL - ShoppingCart not defined
```

**GREEN**
```typescript
class ShoppingCart {
  items: Item[] = [];
  addItem(item: Item) {
    this.items.push(item);
  }
}
// Run: ✅ PASS
```

**REFACTOR**
```typescript
// Code is clean, nothing to refactor
// Run: ✅ PASS
```

#### Cycle 2: Calculate total

**RED**
```typescript
test('should calculate total of items', () => {
  const cart = new ShoppingCart();
  cart.addItem({ id: 1, name: 'Book', price: 10 });
  cart.addItem({ id: 2, name: 'Pen', price: 5 });
  expect(cart.getTotal()).toBe(15);
});
// Run: ❌ FAIL - getTotal is not a function
```

**GREEN**
```typescript
class ShoppingCart {
  items: Item[] = [];

  addItem(item: Item) {
    this.items.push(item);
  }

  getTotal() {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }
}
// Run: ✅ PASS
```

**REFACTOR**
```typescript
// Extract calculation logic
class ShoppingCart {
  items: Item[] = [];

  addItem(item: Item) {
    this.items.push(item);
  }

  getTotal() {
    return this.calculateTotal(this.items);
  }

  private calculateTotal(items: Item[]): number {
    return items.reduce((sum, item) => sum + item.price, 0);
  }
}
// Run: ✅ PASS
```

#### Cycle 3: Continue for each behavior...

---

## Resources

### Learn More
- Kent Beck's "Test Driven Development: By Example"
- Martin Fowler's "Refactoring"
- Uncle Bob's TDD tutorials

### Test Frameworks
| Stack | Framework |
|-------|-----------|
| Flutter | flutter_test, mockito |
| React | Vitest, Jest, Testing Library |
| Go | testing (stdlib), testify |
| Laravel | PHPUnit, Pest |
| Remix | Vitest, Playwright |
