---
name: pr-review
description: Thorough pull request review workflow with architecture compliance checks. Use when reviewing pull requests, checking code changes, or when user says "review pr", "check pr", "review code", "pr review", "review pull request".
---

# Pull Request Review Workflow

Comprehensive workflow for reviewing pull requests with architecture compliance and quality gates.

## IMPORTANT: Read Architecture First

**Before reviewing any code, you MUST read the appropriate architecture reference:**

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

**Review must verify compliance with architecture patterns defined in these files.**

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| ANALYZE | `@clean-architect` | Architecture compliance check |
| REVIEW | `@code-reviewer` | Code quality and best practices |
| REVIEW | `@security-audit` | Security vulnerabilities scan |
| REVIEW | `@perf-optimizer` | Performance analysis |
| REVIEW | `@test-writer` | Test coverage and quality |

## Workflow Overview

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ 1. FETCH │──▶│2. ANALYZE│──▶│ 3. REVIEW│──▶│4. FEEDBACK
└──────────┘   └──────────┘   └──────────┘   └──────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │  Quality Gates Check  │
                        │ ✓ Architecture        │
                        │ ✓ Security            │
                        │ ✓ Performance         │
                        │ ✓ Tests               │
                        └───────────────────────┘
```

---

## Phase 1: FETCH

**Goal**: Gather all PR information and context

### Actions
1. Fetch PR details:
   ```bash
   gh pr view [PR_NUMBER] --json number,title,body,author,state,commits,reviews,files
   ```

2. Get the diff:
   ```bash
   gh pr diff [PR_NUMBER]
   ```

3. List all commits:
   ```bash
   gh pr view [PR_NUMBER] --json commits --jq '.commits[] | "\(.oid[:7]) \(.messageHeadline)"'
   ```

4. Check CI/CD status:
   ```bash
   gh pr checks [PR_NUMBER]
   ```

5. **Identify project stack** from PR files and read architecture doc

### Output
```markdown
## PR #[NUMBER]: [TITLE]

### Metadata
- **Author**: [author]
- **State**: [open/merged/closed]
- **Stack**: [Flutter/React/Go/Laravel/Remix]
- **Architecture Doc**: [path to doc]
- **Files Changed**: [count]
- **Additions**: +[count] / **Deletions**: -[count]

### Commits
1. [commit 1]
2. [commit 2]

### Description
[PR body]

### CI/CD Status
[pass/fail status]
```

### Gate
- [ ] PR details fetched
- [ ] Diff obtained
- [ ] Commits listed
- [ ] Stack identified
- [ ] Architecture doc identified

---

## Phase 2: ANALYZE

**Goal**: Understand the changes and identify affected areas

### Actions
1. **Read the architecture doc** for this stack
2. Analyze what changed:
   - Which layers are affected? (per architecture doc)
   - What's the scope? (feature/fix/refactor/docs)
   - Are there breaking changes?

3. Identify impact areas based on architecture:
   - Frontend/Backend/Database?
   - Which modules/packages?
   - Dependencies changed?

4. Check for red flags:
   - [ ] Large PR (>500 lines)?
   - [ ] Multiple unrelated changes?
   - [ ] Conflicts with architecture patterns?
   - [ ] Missing tests?
   - [ ] No description?

### Analysis Output
```markdown
## Change Analysis

### Architecture Reference
- Doc: [path to architecture doc]
- Pattern: [pattern from doc]

### Scope
- Type: [Feature/Fix/Refactor/Docs/Chore]
- Breaking Changes: [Yes/No]

### Layers Affected (from architecture doc)
- Layer 1: [files]
- Layer 2: [files]
- Layer 3: [files]

### Impact Areas
- [Module 1]: [description]
- [Module 2]: [description]

### Red Flags
- [ ] Issue 1
- [ ] Issue 2
```

### Gate
- [ ] Architecture doc read
- [ ] Changes understood
- [ ] Impact areas identified
- [ ] Red flags noted

---

## Phase 3: REVIEW

**Goal**: Thorough code review against multiple quality dimensions

### Review Dimensions

#### 1. Architecture Compliance ⚠️ CRITICAL

**Read architecture doc and verify:**

- [ ] **Layer Boundaries**: Dependencies flow correctly per doc?
- [ ] **Directory Structure**: Files in correct locations per doc?
- [ ] **Naming Conventions**: Follows conventions from doc?
- [ ] **Design Patterns**: Uses patterns defined in doc?
- [ ] **Data Flow**: Follows data flow pattern from doc?
- [ ] **Dependency Injection**: Follows DI pattern from doc?

**Template:**
```markdown
### Architecture Compliance: [✅ PASS / ❌ FAIL]

Reference: [architecture doc path]

**Layer Boundaries**: [Pass/Fail]
- [Finding 1]
- [Finding 2]

**Structure**: [Pass/Fail]
- [Finding 1]

**Patterns**: [Pass/Fail]
- [Finding 1]

