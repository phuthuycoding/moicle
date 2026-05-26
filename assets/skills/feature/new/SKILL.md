---
name: feature-new
description: DDD feature development workflow with phase-based checks and review loop. Use when implementing new features, building functionality, or when user says "implement feature", "add feature", "build feature", "create feature", "new feature".
args: "[DOMAIN] [FEATURE]"
---

# DDD Feature Development Workflow

Build a new feature following DDD layers with rule checks per phase and a final review loop until score ≥ B.

**ARGUMENTS:** `<domain> <feature>` — e.g., `wallet savings`, `notification broadcast`, `catalog products`

## When to use this skill

- ✅ Feature spans multiple DDD layers (domain + app + infra)
- ✅ The approach is well-understood (no major research / prototype needed)
- ✅ You want automated architecture review at the end
- ❌ Quick bug fix → use `/fix:hotfix`
- ❌ Don't know the right approach yet → `/research:web` or `/research:spike` first
- ❌ Restructuring existing code → use `/feature:refactor`

## Read Architecture First

Detect stack via `~/.claude/architecture/_shared/stack-detection.md`. Load `ddd-architecture.md` + the stack doc — extract directory layout, layer rules, forbidden imports, check scripts before any code.

---

## Workflow

```
1 PLAN → 2 DOMAIN → 3 INFRA → 4 APP → 5 WIRE → 6 TESTS → REVIEW LOOP
```

---

## Phase 1: PLAN

### 1.1 Read a reference module
Pick the smallest existing module in the project as a template. Read ALL its files end-to-end:
- entities, value objects, events, ports, usecases
- service, handler, DTOs, listeners
- infrastructure store/API
- registration in router/provider/registry

### 1.2 Plan the feature

Present to the user:

```markdown
## Feature Plan: {domain}/{feature}

### Entities + fields
- `{Entity}` — {field: type, with constraint}
- ...

### Value Objects
- `{Status}` — states: {list}, transitions: {list}
- ...

### Endpoints / screens / commands
| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/v1/wallets/:id/savings | Open savings account |

### Domain events
| Event | Triggered when | Listeners |
|-------|----------------|-----------|
| `SavingsAccountOpened` | After Account.open() succeeds | NotificationListener |

### Business rules
- Cannot open savings if main balance < min threshold
- Interest accrues nightly via scheduled job
- ...

### Files to create
- `domain/wallet/entities/savings_account.go`
- `domain/wallet/valueobjects/savings_status.go`
- `domain/wallet/ports/savings_store.go`
- `domain/wallet/usecases/open_savings.go`
- `application/ports/http/savings_handler.go`
- `infrastructure/database/savings_store.go`
- (+ tests for each domain file)
```

### Gate
- [ ] Architecture docs read
- [ ] Reference module read end-to-end
- [ ] Plan presented
- [ ] **User CONFIRMED** before any code is written

---

## Phase 2: DOMAIN LAYER

Build in order: **value objects → entities → events → ports → usecases**.

- **Value Objects** — typed values with behavior (`IsTerminal()`, `CanTransitionTo()`). Stdlib imports only.
- **Entities** — constructor + behavior methods + guard methods (`isActive()`, `canXxx()`) + business error types. Raise events on state change. Imports: stdlib + valueobjects + domain/shared.
- **Events** — one file per event, extend base event, carry data listeners need.
- **Ports** — one file per interface. Store ports use domain types. Platform-agnostic naming. No infra imports.
- **UseCases** — constructor with port deps + event dispatcher. Split by concern. Business logic lives here. Dispatch events after persistence. No infra imports.

### Gate
```bash
{build_domain} && echo PASS || echo FAIL
{grep_forbidden in domain/} && echo FAIL || echo PASS
{cross_domain_check}        && echo FAIL || echo PASS
```

---

## Phase 3: INFRASTRUCTURE LAYER

### 3.1 Persistence models (if applicable)
- ORM models, Prisma schema, Freezed classes
- Table/collection config
- Helpers for atomic updates

### 3.2 Store / API implementations
- Implements port interfaces from domain
- Compile-time interface check (where supported)
- Mapper functions: domain entity ↔ persistence model
- NO business logic
- Use context consistently

### Gate
- [ ] Infra build passes
- [ ] All ports from Phase 2 have an implementation

---

## Phase 4: APPLICATION LAYER

### 4.1 Service
- Thin wrapper delegating to usecases
- Can orchestrate cross-domain calls

### 4.2 Handler / Controller / Screen
- Wiring function: store → usecase → service → handler → routes
- Thin: parse → service → respond
- DTOs in separate file

### 4.3 Listeners (if domain raises events)
- One file per event
- Side-effects only (notifications, SSE, analytics, jobs)
- Background context for async work
- Register in event bus

### Gate
- [ ] App build passes
- [ ] Every event has a registered listener (if needed)

---

## Phase 5: WIRING

### 5.1 Router / Provider
- Add routes / screens / providers for the new module
- Wire service dependencies if cross-module

### 5.2 Persistence setup
- Add migrations / schema files
- Run migrations on dev DB

### 5.3 Event registry
- Register all new listeners
- Verify event name strings match across event ↔ registry

### Gate
- [ ] Full build passes
- [ ] Routes / providers registered
- [ ] Migrations applied locally

---

## Phase 6: TESTS

### Value Object tests
- All status transitions
- Terminal states
- Behavior methods
- Edge cases

### Entity tests
- Constructor
- State transitions
- Event collection after change
- Guard methods
- Boundary values

### UseCase tests
- Mock port interfaces
- Happy path per method
- Validation errors
- Business rules
- Event dispatching

### Gate
- [ ] All domain tests pass
- [ ] Coverage on new code ≥ 80%

---

## Review Loop

```
LOOP:
  1. /review:architect {stack} {domain}
  2. IF violations severity ≥ MEDIUM:
       fix all → build → tests → GOTO 1
  3. IF score ≥ B → BREAK
```

---

## Final Report

```markdown
## Feature Complete: {domain}/{feature}

### Files
- Created: {N}, Modified: {N}

### Endpoints / Screens
| Method | Route | Description |
|--------|-------|-------------|

### Domain Events
| Event | Listeners |
|-------|-----------|

### Test coverage
- {N} test files, {M} cases — value objects + entities + usecases

### Review score: {A/B}
- Build / Lint / Domain purity / Tests: all PASS
```

---

## Hard Rules

- **Read reference module first** — your code should look like the rest of the codebase
- **User confirms the plan** before any code is written
- **Phase order is sequential** — don't skip ahead
- **Domain has zero framework imports** — enforce via grep in Phase 2 gate
- **Listeners handle side-effects** — never call notifications/SSE/analytics from usecase
- **Don't merge with score < B** — fix violations or document the waiver

---

## Related Skills

| When | Use |
|------|-----|
| Don't know approach yet | `/research:web` → then this skill |
| Want to validate by prototyping | `/research:spike` → then this skill |
| Adding only an endpoint | `/feature:api` |
| Restructuring existing module | `/feature:refactor` |
| Architecture check (called automatically in Phase 7) | `/review:architect` |
| Write tests inline (TDD style) | `/review:tdd` |

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| PLAN | `@clean-architect` | Architecture design |
| BUILD | Stack-specific dev agent | Implementation |
| BUILD | `@db-designer` | Schema if new tables needed |
| BUILD | `@api-designer` | API surface if exposed |
| TESTS | `@test-writer` | Domain tests |
| REVIEW | `@code-reviewer` | Code quality |
| REVIEW | `@security-audit` | Security check |
