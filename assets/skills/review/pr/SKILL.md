---
name: review-pr
description: Thorough pull request review workflow with architecture compliance checks. Use when reviewing pull requests, checking code changes, or when user says "review pr", "check pr", "review code", "pr review", "review pull request".
---

# Pull Request Review Workflow

Review someone else's PR across 5 dimensions and post structured feedback to GitHub.

## When to use this skill

- ✅ Reviewing someone else's open PR (`gh pr view <number>` accessible)
- ✅ Need to post structured feedback (APPROVE / REQUEST CHANGES / COMMENT)
- ✅ Want a multi-dimensional review (architecture + security + perf + tests)
- ❌ Self-review of own branch before push → use `/review-branch`
- ❌ Only checking DDD compliance → use `/review-architect`
- ❌ Addressing comments on your own PR → use `/fix-pr-comment`

## Read Architecture First

Load `~/.claude/architecture/ddd-architecture.md` + the stack-specific doc. Detect stack via `~/.claude/architecture/_shared/stack-detection.md`.

---

## Workflow

```
FETCH → ANALYZE → REVIEW (5 dims) → FEEDBACK → POST
```

---

## Phase 1: FETCH

**Goal:** load PR + diff + context in one pass.

```bash
PR={number}
gh pr view $PR --json number,title,body,author,state,headRefName,baseRefName,commits,files
gh pr diff $PR
gh pr checks $PR
gh pr view $PR --comments
```

### Gate
- [ ] PR metadata + diff + CI status loaded
- [ ] PR description explains "what / why" — if missing, ask author before deep review
- [ ] CI status known (don't review red builds — ask author to fix first)

---

## Phase 2: ANALYZE

**Goal:** understand scope before going line-by-line.

1. **Scope check**: does the diff match the PR title / description? Mixed-scope PRs (e.g., feature + drive-by refactor) → ask author to split.
2. **Risk profile**: which files? domain logic, infra config, migrations, auth — high risk vs UI tweak — low risk.
3. **Test delta**: are new tests in the diff? coverage % up or down?
4. **Reference module**: open 1 existing similar module to compare conventions.

### Gate
- [ ] PR scope is single-purpose (or split requested)
- [ ] Risk level identified (low / medium / high)
- [ ] Test delta noted

---

## Phase 3: REVIEW — 5 dimensions

Severity definitions: `~/.claude/architecture/_shared/severity-levels.md` (code severity table).

### 3.1 Architecture (CRITICAL / HIGH)

For DDD-aware code, check against architecture doc:
- Domain has zero framework imports
- No cross-domain imports
- Business logic in usecases, not handlers / stores
- Ports in `ports/` dir (not inline interfaces)
- Entities raise events on state changes
- Listeners use background context, not request context

**For deep DDD audit:** call `/review-architect` instead and link result.

### 3.2 Security (CRITICAL / HIGH)

- Input validation at trust boundary (handler / DTO)
- AuthN + AuthZ checked before sensitive ops
- No secrets / tokens in code or logs
- SQL via parameterized queries / ORM — no string concatenation
- File paths / shell commands sanitized
- Rate limiting + idempotency on state-mutating endpoints
- Crypto: standard library, no roll-your-own

### 3.3 Performance (HIGH / MEDIUM)

- No N+1 queries (eager-load relations the handler uses)
- Indexes match new query patterns (check `EXPLAIN`)
- Pagination on list endpoints (cursor preferred)
- Background work for slow operations (don't block request)
- Caching where appropriate, invalidation thought through
- Synchronous external API calls have timeouts

### 3.4 Testing (HIGH / MEDIUM)

- New business logic has unit tests (usecases, entities, value objects)
- New endpoints have at least 1 integration test (happy + error)
- Tests assert on behavior, not implementation
- Tests don't depend on order, time, or env
- Coverage didn't drop for touched files

### 3.5 Code quality (MEDIUM / LOW)

- Names reveal intent (no `data`, `info`, `manager`, `helper`)
- Functions do one thing
- No dead branches or commented-out code
- DRY only where the duplication is real (not coincidental)
- Errors handled at boundary, not swallowed mid-flow

---

## Phase 4: FEEDBACK

**Goal:** turn findings into actionable comments at the right place.

### Decision (pick one)

| Decision | When |
|----------|------|
| **APPROVE** | 0 CRITICAL / HIGH; LOW only |
| **REQUEST CHANGES** | Any CRITICAL or HIGH; or multiple MEDIUM in same area |
| **COMMENT** | Only style / nit comments; or asking questions before final review |

### Inline comment format

Be specific. File + line + rationale + suggested fix:

```
file: internal/wallet/usecases/withdraw.go:42
severity: HIGH
issue: Business logic in handler — `if wallet.Balance < amount` should live in
the Withdraw usecase, not here. The handler should just call usecase and
return the error.
suggest:
  // handler
  result, err := s.WithdrawUsecase.Execute(ctx, req)

  // usecase
  func (u *WithdrawUsecase) Execute(ctx, req) (Result, error) {
      if !wallet.HasSufficientBalance(amount) { return ErrInsufficient }
      // ...
  }
```

### Summary comment (top of PR)

```markdown
## Review Summary
**Decision:** REQUEST CHANGES

**Must fix (HIGH):**
- [ ] `withdraw.go:42` — business logic moved out of handler
- [ ] `withdraw.go:88` — missing input validation on `amount`

**Should fix (MEDIUM):**
- [ ] `withdraw_test.go` — only happy path tested, add insufficient-balance case
- [ ] `wallet_store.go:120` — N+1 query loading transactions

**Nits (LOW):**
- [ ] `helper.go:5` — rename `helper` to something specific

**What looked great:**
- Clean port interface, good test naming, clear PR description.
```

### Gate
- [ ] Decision matches severity rules
- [ ] Every HIGH+ has file:line + suggested fix
- [ ] Summary lists must-fix vs should-fix vs nits
- [ ] Acknowledged what's good (not just criticism)

---

## Phase 5: POST

```bash
# Inline comments (one per finding)
gh pr review $PR --request-changes --body "$(cat summary.md)"
# or
gh pr review $PR --approve --body "LGTM, see one nit"
# or
gh pr review $PR --comment --body "Questions before final review"

# Optional: label
gh pr edit $PR --add-label "needs-changes"
```

### Gate
- [ ] Review posted to GitHub
- [ ] Author has clear next-step list

---

## Hard Rules

- **Don't review red CI** — ask author to fix tests / lint first
- **Don't bikeshed style** when the team has a linter — let the tool flag it
- **Always include "what went well"** — pure-criticism reviews demoralize
- **One severity per finding** — don't grade-inflate to push for a fix
- **File:line for every HIGH+** — author shouldn't have to grep for what you mean

---

## Related Skills

| When | Use |
|------|-----|
| Reviewing own branch before push | `/review-branch` |
| Only checking DDD architecture | `/review-architect` |
| Fixing comments on your own PR | `/fix-pr-comment` |
| Bug surfaced by review | `/fix-hotfix` |

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| ANALYZE | `@clean-architect` | Architecture context |
| REVIEW 3.1 | `@clean-architect` | Architecture compliance |
| REVIEW 3.2 | `@security-audit` | Security findings |
| REVIEW 3.3 | `@perf-optimizer` | N+1, indexes, slow paths |
| REVIEW 3.4 | `@test-writer` | Coverage + test quality |
| REVIEW 3.5 | `@code-reviewer` | Naming + quality |