**Violations** (if any):
- [ ] Critical: [description]
- [ ] Major: [description]
- [ ] Minor: [description]
```

#### 2. Code Quality

- [ ] **Readability**: Code is clear and self-documenting
- [ ] **Naming**: Variables/functions named meaningfully
- [ ] **Complexity**: No overly complex functions (McCabe < 10)
- [ ] **DRY**: No unnecessary code duplication
- [ ] **Comments**: Complex logic is explained
- [ ] **Error Handling**: Proper error handling and logging
- [ ] **Type Safety**: Proper types (TypeScript/Dart/Go/PHP)

**Template:**
```markdown
### Code Quality: [Good/Needs Work/Poor]

**Strengths**:
- [strength 1]
- [strength 2]

**Issues**:
- [ ] [file:line] - [issue description]
- [ ] [file:line] - [issue description]
```

#### 3. Security 🔒

- [ ] **Input Validation**: All inputs validated/sanitized
- [ ] **Authentication**: Proper auth checks
- [ ] **Authorization**: Proper permission checks
- [ ] **SQL Injection**: Parameterized queries used
- [ ] **XSS Prevention**: Output properly escaped
- [ ] **Secrets**: No hardcoded secrets/keys
- [ ] **Dependencies**: No vulnerable dependencies

**Template:**
```markdown
### Security: [✅ SECURE / ⚠️ ISSUES / 🚨 CRITICAL]

**Vulnerabilities**:
- [ ] 🚨 Critical: [description + location]
- [ ] ⚠️ High: [description + location]
- [ ] ℹ️ Low: [description + location]

**Recommendations**:
- [recommendation 1]
- [recommendation 2]
```

#### 4. Performance ⚡

- [ ] **Database**: Queries optimized, indexes used?
- [ ] **N+1 Queries**: No N+1 query problems
- [ ] **Caching**: Appropriate caching used (if in doc)?
- [ ] **Memory**: No obvious memory leaks
- [ ] **Algorithms**: Efficient algorithms used
- [ ] **Network**: Minimal API calls
- [ ] **Bundle Size**: No large bundle additions (frontend)

**Template:**
```markdown
### Performance: [✅ OPTIMIZED / ⚠️ CONCERNS / 🐌 ISSUES]

**Concerns**:
- [ ] [file:line] - [performance issue]
- [ ] [file:line] - [performance issue]

**Suggestions**:
- [optimization 1]
- [optimization 2]
```

#### 5. Testing 🧪

- [ ] **Test Existence**: Tests exist for new code
- [ ] **Test Quality**: Tests follow patterns from architecture doc
- [ ] **Test Coverage**: Critical paths covered
- [ ] **Test Types**: Unit + Integration (as per doc)
- [ ] **Edge Cases**: Edge cases tested
- [ ] **Mocking**: Proper mocking patterns (from doc)

**Template:**
```markdown
### Testing: [✅ WELL TESTED / ⚠️ GAPS / ❌ MISSING]

**Coverage**:
- Unit Tests: [Good/Partial/Missing]
- Integration Tests: [Good/Partial/Missing]
- E2E Tests: [Good/Partial/Missing]

**Gaps**:
- [ ] Missing test for [scenario]
- [ ] Missing test for [edge case]

**Test Quality** (per architecture doc): [Pass/Fail]
- [finding]
```

### Review Checklist

Use this for every PR:

```markdown
## Review Checklist

### Architecture (from [doc])
- [ ] Layer boundaries respected
- [ ] Structure follows doc
- [ ] Patterns used correctly
- [ ] Dependencies flow correctly

### Code Quality
- [ ] Readable and maintainable
- [ ] Follows naming conventions
- [ ] No unnecessary complexity
- [ ] Proper error handling

### Security
- [ ] No security vulnerabilities
- [ ] Input validation present
- [ ] No secrets in code
- [ ] Auth/authz correct

### Performance
- [ ] No obvious bottlenecks
- [ ] Queries optimized
- [ ] Caching appropriate
- [ ] Efficient algorithms

### Testing
- [ ] Tests present
- [ ] Tests follow doc patterns
- [ ] Good coverage
- [ ] Edge cases covered

### Documentation
- [ ] PR description clear
- [ ] Complex code commented
- [ ] README updated (if needed)
- [ ] API docs updated (if needed)
```

### Gate
- [ ] All 5 dimensions reviewed
- [ ] Findings documented
- [ ] Severity assessed

---

## Phase 4: FEEDBACK

**Goal**: Provide clear, actionable feedback

### Feedback Structure

#### Option A: APPROVE ✅

Use when:
- Architecture compliance: PASS
- Security: SECURE
- No critical issues
- Minor issues acceptable

```markdown
## Review: ✅ APPROVED

### Summary
[Brief summary of changes]

### Architecture Compliance
✅ Follows [architecture doc name] patterns correctly

### Strengths
- [strength 1]
- [strength 2]
- [strength 3]

### Minor Suggestions (Optional)
- [ ] [suggestion 1]
- [ ] [suggestion 2]

### Recommendation
**APPROVE** - Ready to merge
```

#### Option B: REQUEST CHANGES ⚠️

Use when:
- Architecture violations
- Security issues
- Critical bugs
- Missing tests

```markdown
## Review: ⚠️ CHANGES REQUESTED

