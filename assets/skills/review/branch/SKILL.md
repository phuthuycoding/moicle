---
name: review-branch
description: Review local branch changes for architecture compliance, conventions, and code quality before pushing/PR. Stack-aware — detects the project stack and applies the matching rules. Use when user says "review changes", "review branch", "check branch", "check changes", "review my code", "review before pr".
args: "[BASE_BRANCH]"
---

# Review Local Branch Changes

Self-review your branch vs a base branch before pushing or opening a PR. Checks architecture compliance, stack conventions, and code quality — on **changed files only**, not the whole codebase.

**ARGUMENTS:** (optional) base branch. Default: `main` (fallback to `master`).

## When to use this skill

- ✅ Before pushing your branch / opening a PR
- ✅ Before asking a teammate to review (catch easy issues first)
- ✅ Quick sanity check on a feature you've been working on
- ❌ Reviewing someone else's PR → use `/review-pr`
- ❌ Only checking DDD architecture → use `/review-architect`
- ❌ Security-only sweep → use `@security-audit` agent

## Read Architecture First

Detect stack via `~/.claude/architecture/_shared/stack-detection.md`. Load `ddd-architecture.md` + the stack doc — extract forbidden imports + conventions before reviewing.

Severity definitions: `~/.claude/architecture/_shared/severity-levels.md` (code severity table).

---

## Workflow

```
0 DETECT → 1 COLLECT → 2 BUILD+LINT → 3 ARCH → 4 CONVENTIONS → 5 QUALITY → 6 TESTS → 7 REPORT → 8 FIX
```

---

## Phase 0: DETECT

- [ ] Stack detected (ask user if ambiguous, e.g., monorepo)
- [ ] Architecture doc loaded
- [ ] Forbidden-imports list extracted

---

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

---

## Phase 2: BUILD + LINT

Run the stack's build + typecheck + lint commands. If any fail → mark **CRITICAL** and stop further review until they pass.

```bash
# Go:       go build ./... && go vet ./...
# NestJS:   pnpm typecheck && pnpm lint
# Laravel:  composer dump-autoload && ./vendor/bin/phpstan analyse
# Flutter:  dart analyze
# React/Remix: pnpm typecheck && pnpm lint
```

---

## Phase 3: ARCHITECTURE (changed files only)

Apply the stack's rules. Common checks per layer:

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

Quick check:
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

---

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

---

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

---

## Phase 6: TESTS

```bash
# Tests for changed domains only
CHANGED_DOMAINS=$(git diff "$BASE"...HEAD --name-only --diff-filter=ACMR \
  | grep -E '/(domain|modules|features)/' \
  | sed -E 's|.*(domain\|modules\|features)/([^/]+)/.*|\2|' | sort -u)

for d in $CHANGED_DOMAINS; do
  # Go:      go test ./internal/domain/$d/... -v
  # NestJS:  npx jest src/domain/$d
  # Laravel: ./vendor/bin/phpunit --filter $d
  # Flutter: flutter test test/domain/$d
  echo "Test $d"
done

# Full suite
{full_test_command}
```

---

## Phase 7: REPORT

```markdown
## Code Review: {branch} → {base}

**Stack:** {stack} · **Commits:** {N} · **Files:** {N} (+{add} / -{del})

### Build / Lint / Types
| Check | Status |
|-------|--------|
| Build | PASS/FAIL |
| Lint | PASS/FAIL |
| Types | PASS/FAIL |

### Architecture / Conventions / Quality
| # | Rule | Status | File:line |
|---|------|--------|-----------|
| D1 | Domain purity | PASS | — |
| G4 | No secrets | FAIL | `config/db.ts:42` hardcoded token |
| Q1 | Logic correctness | OK | — |

### Tests
| Check | Status |
|-------|--------|
| Changed area tests | PASS/FAIL |
| Full suite | PASS/FAIL |

### Issues (sorted by severity)
| # | Severity | File:line | Issue | Suggested fix |
|---|----------|-----------|-------|---------------|
| 1 | CRITICAL | config/db.ts:42 | hardcoded token | move to env |
| 2 | HIGH | handlers/user.ts:88 | business logic in handler | extract to usecase |

### Verdict
{APPROVED / CHANGES REQUESTED}
```

### Verdict rules
- **CRITICAL or HIGH found** → CHANGES REQUESTED
- **MEDIUM only** → CHANGES REQUESTED (should fix)
- **LOW only or nothing** → APPROVED (with suggestions if any)

---

## Phase 8: FIX (if user confirms)

1. Fix in order: CRITICAL → HIGH → MEDIUM → LOW
2. Re-run build + lint + tests after each batch
3. Re-run full review when all fixed
4. Report final status

---

## Hard Rules

- **Changed files only** — don't expand scope to drive-by reviews
- **Stop on CRITICAL** — fix build / lint / type errors before everything else
- **File:line for every issue** — no vague "somewhere in handlers"
- **Match severity honestly** — don't grade-inflate
- **Test changed areas** — don't only rely on global test run

---

## Related Skills

| When | Use |
|------|-----|
| Reviewing teammate's PR | `/review-pr` |
| Deep DDD audit of a domain | `/review-architect` |
| Fixing review comments on your PR | `/fix-pr-comment` |
| Fixing bugs surfaced here | `/fix-hotfix` |

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| 3 Architecture | `@clean-architect` | DDD compliance |
| 4 Conventions | `@security-audit` | Vulnerability sweep |
| 5 Quality | `@code-reviewer` | Code smells |
| 6 Tests | `@test-writer` | Coverage check |
| 8 Fix | Stack-specific dev agent | Apply fixes |
