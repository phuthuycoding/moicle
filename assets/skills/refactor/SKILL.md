---
name: refactor
description: Refactoring workflow for improving code quality without changing behavior. Use when refactoring, cleaning up code, improving structure, or when user says "refactor", "clean up", "improve code", "restructure".
---

# Refactoring Workflow

Systematic workflow for improving code quality and structure without changing external behavior.

## IMPORTANT: Read Architecture First

**Before refactoring, you MUST read the appropriate architecture reference:**

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

**Refactoring should align code with these architecture patterns.**

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| ANALYZE | `@refactor` | Identify refactoring opportunities |
| ANALYZE | `@code-reviewer` | Code smell detection |
| PLAN | `@clean-architect` | Architecture alignment strategy |
| REFACTOR | `@react-frontend-dev`, `@go-backend-dev`, `@laravel-backend-dev`, `@flutter-mobile-dev`, `@remix-fullstack-dev` | Stack-specific refactoring |
| TEST | `@test-writer` | Regression tests |
| REVIEW | `@code-reviewer` | Final quality check |
| REVIEW | `@perf-optimizer` | Performance validation |

## Workflow Overview

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│1. ANALYZE│──▶│ 2. PLAN  │──▶│3. REFACTOR──▶│ 4. TEST  │──▶│5. REVIEW │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
                                    │              │              │
                                    │     Fail?    │              │
                                    └──────◀───────┴──────◀───────┘
                                          Feedback Loop
```

---

## Phase 1: ANALYZE

**Goal**: Identify code smells and improvement opportunities

### Actions
1. **Identify project stack and read architecture doc**

2. Analyze codebase for common issues:
   ```
   Code Smells:
   - Long methods (> 50 lines)
   - Large classes (> 300 lines)
   - Duplicate code
   - Deep nesting (> 3 levels)
   - Long parameter lists (> 4 params)
   - God classes/modules
   - Feature envy
   - Data clumps
   - Primitive obsession
   ```

3. Check architecture compliance:
   - [ ] Layer boundaries violated?
   - [ ] Circular dependencies?
   - [ ] Missing abstractions?
   - [ ] Wrong patterns used?
   - [ ] Naming conventions violated?

4. Assess technical debt:
   ```bash
   # Find TODOs and FIXMEs
   grep -r "TODO\|FIXME\|HACK\|XXX" --exclude-dir=node_modules --exclude-dir=vendor

   # Check test coverage
   [use coverage tool from architecture doc]

   # Find large files
   find . -type f -name "*.ts" -o -name "*.go" -o -name "*.php" -o -name "*.dart" | xargs wc -l | sort -rn | head -20
   ```

### Output
```markdown
## Refactoring Analysis

### Stack & Architecture
- Stack: [Flutter/React/Go/Laravel/Remix]
- Architecture Doc: [path to doc]

### Code Smells Found
1. [Smell]: [location] - [description]
2. [Smell]: [location] - [description]

### Architecture Violations
- [ ] Layer X depends on Layer Y (should be reversed)
- [ ] Missing [pattern] from architecture doc
- [ ] Naming doesn't follow [convention from doc]

### Technical Debt Areas
- [ ] Area 1: [description]
- [ ] Area 2: [description]

### Metrics
- Large files (> 300 lines): [count]
- Duplicate code blocks: [count]
- Test coverage: [percentage]
- TODO/FIXME count: [count]
```

### Gate
- [ ] Architecture doc read
- [ ] Code smells identified
- [ ] Architecture violations documented
- [ ] Scope defined

---

## Phase 2: PLAN

**Goal**: Design refactoring strategy aligned with architecture

### Actions
1. **Re-read architecture doc** for target patterns

2. Prioritize refactorings:
   ```
   Priority Matrix:
   HIGH IMPACT + LOW RISK → Do first
   HIGH IMPACT + HIGH RISK → Plan carefully
   LOW IMPACT + LOW RISK  → Do if time permits
   LOW IMPACT + HIGH RISK → Skip
   ```

3. Break down into incremental steps:
   - Each step should be small
   - Each step should be testable
   - Each step should compile
   - Follow architecture patterns

4. Identify risks:
   - [ ] Breaking changes possible?
   - [ ] Performance impact?
   - [ ] Dependencies affected?
   - [ ] Rollback plan needed?

### Planning Template
```markdown
## Refactoring Plan

### Architecture Reference
- Doc: [path to architecture doc]
- Target patterns: [patterns from doc]

### Strategy
Move from: [current structure]
Move to: [architecture-compliant structure]