### Summary
[Brief summary of changes]

### Critical Issues (Must Fix)
1. **[Category]** - [file:line]
   - Issue: [description]
   - Fix: [how to fix]
   - Reference: [architecture doc section if applicable]

2. **[Category]** - [file:line]
   - Issue: [description]
   - Fix: [how to fix]

### Non-Critical Issues (Should Fix)
- [ ] [file:line] - [description]
- [ ] [file:line] - [description]

### Suggestions (Optional)
- [suggestion 1]
- [suggestion 2]

### Recommendation
**REQUEST CHANGES** - Please address critical issues
```

#### Option C: COMMENT 💬

Use when:
- Need clarification
- Questions about approach
- Discussion needed

```markdown
## Review: 💬 COMMENTS

### Questions
1. [Question about approach/design]
2. [Question about implementation]

### Discussion Points
- [Point 1]
- [Point 2]

### Recommendation
**COMMENT** - Let's discuss before proceeding
```

### Actions

1. Post review on GitHub:
   ```bash
   # Approve
   gh pr review [PR_NUMBER] --approve --body "[feedback]"

   # Request changes
   gh pr review [PR_NUMBER] --request-changes --body "[feedback]"

   # Comment
   gh pr review [PR_NUMBER] --comment --body "[feedback]"
   ```

2. Add inline comments for specific issues:
   ```bash
   gh pr comment [PR_NUMBER] --body "[comment]"
   ```

3. Update PR status if needed:
   ```bash
   # Add labels
   gh pr edit [PR_NUMBER] --add-label "needs-changes"
   gh pr edit [PR_NUMBER] --add-label "security-review"
   gh pr edit [PR_NUMBER] --add-label "architecture-review"
   ```

### Feedback Principles

1. **Be Specific**: Point to exact file and line
2. **Be Constructive**: Suggest solutions, not just problems
3. **Be Kind**: Assume good intent
4. **Reference Docs**: Link to architecture docs when relevant
5. **Prioritize**: Separate critical from optional
6. **Explain Why**: Help author learn

### Example Inline Comment
```markdown
**[file.ts:123]** - Architecture Violation

Issue: Business logic in presentation layer
Reference: `react-frontend.md` - Section 3.2

This violates the architecture pattern. Business logic should be in:
- `src/domain/usecases/`

Suggested fix:
1. Create `src/domain/usecases/calculateTotal.ts`
2. Move logic there
3. Call from component

Example:
\`\`\`typescript
// Component
const total = await calculateTotalUseCase.execute(items);

// Usecase
export class CalculateTotalUseCase {
  execute(items: Item[]): number {
    // logic here
  }
}
\`\`\`
```

### Gate
- [ ] Feedback provided
- [ ] Decision made (approve/request/comment)
- [ ] Review posted to GitHub

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

### Review Dimensions
| Dimension | Focus |
|-----------|-------|
| Architecture | Layer boundaries, patterns, structure per doc |
| Code Quality | Readability, naming, complexity, DRY |
| Security | Validation, auth, secrets, vulnerabilities |
| Performance | Queries, caching, algorithms, memory |
| Testing | Coverage, quality, edge cases per doc |

### Severity Levels

| Level | Action | Examples |
|-------|--------|----------|
| 🚨 **Critical** | Must fix before merge | Security holes, architecture violations, data loss bugs |
| ⚠️ **High** | Should fix before merge | Missing tests, poor error handling, performance issues |
| ℹ️ **Medium** | Can fix after merge | Code smells, minor refactoring, missing comments |
| 💡 **Low** | Optional | Style suggestions, micro-optimizations |

### Common Issues Checklist

**Architecture** (check against doc):
- [ ] Business logic in UI layer
- [ ] UI code in domain layer
- [ ] Direct database access from UI
- [ ] Circular dependencies
- [ ] Wrong folder structure

**Security**:
- [ ] Hardcoded secrets
- [ ] SQL injection risks
- [ ] XSS vulnerabilities
- [ ] Missing auth checks
- [ ] Sensitive data logged

**Performance**:
- [ ] N+1 queries
- [ ] Missing indexes
- [ ] Inefficient algorithms
- [ ] Memory leaks
- [ ] Large bundle sizes

**Testing**:
- [ ] No tests for new code
- [ ] Tests not following doc patterns
- [ ] Missing edge cases
- [ ] Flaky tests

### GitHub CLI Commands

```bash
# Fetch PR
gh pr view [NUMBER]
gh pr diff [NUMBER]
gh pr checks [NUMBER]

# Review
gh pr review [NUMBER] --approve
gh pr review [NUMBER] --request-changes
gh pr review [NUMBER] --comment

# Comment
gh pr comment [NUMBER] --body "comment"

# Labels
gh pr edit [NUMBER] --add-label "label"
```

---

## Success Criteria

PR review is complete when:
1. All 5 review dimensions checked
2. Architecture compliance verified against doc
3. Clear feedback provided
4. Decision made (approve/request/comment)
5. Review posted to GitHub
6. Author knows exactly what to do next
