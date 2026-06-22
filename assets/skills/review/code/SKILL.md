---
name: review-code
description: Code review workflow with five modes — SELF (self-review local branch before push), PR (review someone's pull request + post to GitHub), ARCHITECT (deep DDD architecture audit with scoring), TDD (red-green-refactor test-first), ADDRESS (fix PR review comments). Stack-aware. Use when user says "review changes", "review branch", "check branch", "review my code", "review before pr", "review pr", "check pr", "review code", "pr review", "architect-review", "architecture review", "review ddd", "check architecture", "tdd", "test first", "test driven", "red green refactor", "fix pr comment", "fix review comment", "address pr feedback".
args: "[MODE] [ARG]"
---

# Code Review Workflow

One skill covering the full review surface. Pick the mode that matches your situation.

## Pick your mode

| Situation | Mode | Jump to |
|-----------|------|---------|
| Self-review your branch before pushing / opening a PR | **SELF** | [Mode SELF](#mode-self) |
| Reviewing someone else's PR + posting feedback to GitHub | **PR** | [Mode PR](#mode-pr) |
| Deep DDD architecture audit of a domain (with scoring) | **ARCHITECT** | [Mode ARCHITECT](#mode-architect) |
| Writing code test-first (red → green → refactor) | **TDD** | [Mode TDD](#mode-tdd) |
| Addressing review comments on your own PR | **ADDRESS** | [Mode ADDRESS](#mode-address) |

- ❌ Security-only sweep → use `@security-audit` agent
- ❌ Bug surfaced by review → use `/fix-bug`

## Read Architecture First (all modes)

Detect stack via `~/.claude/architecture/_shared/stack-detection.md`. Load `ddd-architecture.md` + the stack doc — extract forbidden imports + conventions before reviewing. Severity definitions: `~/.claude/architecture/_shared/severity-levels.md` (code severity table).

---
---

# Mode SELF

Self-review your branch vs a base branch before pushing or opening a PR. Checks architecture compliance, stack conventions, and code quality — on **changed files only**, not the whole codebase.

**ARGUMENTS:** (optional) base branch. Default: `main` (fallback to `master`).

## Workflow

```
0 DETECT → 1 COLLECT → 2 BUILD+LINT → 3 ARCH → 4 CONVENTIONS → 5 QUALITY → 6 TESTS → 7 REPORT → 8 FIX
```

## Phase 0: DETECT
- [ ] Stack detected (ask user if ambiguous, e.g., monorepo)
- [ ] Architecture doc loaded
- [ ] Forbidden-imports list extracted

## Phase 1: COLLECT

```bash
BASE=${1:-main}
git rev-parse --verify "$BASE" >/dev/null 2>&1 || BASE=master

git log "$BASE"..HEAD --oneline
git diff "$BASE"...HEAD --stat
git diff "$BASE"...HEAD --name-only --diff-filter=ACMR
```

Categorize changed files by layer:

| Layer | Typical paths |
|-------|---------------|
| Domain | `domain/`, `internal/domain/`, `src/domain/`, `lib/domain/` |
| Application | `application/`, `internal/application/`, `src/application/` |
| Infrastructure | `infrastructure/`, `internal/infrastructure/`, `src/infrastructure/` |
| Presentation / UI | `controllers/`, `pages/`, `components/`, `views/`, `ports/http/` |
| Persistence | `models/`, `entities/` (ORM), `prisma/`, `migrations/` |
| Config / Bootstrap | `config/`, `bootstrap/`, `cmd/`, `main.*` |

Read **all** changed files before reviewing — never skim.

## Phase 2: BUILD + LINT

Run the stack's build + typecheck + lint commands. If any fail → mark **CRITICAL** and stop further review until they pass.

```bash
# Go:       go build ./... && go vet ./...
# NestJS:   pnpm typecheck && pnpm lint
# Laravel:  composer dump-autoload && ./vendor/bin/phpstan analyse
# Flutter:  dart analyze
# React/Remix: pnpm typecheck && pnpm lint
```

## Phase 3: ARCHITECTURE (changed files only)

### 3.1 Domain (if changed)
| # | Rule |
|---|------|
| D1 | Domain purity — no forbidden imports (ORM, HTTP, cache, queue, auth SDK) |
| D2 | No cross-domain imports (only shared kernel allowed) |
| D3 | No persistence-model imports in domain |
| D4 | Entities have behavior (not anemic data bags) |
| D5 | Entities raise events on state change (if architecture uses events) |
| D6 | Ports in `ports/` dir (not inline in usecases) |
| D7 | One port per file |
| D8 | Ports return domain types, not primitives |
| D9 | Value objects stdlib-only |
| D10 | Usecases have no infra imports |

```bash
CHANGED_DOMAIN=$(git diff "$BASE"...HEAD --name-only --diff-filter=ACMR \
  | grep -E '^(src|internal|lib)/domain/')
[ -n "$CHANGED_DOMAIN" ] && echo "$CHANGED_DOMAIN" \
  | xargs grep -lEn '<STACK_FORBIDDEN_REGEX>' 2>/dev/null \
  && echo FAIL || echo PASS
```

### 3.2 Application (if changed)
| # | Rule |
|---|------|
| A1 | Handler is thin (parse → service → respond, no business logic) |
| A2 | Service justified only when ≥2 usecases orchestrated |
| A3 | Listener is side-effect only (no business logic) |
| A4 | Listener registered in event bus |
| A5 | Event name string matches registry |
| A6 | DTOs validated at boundary |
| A7 | Composition root only — no inline wiring in handlers |

### 3.3 Infrastructure (if changed)
| # | Rule |
|---|------|
| I1 | Repository has no business logic |
| I2 | Mappers exist (domain ↔ ORM model) |
| I3 | Implements port interface (returns domain types) |
| I4 | Context / transaction propagation correct |

### 3.4 Persistence models (if changed)
| # | Rule |
|---|------|
| M1 | ORM models in infrastructure, NOT domain |
| M2 | Schema change → matching migration |
| M3 | Nullable columns use nullable types |

## Phase 4: CONVENTIONS (cross-stack)

| # | Rule |
|---|------|
| G1 | No swallowed errors (no empty catch / `if err != nil {}`) |
| G2 | Async work uses background context, NOT request context |
| G3 | API-facing types have serialization tags (`json:`, decorators, etc.) |
| G4 | No hardcoded secrets / tokens / keys |
| G5 | Parameterized queries only — no string-interpolated SQL |
| G6 | Input validation at boundary before reaching domain |

Plus any stack-specific Hard Rules from the architecture doc.

## Phase 5: QUALITY (manual)

Read the diff. Look for:

| # | Area | What to look for |
|---|------|------------------|
| Q1 | Logic correctness | Off-by-one, nil deref, wrong condition, missed edge case |
| Q2 | Error handling | Errors propagated/wrapped, not silently ignored |
| Q3 | Concurrency | Race conditions, shared mutable state, async leaks |
| Q4 | Resource leaks | Unclosed connections, HTTP bodies, file handles |
| Q5 | Naming | Reveals intent (no `data`, `info`, `manager`, `helper`) |
| Q6 | Dead code | Unreachable, unused, commented-out |
| Q7 | Duplication | Real duplication across changed files (not coincidental) |
| Q8 | Breaking change | API contract change, removed field, behavior change |
| Q9 | Over-engineering | Abstraction not justified by the change |
| Q10 | Test coverage | New logic has tests; bug fixes have regression tests |

## Phase 6: TESTS

```bash
CHANGED_DOMAINS=$(git diff "$BASE"...HEAD --name-only --diff-filter=ACMR \
  | grep -E '/(domain|modules|features)/' \
  | sed -E 's|.*(domain\|modules\|features)/([^/]+)/.*|\2|' | sort -u)

for d in $CHANGED_DOMAINS; do
  # Go: go test ./internal/domain/$d/...  · NestJS: npx jest src/domain/$d
  # Laravel: ./vendor/bin/phpunit --filter $d  · Flutter: flutter test test/domain/$d
  echo "Test $d"
done

{full_test_command}
```

## Phase 7: REPORT

```markdown
## Code Review: {branch} → {base}
**Stack:** {stack} · **Commits:** {N} · **Files:** {N} (+{add} / -{del})

### Build / Lint / Types
| Check | Status |  → Build / Lint / Types: PASS/FAIL

### Issues (sorted by severity)
| # | Severity | File:line | Issue | Suggested fix |
|---|----------|-----------|-------|---------------|
| 1 | CRITICAL | config/db.ts:42 | hardcoded token | move to env |
| 2 | HIGH | handlers/user.ts:88 | business logic in handler | extract to usecase |

### Verdict: {APPROVED / CHANGES REQUESTED}
```

### Verdict rules
- **CRITICAL or HIGH found** → CHANGES REQUESTED
- **MEDIUM only** → CHANGES REQUESTED (should fix)
- **LOW only or nothing** → APPROVED (with suggestions if any)

## Phase 8: FIX (if user confirms)
1. Fix in order: CRITICAL → HIGH → MEDIUM → LOW
2. Re-run build + lint + tests after each batch
3. Re-run full review when all fixed
4. Report final status

---
---

# Mode PR

Review someone else's PR across 5 dimensions and post structured feedback to GitHub.

## When to use
- ✅ Reviewing someone else's open PR (`gh pr view <number>` accessible)
- ✅ Need to post structured feedback (APPROVE / REQUEST CHANGES / COMMENT)
- ❌ Self-review of own branch before push → **Mode SELF**
- ❌ Addressing comments on your own PR → **Mode ADDRESS**

## Workflow

```
FETCH → ANALYZE → REVIEW (5 dims) → FEEDBACK → POST
```

## Phase 1: FETCH

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

## Phase 2: ANALYZE
1. **Scope check**: does the diff match the PR title / description? Mixed-scope PRs → ask author to split.
2. **Risk profile**: domain logic, infra config, migrations, auth → high risk; UI tweak → low risk.
3. **Test delta**: are new tests in the diff? coverage % up or down?
4. **Reference module**: open 1 existing similar module to compare conventions.

### Gate
- [ ] PR scope is single-purpose (or split requested)
- [ ] Risk level identified · Test delta noted

## Phase 3: REVIEW — 5 dimensions

### 3.1 Architecture (CRITICAL / HIGH)
- Domain has zero framework imports; no cross-domain imports
- Business logic in usecases, not handlers / stores
- Ports in `ports/` dir; entities raise events on state changes
- Listeners use background context, not request context
- **For deep DDD audit:** switch to **Mode ARCHITECT** and link result.

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
- Functions do one thing; no dead branches or commented-out code
- DRY only where the duplication is real (not coincidental)
- Errors handled at boundary, not swallowed mid-flow

## Phase 4: FEEDBACK

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
the Withdraw usecase, not here.
suggest:
  result, err := s.WithdrawUsecase.Execute(ctx, req)   // handler
  // usecase: if !wallet.HasSufficientBalance(amount) { return ErrInsufficient }
```

### Summary comment (top of PR)

```markdown
## Review Summary
**Decision:** REQUEST CHANGES

**Must fix (HIGH):**
- [ ] `withdraw.go:42` — business logic moved out of handler

**Should fix (MEDIUM):**
- [ ] `withdraw_test.go` — only happy path tested, add insufficient-balance case

**Nits (LOW):**
- [ ] `helper.go:5` — rename `helper` to something specific

**What looked great:** Clean port interface, good test naming, clear PR description.
```

### Gate
- [ ] Decision matches severity rules
- [ ] Every HIGH+ has file:line + suggested fix
- [ ] Summary lists must-fix vs should-fix vs nits
- [ ] Acknowledged what's good (not just criticism)

## Phase 5: POST

```bash
gh pr review $PR --request-changes --body "$(cat summary.md)"
# or  gh pr review $PR --approve --body "LGTM, see one nit"
# or  gh pr review $PR --comment --body "Questions before final review"
gh pr edit $PR --add-label "needs-changes"   # optional
```

### Gate
- [ ] Review posted to GitHub
- [ ] Author has clear next-step list

---
---

# Mode ARCHITECT

Audit a codebase (or a single domain) against DDD rules with automated checks, manual review, and a fix loop until score ≥ B.

**ARGUMENTS:** `<architecture> [domain]` — e.g. `go-backend wallet`, `react-frontend`. No arg → auto-detect stack. Aliases: `ddd → ddd-architecture`, `go → go-backend`, `react → react-frontend`, `flutter → flutter-mobile`, `laravel → laravel-backend`, `remix → remix-fullstack`, `nestjs → nodejs-nestjs`, `mono → monorepo`.

## Workflow

```
RESOLVE → LOAD RULES → AUTOMATED CHECKS → MANUAL REVIEW → REPORT → FIX LOOP
```

## Phase 0: RESOLVE ARCHITECTURE
- **Arg provided:** normalize via alias table → search project (`.claude/architecture/{name}.md`) then global (`~/.claude/architecture/{name}.md`). Not found → reject with available list, STOP.
- **No arg:** detect stack → confirm with user. Not detected → list options, ask.

### Gate
- [ ] Architecture file loaded · Domain identified (if scoped)

## Phase 1: LOAD RULES

Read `ddd-architecture.md` (core) + the stack doc. Extract: DDD directory layout, layer import rules + forbidden imports, hard rules (HR1-HR15), stack-specific check scripts, wiring + test patterns.

## Phase 2: AUTOMATED CHECKS

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

## Phase 3: MANUAL REVIEW

Focus on **architecture structure**, not business correctness. 10 areas:

- **D — Directory:** D1 `domain/{domain}/` proper subdirs · D2 has `entities/`,`ports/`,`usecases/` · D3 `valueobjects/` separate · D4 `events/` separate, 1/file · D5 app layer `ports/{transport}/`,`services/`,`listeners/` · D6 infra implements ports · D7 no legacy dirs
- **E — Entities:** E1 constructor · E2 behavior (not anemic) · E3 raises events · E4 no framework imports · E5 has mappers
- **VO — Value Objects:** VO1 in `valueobjects/` · VO2 stdlib only · VO3 immutable+behavior · VO4 used by entities+ports
- **P — Ports:** P1 `ports/` dir (no inline) · P2 one/file · P3 interface+DTOs · P4 domain types in sigs · P5 platform-agnostic naming · P6 no infra imports
- **EV — Events:** EV1 one/file · EV2 extends base · EV3 carries data · EV4 name matches registry
- **U — UseCases:** U1 uses ports · U2 split ≤200 lines · U3 business logic here · U4 no infra imports · U5 dispatches events after persistence · U6 no inline interfaces
- **SVC — Services:** SVC1 thin delegates · SVC2 no infra imports
- **H — Handlers:** H1 registration fn · H2 thin · H3 no business logic · H4 DTOs separate
- **L — Listeners:** L1 one/event · L2 side-effects only · L3 registered · L4 background context
- **I — Infrastructure:** I1 implements port · I2 mappers · I3 no business logic · I4 compile-time interface check

### Gate
- [ ] All 10 areas reviewed · Findings categorized by severity

## Phase 4: REPORT + SCORE

```markdown
## Architecture Review: {architecture} / {domain}
### Automated (R1-R10) | ### Manual review (D/E/VO/P/EV/U/SVC/H/L/I)
### Violations: [SEVERITY] code:file:line — description
### Overall Score: {A/B/C/D/F}
```

| Score | Criteria |
|-------|----------|
| **A** | 0 violations, all R1-R10 PASS |
| **B** | 0 CRITICAL/HIGH, max 3 MEDIUM |
| **C** | 0 CRITICAL, max 2 HIGH |
| **D** | Has CRITICAL or 3+ HIGH |
| **F** | Multiple CRITICAL — architecture broken |

## Phase 5: FIX LOOP (if user confirms)

```
LOOP: 1. Fix all violations → 2. Re-run automated (Phase 2) → 3. Re-run manual (Phase 3)
      4. IF violations ≥ MEDIUM → GOTO 1 · 5. IF only LOW/none → BREAK, final report
```

**Called from `/feature-build`:** skip Phase 0 (architecture known), skip user confirmation for fixes (auto-fix in loop), report final score back to caller.

---
---

# Mode TDD

Red-Green-Refactor cycle: write failing test → write minimal code to pass → refactor while green.

## When to use
- ✅ Logic with clear input → output behavior (parsers, validators, business rules, usecases)
- ✅ Fixing a bug — failing test first, then fix (regression guard)
- ✅ Refactoring critical code where you need a safety net
- ❌ UI prototyping / visual tweaks → manual is faster
- ❌ Exploratory spike → use `/research-explore` (SPIKE — throwaway, no tests)

## The TDD Cycle

```
   ┌──▶ RED (fail) ──▶ GREEN (minimal) ──▶ REFACTOR (cleanup) ──┐
   └────────────────────  next requirement  ────────────────────┘
```

## Phase 1: RED — failing test
1. Pick ONE small requirement (smallest verifiable behavior)
2. Name the test as a sentence describing behavior
3. Arrange (inputs + mocks) → Act (call method) → Assert (output / state / interaction)
4. Run — it MUST fail. If it passes, the test is wrong.

**Naming:** `should_<behavior>_when_<condition>` (Go/Python) · `it("returns X when Y")` (Jest) · `test_<behavior>_<condition>` (PHPUnit/Pest)

### Gate
- [ ] Test fails for the RIGHT reason (not a typo / missing import)
- [ ] Name describes behavior, not implementation · One behavior per test

## Phase 2: GREEN — minimal code to pass
- **Minimal** means: hardcode return values if the test allows; triangulate with more tests
- Don't add code not required by a test; don't add error handling unless a test requires it
- Don't generalize until 3+ tests force it
- If previous tests broke, you're not minimal — revert + try smaller

### Gate
- [ ] New test passes · All previous tests still pass · No untested behavior added

## Phase 3: REFACTOR — clean up while green
- Refactor: duplication, long methods, bad names, dead branches, coupling
- **Run tests after every change** — green is your safety net; one refactor at a time
- **No new behavior** — if a refactor needs a new test, go back to RED
- Don't refactor: flaky tests (fix flakiness first), under time pressure, code about to be deleted

### Gate
- [ ] All tests still green · No new public API added · Code easier to read

## Test patterns per layer (DDD)

| Layer | Test type | Dependencies |
|-------|-----------|--------------|
| Value Object / Entity | Unit (pure) | None |
| UseCase | Unit | Mock ports |
| Service | Unit | Mock usecase |
| Handler / Controller | Integration | Real router, mock service |
| Infrastructure | Integration | Real DB / testcontainers |
| Listener | Unit | Mock infra |
| API contract (cross-service) | Contract test | Real / sandboxed external |

**Stub vs fake vs mock:** stub returns canned values · fake = working in-memory impl · mock records+verifies calls. Prefer **fake** for repository tests; use **mock** only when call args are the assertion.

**Property-based testing** for pure logic with many edge cases (parsers, math, encoders): Go `gopter`, TS `fast-check`, Python `hypothesis`, Dart `glados`. Pattern: "for all valid input X, property P holds."

## Common Mistakes
| Mistake | Fix |
|---------|-----|
| Writing tests AFTER code | Always RED first |
| Testing implementation, not behavior | Assert outputs / observable state |
| One test, many behaviors | One behavior per test |
| Mocking value objects | Use real — they're pure |
| Skipping REFACTOR | It's a phase, not optional |
| Test depends on order | Each test sets up its own state |
| Slow tests (>1s each) | Move to integration tier; keep unit <100ms |

---
---

# Mode ADDRESS

Fetch all review comments on an open PR you authored, address each, push, and respond back to GitHub.

**ARGUMENTS:** `PR_NUMBER` — the PR you authored.

## Workflow

```
FETCH → ANALYZE → FIX → RESPOND
```

## Phase 1: FETCH

```bash
PR={number}
gh pr view $PR --json number,title,state,headRefName,baseRefName,author
gh pr diff $PR
gh api repos/{owner}/{repo}/pulls/$PR/comments \
  --jq '.[] | {id, path, line, body, user: .user.login, created_at}'
gh api repos/{owner}/{repo}/pulls/$PR/reviews \
  --jq '.[] | {id, user: .user.login, state, body}'
```

### Gate
- [ ] All comments fetched (line-level + review-level) · Current diff loaded
- [ ] PR is open (closed/merged → ask if user really wants to revisit)

## Phase 2: ANALYZE — classify each comment

| Category | Action |
|----------|--------|
| **Must-fix** (bug, security, broken test, arch violation) | Fix in this round |
| **Should-fix** (style, naming, missing test for new code) | Fix unless explicit reason not to |
| **Discussion** (asking a question, proposing alternative) | Reply with reasoning before fixing |
| **Nit / preference** (subjective) | Acknowledge + decide; OK to push back politely |
| **Outdated** (code already changed) | Reply "resolved by {commit}" and resolve thread |

Ambiguous comment ("this feels off")? Ask the reviewer for specifics before guessing. Build a triage table (`# | File:line | Author | Category | Plan`).

### Gate
- [ ] Every comment classified · Plan written per comment · Ambiguous → questions queued

## Phase 3: FIX
- Fix in order: must-fix → should-fix → discussion outcomes
- One concern per commit (`fix(handler): validate input in DTO per #pr-comment-1`)
- After each batch: run build + lint + tests locally
- Re-run **Mode SELF** before pushing
- **Structural change requested** (move logic between layers, add a port) → use `/feature-build` (REFACTOR mode) for that subtree, then come back to respond

### Gate
- [ ] All must-fix items addressed · Build + lint + tests green · Self-review clean

## Phase 4: RESPOND

```bash
git push
gh api repos/{owner}/{repo}/pulls/$PR/comments/{comment_id}/replies -f body="..."
# or single summary: gh pr review $PR --comment --body "$(cat reply.md)"
gh pr edit $PR --add-reviewer {original_reviewer}   # re-request review
```

**Reply patterns:** Fixed → "Fixed in {sha}. {what changed}." · Push back → "Keeping current approach because {reason}. Happy to revisit." · Ask back → "Could you clarify what you mean by …?" · Resolved → "Resolved by {sha} earlier in the chain."

After replying, mark threads resolved. Don't leave dangling threads.

### Gate
- [ ] Every comment has a reply · Threads resolved · Commits pushed · Reviewer re-requested

---
---

## Hard Rules (all modes)

- **Changed files / PR scope only** — don't expand to drive-by reviews.
- **Stop on CRITICAL** — fix build / lint / type errors before everything else; don't review red CI.
- **File:line for every issue / HIGH+** — no vague "somewhere in handlers".
- **Match severity honestly** — don't grade-inflate to push for a fix; one severity per finding.
- **Always include "what went well"** in PR reviews — pure-criticism reviews demoralize.
- **Don't bikeshed style** when the team has a linter — let the tool flag it.
- **ARCHITECT:** all CRITICAL/HIGH fixed before merge; MEDIUM allowed with explicit waiver; don't skip manual review.
- **TDD:** RED first always; minimal GREEN; REFACTOR is a phase, not optional; test behavior not implementation; unit tests <100ms.
- **ADDRESS:** reply to every comment; push back politely with a real reason; one concern per commit.

## Related Skills

| When | Use |
|------|-----|
| Refactor to fix violations | `/feature-build` (REFACTOR mode) |
| Bug surfaced by review | `/fix-bug` |
| Research how others solved it | `/research-explore` (WEB mode) |
| Document the reviewed API | `/docs-sync` |

## Recommended Agents

| Mode / Phase | Agent | Purpose |
|--------------|-------|---------|
| SELF/PR Architecture | `@clean-architect` | DDD compliance |
| SELF/PR Security | `@security-audit` | Vulnerability sweep |
| PR Performance | `@perf-optimizer` | N+1, indexes, slow paths |
| Quality | `@code-reviewer` | Code smells |
| Tests / TDD RED | `@test-writer` | Coverage + failing tests first |
| ARCHITECT automated | `@devops` | Build / lint / test scripts |
| TDD REFACTOR | `@refactor` | Patterns + cleanup |
| Fix | Stack-specific dev agent | Apply fixes |