### Incremental Steps (smallest possible)
1. [Step 1] - Risk: [Low/Medium/High]
   - Files: [list]
   - Pattern: [pattern from doc]
   - Estimated effort: [time]

2. [Step 2] - Risk: [Low/Medium/High]
   - Files: [list]
   - Pattern: [pattern from doc]
   - Estimated effort: [time]

3. [Continue...]

### Risks & Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| [Risk 1] | [High/Medium/Low] | [How to mitigate] |

### Success Criteria
- [ ] Code follows architecture doc
- [ ] All tests pass
- [ ] No behavior changes
- [ ] Performance maintained/improved
- [ ] Complexity reduced
```

### Gate
- [ ] Plan follows architecture doc
- [ ] Steps are incremental
- [ ] Risks identified
- [ ] Rollback plan exists

---

## Phase 3: REFACTOR

**Goal**: Execute refactoring incrementally following architecture

### Principles
1. **Red-Green-Refactor** - Tests must pass after each step
2. **Small steps** - One pattern at a time
3. **Frequent commits** - Commit after each successful step
4. **No behavior change** - External behavior stays same
5. **Follow architecture** - Align with patterns from doc

### Actions

1. Create refactor branch:
   ```bash
   git checkout -b refactor/[scope]-[description]
   ```

2. **Read architecture doc** for implementation patterns

3. For each refactoring step:

   a. **Before refactoring**:
   ```bash
   # Run tests to establish baseline
   [test command from architecture doc]

   # Create checkpoint
   git add .
   git commit -m "refactor: checkpoint before [step description]"
   ```

   b. **Apply one refactoring pattern**:
   - Extract Method
   - Extract Class
   - Rename for Clarity
   - Move Method
   - Replace Conditional with Polymorphism
   - Introduce Parameter Object
   - Remove Duplication
   - Simplify Conditional Logic
   - Break Up Large Class
   - Extract Interface

   Follow patterns and naming from architecture doc

   c. **After refactoring**:
   ```bash
   # Verify tests still pass
   [test command from architecture doc]

   # Commit if successful
   git add .
   git commit -m "refactor: [what was done]"
   ```

   d. **If tests fail**:
   ```bash
   # Rollback
   git reset --hard HEAD

   # Re-analyze and try smaller step
   ```

4. Follow directory structure from architecture doc:
   ```
   [Use exact structure defined in architecture doc]
   ```

### Common Refactoring Patterns

#### Extract Method
```
Before:
function processOrder() {
  // 50 lines of code
  // validation logic
  // business logic
  // persistence logic
}

After (following architecture doc):
function processOrder() {
  validateOrder();
  applyBusinessRules();
  persistOrder();
}
```

#### Extract Class (following architecture layers)
```
Before:
class User {
  // user data
  // authentication logic
  // email sending logic
  // persistence logic
}

After (following architecture doc):
- entities/User (domain)
- services/AuthService (use case)
- services/EmailService (use case)
- repositories/UserRepository (data)
```

#### Introduce Parameter Object
```
Before:
function createUser(name, email, phone, address, city, zip)

After:
interface CreateUserDTO {
  name: string;
  email: string;
  phone: string;
  address: Address;
}
function createUser(dto: CreateUserDTO)
```

### Gate
- [ ] All refactoring steps completed
- [ ] Code follows architecture doc patterns
- [ ] Tests pass after each step
- [ ] Code compiles without warnings
- [ ] No behavior changes

---

## Phase 4: TEST

**Goal**: Ensure refactoring didn't break anything

### Actions

1. **Read testing section from architecture doc**

2. Run full test suite (command from doc):
   ```bash
   flutter test              # Flutter
   flutter test --coverage

   go test ./...             # Go
   go test -cover ./...

   bun test                  # React/Remix
   bun test --coverage

   php artisan test          # Laravel
   php artisan test --coverage
   ```

3. Verify test coverage didn't decrease:
   ```bash
   # Compare coverage before/after
   # Coverage should stay same or improve
   ```

4. Add tests for refactored areas (following doc patterns):
   ```
   Before refactor: 70% coverage
   After refactor: 70%+ coverage (should not decrease)
   ```

5. Manual smoke testing:
   - [ ] Critical user flows work
   - [ ] No visual regressions (if UI)
   - [ ] Performance is same/better
   - [ ] Error handling works

6. Run linter/formatter (tools from architecture doc):
   ```bash
   # Use tools specified in architecture doc
   flutter analyze         # Flutter
   golangci-lint run      # Go
   eslint . --fix         # React/Remix
   ./vendor/bin/pint      # Laravel
   ```

### Testing Checklist
```markdown
## Test Results

