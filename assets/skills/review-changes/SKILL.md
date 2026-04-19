---
name: review-changes
description: Review local branch changes for architecture compliance, conventions, and code quality before pushing/PR. Stack-aware — detects the project stack and applies the matching rules. Use when user says "review changes", "review branch", "check branch", "check changes", "review my code", "review before pr".
args: "[BASE_BRANCH]"
---

# Review Local Branch Changes

Review all code changes on the current branch (vs a base branch) for **architecture compliance**, **stack conventions**, and **code quality**. Focus on changed files only — not the entire codebase. This is the pre-PR companion to `pr-review` (which reviews remote PRs).

**ARGUMENTS:** (optional) base branch to compare against. Default: `main` (or `master` if `main` does not exist).

---

## Phase 0: Detect Stack & Load Architecture

Before reviewing, detect the project stack and load the matching architecture doc.

### Stack Detection
| File | Stack | Architecture Doc |
|------|-------|------------------|
| `go.mod` | Go | `go-backend.md` |
| `package.json` + `@nestjs/core` | NestJS | `nodejs-nestjs.md` |
| `package.json` + `vite.config.*` | React | `react-frontend.md` |
| `package.json` + `remix.config.*` | Remix | `remix-fullstack.md` |
| `pubspec.yaml` | Flutter | `flutter-mobile.md` |
| `composer.json` | Laravel | `laravel-backend.md` |

### Architecture Files Location (in priority order)
```
.claude/architecture/{name}.md     # Project-specific
~/.claude/architecture/{name}.md   # Global
```

Also read `ddd-architecture.md` / `clean-architecture.md` as the cross-stack baseline.

### Gate
- [ ] Stack detected (ask user if ambiguous — e.g., multi-stack monorepo)
- [ ] Architecture doc loaded
- [ ] Forbidden imports list extracted

---

## Phase 1: Collect Changes

```bash
# Resolve base branch
BASE=${1:-main}
git rev-parse --verify "$BASE" >/dev/null 2>&1 || BASE=master

echo "=== Base: $BASE ==="

echo "=== Changed files ==="
git diff "$BASE"...HEAD --name-only --diff-filter=ACMR

echo "=== Diff stat ==="
git diff "$BASE"...HEAD --stat

echo "=== Commits ==="
git log "$BASE"..HEAD --oneline
```

Categorize changed files by layer (map per architecture doc):

| DDD Layer | Typical Paths |
|-----------|---------------|
| Domain | `domain/`, `internal/domain/`, `src/domain/`, `lib/domain/` |
| Application | `application/`, `internal/application/`, `src/application/` |
| Infrastructure | `infrastructure/`, `internal/infrastructure/`, `src/infrastructure/` |
| Presentation / UI | `controllers/`, `pages/`, `components/`, `views/`, `ports/http/` |
| Persistence models | `models/`, `entities/` (ORM), `prisma/`, `migrations/` |
| Config / Bootstrap | `config/`, `bootstrap/`, `cmd/`, `main.*` |

Read ALL changed files before reviewing — never skim.

---

## Phase 2: Build & Lint

Run the stack's build + lint commands from the architecture doc:

```bash
# Go
go build ./... && go vet ./...

# NestJS / TypeScript
pnpm typecheck || npx tsc --noEmit
pnpm lint      || npx eslint "{src,test}/**/*.ts"

# Laravel
composer dump-autoload && ./vendor/bin/phpstan analyse

# Flutter
dart analyze

# React / Remix
pnpm typecheck && pnpm lint
```

If build/typecheck/lint fails → report immediately as **CRITICAL**. Stop further review until these pass.

---

## Phase 3: Architecture Checks (on changed files only)

Apply the rules from the stack's architecture doc ONLY to changed files. Do not re-review unchanged code.

### 3.1 Domain Layer (if changed)

