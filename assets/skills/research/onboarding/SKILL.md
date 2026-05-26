---
name: research-onboarding
description: Codebase onboarding workflow for understanding new projects. Use when joining a project, exploring codebase, or when user says "explain codebase", "onboard me", "new to project", "understand project", "explore codebase", "project overview".
---

# Codebase Onboarding Workflow

Ramp up on a new codebase quickly: structure, conventions, where things live, how to make a first change.

## When to use this skill

- ✅ Just joined a project / repo and need to ramp up
- ✅ Returning to a codebase you haven't touched in months
- ✅ Need to give a teammate a structured walkthrough
- ❌ Want to generate full docs site → use `/docs:sync`
- ❌ Need to fix a specific bug → use `/fix:hotfix` / `/fix:root-cause`
- ❌ Only want a quick file lookup → just use `grep` / `find`

## Read Architecture First

Detect stack with `~/.claude/architecture/_shared/stack-detection.md`. Read `ddd-architecture.md` + the stack doc. Architecture context speeds up everything below by 10x.

---

## Workflow

```
SCAN → ANALYZE → EXPLAIN → GUIDE (first commit checklist)
```

---

## Phase 1: SCAN (10-20 min)

**Goal:** map the territory before reading any business code.

```bash
# Structure
tree -L 2 -I 'node_modules|vendor|dist|build|.git'

# Tech surface
ls -la | grep -E "package.json|pubspec.yaml|go.mod|composer.json|Dockerfile|Makefile"

# Existing docs
find . -maxdepth 3 -name "README*" -o -name "CONTRIBUTING*" -o -name "ARCHITECTURE*"

# Activity
git log --oneline -20
git shortlog -sn --since=3months | head -10
```

### Capture
- Top-level layout (≤2 levels)
- Tech stack + main dependencies (5-10 biggest)
- Existing docs found (read in next phase)
- Active contributors + recent commit themes

### Gate
- [ ] Stack detected (or asked user if ambiguous)
- [ ] Top-level structure understood
- [ ] Existing docs inventoried

---

## Phase 2: ANALYZE (30-60 min)

**Goal:** understand layer boundaries, conventions, and the "shape" of code.

### Read in this order
1. `README.md` — purpose + setup
2. `ARCHITECTURE.md` / `CONTRIBUTING.md` if present
3. **One existing module end-to-end** — pick the smallest with a full layer stack (e.g., `domain/user/`). Trace: entity → port → usecase → handler → test.
4. Cross-domain wiring (event bus / DI / router registration)
5. CI config (`.github/workflows/`, `Makefile`) — what's enforced?

### Capture
- Architecture pattern (DDD / MVC / clean / hexagonal — match against `ddd-architecture.md`)
- Naming conventions (file, function, test)
- Where business logic lives (usecase vs service vs handler)
- How errors are returned (typed, panics, error wrapping)
- Test framework + folder convention
- How code reaches prod (CI checks, release process)

### Gate
- [ ] One module read end-to-end
- [ ] Layer boundaries understood
- [ ] Test + CI conventions known

---

## Phase 3: EXPLAIN

**Goal:** produce a 1-page mental model that someone else can read.

```markdown
## Project: {name}

### Purpose
{1-2 sentences: what business problem this solves}

### Stack
- Language: {go 1.22 / node 20 / dart 3.x / ...}
- Framework: {gin / nestjs / remix / flutter ...}
- DB: {postgres + sqlc / prisma / eloquent ...}
- Infra: {docker, k8s on GKE, redis, kafka ...}

### Architecture
{1 sentence: e.g., "DDD with hexagonal — domain-pure, infra implements ports"}

```
{ascii or mermaid: top-level layer diagram}
```

### Domains
| Domain | Responsibility |
|--------|----------------|
| {name} | {one line} |

### Where to find things
| If you need to... | Look in |
|-------------------|---------|
| Add a route | `application/ports/http/<domain>_handler` |
| Add business logic | `domain/<domain>/usecases` |
| Add a DB query | `infrastructure/database/<domain>_store` |
| Add a domain event | `domain/<domain>/events` + register in event bus |
| Add a test | `*_test.go` next to the source file |

### Conventions
- Error handling: {pattern}
- Logging: {library + level convention}
- Config: {env vars / yaml / both}
- Branch / commit: {convention}

### Gotchas
- {anything surprising — e.g., "cache TTL is 30s, not 5 min like the comment says"}
```

### Gate
- [ ] 1-page mental model written
- [ ] "Where to find things" table covers ≥5 common tasks
- [ ] At least 1 gotcha documented (every codebase has them)

---

## Phase 4: GUIDE — first commit checklist

**Goal:** unblock the first real change. The fastest ramp-up is shipping code.

### Pick a "quick win" task
- ≤30 min change (typo, comment, missing test, small UX nit)
- Touches one layer only
- Has a clear success criterion

### First commit checklist
- [ ] Local env runs: build + lint + tests all green from a fresh clone
- [ ] Made the change in the right layer (per Phase 3 table)
- [ ] Added or updated 1 test
- [ ] Followed naming + error-handling conventions
- [ ] Commit message matches project style (`git log --oneline`)
- [ ] PR description follows template (check `.github/PULL_REQUEST_TEMPLATE.md`)
- [ ] Self-reviewed with `/review:branch` before opening PR

### Who to ask
- Architecture / "why is it like this": {tech lead from git shortlog}
- Domain knowledge for area X: {recent committer to that domain}
- Infra / deploy: {ops contact from README}

### Gate
- [ ] Local env verified
- [ ] First "quick win" task picked
- [ ] First-commit checklist printed

---

## Final Report

```markdown
## Onboarding Complete: {project}

### Mental Model
- Stack: {...}
- Architecture: {...}
- {N} domains identified

### Output
- Saved 1-page overview to {path}
- "Where to find things" table → {path}
- Gotchas list → {path}

### First Commit
- Task: {quick-win}
- Local env: ✅ build / ✅ lint / ✅ tests
- PR will follow: {project PR template}
```

---

## Hard Rules

- **Read one module end-to-end before reading 10 partially** — the trace teaches more than skimming
- **Capture gotchas as you find them** — they vanish from memory in days
- **First commit ≤30 min** — bigger first changes get rabbit-holed
- **Don't refactor on day 1** — earn context before changing conventions

---

## Related Skills

| When | Use |
|------|-----|
| Generate full doc site after onboarding | `/docs:sync` |
| Build first real feature after onboarding | `/feature:new` |
| First bug fix to learn the codebase | `/fix:hotfix` |
| Author / update the onboarding doc itself | `/docs:write` |

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| SCAN | `@clean-architect` | Identify architecture pattern |
| ANALYZE | `@clean-architect` | Layer + boundary analysis |
| ANALYZE | `@code-reviewer` | Conventions + smell check |
| ANALYZE | `@security-audit` | Security patterns |
| EXPLAIN | `@docs-writer` | 1-page overview |
| GUIDE | `@docs-writer` | First-commit checklist |