### Automated Tests
- [ ] Unit tests: [X/Y passed]
- [ ] Integration tests: [X/Y passed]
- [ ] E2E tests: [X/Y passed]

### Coverage
- Before: [percentage]
- After: [percentage]
- Change: [+/-]

### Manual Tests
- [ ] Critical flow 1: [Pass/Fail]
- [ ] Critical flow 2: [Pass/Fail]
- [ ] Error scenarios: [Pass/Fail]

### Quality Checks
- [ ] Linter: [Pass/Fail]
- [ ] Type checker: [Pass/Fail]
- [ ] Build: [Pass/Fail]
```

### Gate
- [ ] All tests pass
- [ ] Coverage maintained/improved
- [ ] Manual tests pass
- [ ] Quality checks pass

### Feedback Loop
If tests fail:
1. Identify which refactoring step broke it
2. Use git bisect if needed: `git bisect start`
3. Return to REFACTOR phase
4. Fix or rollback that step
5. Re-test

---

## Phase 5: REVIEW

**Goal**: Verify improvements and architecture compliance

### Actions

1. **Compare with architecture doc**:
   - [ ] Layers properly separated
   - [ ] Dependencies flow correctly (from doc)
   - [ ] Patterns used correctly
   - [ ] Naming follows conventions
   - [ ] Directory structure matches doc

2. Measure improvements:
   ```markdown
   ## Metrics Comparison

   | Metric | Before | After | Change |
   |--------|--------|-------|--------|
   | Avg method length | X lines | Y lines | -Z% |
   | Avg class size | X lines | Y lines | -Z% |
   | Cyclomatic complexity | X | Y | -Z% |
   | Duplicate code | X blocks | Y blocks | -Z% |
   | Test coverage | X% | Y% | +Z% |
   | Build time | X sec | Y sec | -Z% |
   ```

3. Code review checklist:
   - [ ] Code is more readable
   - [ ] Code is more maintainable
   - [ ] Complexity reduced
   - [ ] Duplication removed
   - [ ] Architecture violations fixed
   - [ ] No over-engineering

4. Performance check:
   ```bash
   # Run performance tests
   # Compare with baseline
   # Should be same or better
   ```

5. Security check:
   - [ ] No new vulnerabilities introduced
   - [ ] Security patterns still apply
   - [ ] Input validation intact
   - [ ] Authentication/authorization unchanged

### Review Output
```markdown
## Refactoring Review

### Architecture Compliance: [Pass/Fail]
- Reference: [architecture doc path]
- Violations fixed: [list]
- Remaining issues: [list]

### Quality Improvements: [Good/Excellent]
| Aspect | Rating | Notes |
|--------|--------|-------|
| Readability | [1-5] | [comments] |
| Maintainability | [1-5] | [comments] |
| Testability | [1-5] | [comments] |
| Simplicity | [1-5] | [comments] |

### Metrics: [Improved/Same/Worse]
[Insert metrics table from above]

### Performance: [Improved/Same/Worse]
[Performance test results]

### Security: [Pass/Fail]
[Security check results]