| # | Rule | Check |
|---|------|-------|
| D1 | Domain purity | No forbidden imports (ORM, HTTP framework, cache client, queue, auth SDK) |
| D2 | No cross-domain imports | Domain A must NOT import Domain B (only shared kernel allowed) |
| D3 | No persistence-model imports | Domain must NOT import ORM entity classes / persistence models |
| D4 | Entity behavior | Not just data bag — has methods with state transitions |
| D5 | Entity raises events | Raises/collects events on state change (if architecture uses events) |
| D6 | Ports in ports/ folder | Interfaces MUST be in `ports/`, NOT inline in use-cases |
| D7 | One port per file | Each interface in a separate file |
| D8 | Ports use domain types | Return domain entities/value objects, not raw primitives |
| D9 | Value objects stdlib only | VOs import only stdlib — no domain/shared, no framework |
| D10 | Use-case no infra imports | Only entities + ports + events + value-objects |

```bash
# Generic domain-purity check (adapt FORBIDDEN for stack)
CHANGED_DOMAIN=$(git diff "$BASE"...HEAD --name-only --diff-filter=ACMR \
  | grep -E '^(src|internal|lib)/domain/' || true)

if [ -n "$CHANGED_DOMAIN" ]; then
  # Example forbidden-imports regex — replace per stack from architecture doc
  # Go:    '"gorm.io|"github.com/gin|"github.com/redis|"firebase.google.com|"github.com/hibiken'
  # Nest:  '"@nestjs/|"typeorm"|"@nestjs/typeorm|"ioredis|"bullmq|"passport'
  # Lara:  'Illuminate\\Database|Illuminate\\Http'
  FORBIDDEN='<PUT STACK FORBIDDEN REGEX HERE>'
  echo "=== D1: Domain purity ==="
  echo "$CHANGED_DOMAIN" | xargs grep -lEn "$FORBIDDEN" 2>/dev/null \
    && echo "FAIL" || echo "PASS"
fi
```

### 3.2 Application Layer (if changed)

| # | Rule | Check |
|---|------|-------|
| A1 | Handler is thin | No business logic — parse input → call service/use-case → return output |
| A2 | Service justified | Only when real orchestration exists (multiple use-cases, cross-cutting). Single-use-case forwarders are a smell — inject the use-case directly |
| A3 | Listener is side-effect only | No business logic — notifications, SSE, queue jobs, analytics only |
| A4 | Listener registered | Event registered in the registry / `event.emitter` module |
| A5 | Event names match | Event name string matches registry registration |
| A6 | DTOs validated at boundary | All controller inputs validated via schema/validator at entry |
| A7 | Composition root | Handlers/controllers must NOT build dependencies inline — all wiring lives in the composition root (bootstrap/module) |

### 3.3 Infrastructure Layer (if changed)

| # | Rule | Check |
|---|------|-------|
| I1 | Repository has no business logic | Pure persistence — queries, saves, deletes |
| I2 | Mappers exist | Explicit mapping between domain entity and ORM/persistence model |
| I3 | Implements port interface | Returns domain types per port contract |
| I4 | Context/transaction propagation | Uses project's context/transaction pattern consistently |

### 3.4 Persistence Models (if changed)

| # | Rule | Check |
|---|------|-------|
| M1 | ORM models outside domain | Persistence models live in infrastructure, NOT in domain |
| M2 | Migrations added for schema changes | Any schema change has a matching migration file |
| M3 | JSON / nullable columns correctly typed | Pointer/nullable types used where the column allows NULL |

---

## Phase 4: Stack-Specific Conventions

Read the **Conventions** / **Hard Rules** section from the architecture doc and check changed files against them. Common cross-stack checks:

| # | Rule | Check |
|---|------|-------|
| G1 | No swallowed errors | No empty `catch`/`if err != nil {}` that discards errors — must handle or rethrow |
| G2 | Goroutine/async context | Fire-and-forget async work uses background context, NOT request context |
| G3 | API-facing entities have serialization tags | `json:"..."` (Go), class-transformer/serializer decorators, `JsonSerializable`, etc. |
| G4 | No secrets in code | No hardcoded tokens, keys, passwords |
| G5 | Parameterized queries | No raw string-interpolated SQL |
| G6 | Input validation at boundary | All external input validated before touching domain |

---

## Phase 5: Code Quality (Manual)

Read the diff carefully. Look for:

| # | Area | What to look for |
|---|------|-----------------|
| Q1 | Logic correctness | Off-by-one, nil/null deref, wrong condition, missing edge case |
| Q2 | Error handling | Errors returned/wrapped, not silently ignored |
| Q3 | Concurrency safety | Race conditions, shared mutable state, goroutine/async leaks |
| Q4 | Resource leaks | Unclosed connections, HTTP bodies, file handles, subscriptions |
| Q5 | Naming clarity | Variables/functions clearly describe intent |
| Q6 | Dead code | Unreachable code, unused variables, commented-out blocks |
| Q7 | Duplication | Significant copy-paste across changed files |
| Q8 | Breaking changes | API contract changes, removed fields, changed behavior |
| Q9 | Over-engineering | Abstractions not justified by the change — fewer layers is usually better |
| Q10 | Test coverage | New logic has tests; bug fixes have regression tests |

---

## Phase 6: Tests

```bash
# Run tests for changed domains / features only
CHANGED_DOMAINS=$(git diff "$BASE"...HEAD --name-only --diff-filter=ACMR \
  | grep -E '/(domain|modules|features)/' \
  | sed -E 's|.*(domain\|modules\|features)/([^/]+)/.*|\2|' \
  | sort -u)

for d in $CHANGED_DOMAINS; do
  echo "--- Testing $d ---"
  # Go:     go test ./internal/domain/$d/... -v
  # Nest:   npx jest src/domain/$d
  # Lara:   ./vendor/bin/phpunit --filter $d
  # Flutter: flutter test test/domain/$d
done

echo "=== Full test suite ==="
# Stack's full test command
```

---

## Phase 7: Report

```markdown
## Code Review: {branch} → {base}

### Summary
- **Stack:** {stack}
- **Architecture doc:** {path}
- **Commits:** {count}
- **Files changed:** {count} ({additions}+ / {deletions}-)
- **Areas affected:** {domain list / feature list}

### Build, Lint, Types
| Check | Status |
|-------|--------|
| Build | PASS/FAIL |
| Lint | PASS/FAIL |
| Types | PASS/FAIL |

### Architecture Checks
| # | Rule | Status | Details |
|---|------|--------|---------|
| D1 | Domain purity | PASS/FAIL | {file:line} |
| ... | ... | ... | ... |

### Conventions
| # | Rule | Status | Details |
|---|------|--------|---------|
| G1 | No swallowed errors | PASS/WARN | {file:line} |

### Code Quality
| # | Area | Status | Details |
|---|------|--------|---------|
| Q1 | Logic correctness | OK/ISSUE | ... |

### Tests
| Check | Status |
|-------|--------|
| Changed area tests | PASS/FAIL |
| Full test suite | PASS/FAIL |

### Issues Found
| # | Severity | File:Line | Description | Suggested Fix |
|---|----------|-----------|-------------|---------------|
| 1 | CRITICAL/HIGH/MEDIUM/LOW | path:123 | ... | ... |

### Verdict
{APPROVED / CHANGES REQUESTED}
```

---

## Severity Levels

| Level | Meaning | Examples |
|-------|---------|---------|
| CRITICAL | Build fails, crash, data loss, security hole | Build error, nil deref, SQL injection, circular import, leaked secret |
| HIGH | Architecture violation, silent bug | Domain imports ORM, cross-domain import, swallowed error, race condition |
| MEDIUM | Convention violation, code smell | Missing serialization tags, business logic in handler, no tests for new logic |
| LOW | Style, naming, minor improvement | File naming, redundant code, unclear name |

**CRITICAL + HIGH = CHANGES REQUESTED** (must fix before PR)
**MEDIUM only = CHANGES REQUESTED** (should fix)
**LOW only = APPROVED with suggestions**

---

## Phase 8: Fix (if user confirms)

If user says to fix:
1. Fix each issue in order: CRITICAL → HIGH → MEDIUM → LOW
2. Re-run build/lint/tests after each batch
3. Re-run the full review when all fixed
4. Report final status

---

## Relationship to Other Skills

| Skill | When to use |
|-------|-------------|
| `review-changes` (this) | Local branch changes, pre-push / pre-PR |
| `pr-review` | Remote PR review via `gh pr` — includes posting feedback to GitHub |
| `architect-review` | Deep DDD architecture audit of a domain (not just changes) |
| `fix-pr-comment` | Fix feedback posted on an existing PR |