### Recommendation: [Approve/Revise]
```

### Gate
- [ ] Architecture doc followed
- [ ] Code quality improved
- [ ] Metrics show improvement
- [ ] Performance maintained/improved
- [ ] Security maintained

### Feedback Loop
If review fails:
- Return to REFACTOR phase
- Address issues found
- Re-test and re-review

---

## Phase 6: COMPLETE

**Goal**: Finalize and document the refactoring

### Actions

1. Final cleanup:
   - [ ] Remove debug code
   - [ ] Remove commented code
   - [ ] Update documentation
   - [ ] Remove TODOs added during refactor
   - [ ] Format code (using tool from doc)

2. Squash commits (optional):
   ```bash
   # If many small commits, consider squashing
   git rebase -i HEAD~[number of commits]
   ```

3. Create meaningful commit:
   ```bash
   git add .
   git commit -m "$(cat <<'EOF'
   refactor: [scope] - [what was improved]

   Architecture compliance:
   - [Pattern 1 from doc applied]
   - [Pattern 2 from doc applied]

   Improvements:
   - [Improvement 1]
   - [Improvement 2]

   Metrics:
   - Complexity: -X%
   - Duplication: -Y%
   - Test coverage: +Z%
   EOF
   )"
   ```

4. Create PR:
   ```bash
   gh pr create --title "refactor: [scope] - [description]" --body "$(cat <<'EOF'
   ## Summary
   Refactored [area] to align with [architecture doc patterns]

   ## Architecture Reference
   - Doc: [path to architecture doc]
   - Patterns applied: [list]

   ## What Changed
   - [Change 1]
   - [Change 2]
   - [Change 3]

   ## Why
   - [Reason 1]
   - [Reason 2]

   ## Metrics
   | Metric | Before | After | Change |
   |--------|--------|-------|--------|
   | [Metric 1] | X | Y | -Z% |
   | [Metric 2] | X | Y | +Z% |

   ## Testing
   - [ ] All tests pass
   - [ ] Coverage maintained: [X%]
   - [ ] Manual testing complete
   - [ ] Performance validated

   ## Behavior
   - [ ] No external behavior changes
   - [ ] API unchanged (if applicable)
   - [ ] UI unchanged (if applicable)

   ## Checklist
   - [ ] Follows architecture doc
   - [ ] Tests pass
   - [ ] Code reviewed
   - [ ] Metrics improved
   EOF
   )"
   ```

5. Documentation (if needed):
   - Update README if structure changed
   - Update architecture docs if patterns evolved
   - Add migration guide if needed

### Completion Checklist
- [ ] Code follows architecture doc
- [ ] All tests passing
- [ ] Metrics improved
- [ ] Performance maintained/improved
- [ ] Documentation updated
- [ ] PR created
- [ ] No behavior changes

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

### Common Code Smells

| Smell | Description | Refactoring |
|-------|-------------|-------------|
| Long Method | Method > 50 lines | Extract Method |
| Large Class | Class > 300 lines | Extract Class |
| Long Parameter List | > 4 parameters | Introduce Parameter Object |
| Duplicate Code | Same code in multiple places | Extract Method/Class |
| Data Clumps | Same data items together | Introduce Value Object |
| Primitive Obsession | Using primitives instead of objects | Introduce Value Object |
| Feature Envy | Method uses another class more | Move Method |
| God Class | Class does too much | Extract Class, Split Responsibilities |
| Deep Nesting | > 3 levels of nesting | Extract Method, Guard Clauses |
| Dead Code | Unused code | Delete |

### Refactoring Patterns

| Pattern | When to Use | Risk |
|---------|-------------|------|
| Extract Method | Long method, duplicate code | Low |
| Extract Class | Large class, god class | Medium |
| Rename | Unclear names | Low |
| Move Method | Feature envy | Medium |
| Extract Interface | Tight coupling | Medium |
| Replace Conditional with Polymorphism | Complex conditionals | High |
| Introduce Parameter Object | Long parameter list | Low |
| Remove Duplication | Duplicate code | Low |
| Simplify Conditional | Complex boolean logic | Low |
| Break Dependencies | Circular dependencies | High |

### Refactoring Safety

```
Safe (Low Risk):
- Rename
- Extract Method (within same class)
- Inline temp variable
- Remove dead code

Medium Risk:
- Extract Class
- Move Method
- Extract Interface
- Change signature

High Risk:
- Replace inheritance with delegation
- Replace conditional with polymorphism
- Major architecture changes
```

### Phase Summary

| Phase | Key Actions | Output |
|-------|-------------|--------|
| ANALYZE | Read arch doc, find smells | Analysis report |
| PLAN | Design strategy per doc | Incremental plan |
| REFACTOR | Apply patterns from doc | Clean code |
| TEST | Verify behavior unchanged | Test results |
| REVIEW | Check compliance, metrics | Review report |
| COMPLETE | Commit, PR, docs | Merged refactor |

### When to Stop

Stop refactoring when:
- [ ] Code follows architecture doc
- [ ] All code smells addressed
- [ ] Metrics show improvement
- [ ] Diminishing returns (over-engineering)
- [ ] Time budget exceeded

### Success Criteria

Refactoring is successful when:
1. Code follows architecture doc patterns
2. Code is more readable and maintainable
3. Complexity reduced (measurably)
4. Duplication removed
5. All tests pass
6. No behavior changes
7. Performance maintained/improved
8. Team can understand changes

---

## Anti-Patterns to Avoid

### Over-Engineering
```
DON'T: Add unnecessary abstractions
DON'T: Create patterns not in architecture doc
DON'T: Refactor without clear benefit
```

### Big Bang Refactoring
```
DON'T: Refactor entire codebase at once
DO: Incremental, step-by-step refactoring
```

### Changing Behavior
```
DON'T: Fix bugs during refactoring
DON'T: Add features during refactoring
DO: Pure refactoring only
```

### Ignoring Tests
```
DON'T: Skip running tests
DON'T: Disable failing tests
DO: Tests pass after every step
```

### Ignoring Architecture
```
DON'T: Invent your own patterns
DON'T: Violate architecture doc
DO: Follow architecture doc exactly
```
