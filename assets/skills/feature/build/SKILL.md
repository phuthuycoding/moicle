---
name: feature-build
description: Feature lifecycle workflow — build new DDD features, refactor existing code into DDD, add/integrate APIs, or deprecate features. Stack-aware with phase-based checks and a review loop. Use when user says "implement feature", "add feature", "build feature", "create feature", "new feature", "refactor", "clean up", "improve code", "restructure", "migrate to ddd", "refactor ddd", "integrate api", "add endpoint", "new api", "connect api", "api integration", "deprecate", "remove feature", "sunset", "phase out", "delete feature".
args: "[MODE] [DOMAIN] [FEATURE]"
---

# Feature Build Workflow

One skill for the full lifecycle of a feature: **create it, restructure it, expose it via API, or sunset it** — all following DDD layers with rule checks per phase and a review loop.

**ARGUMENTS:** `<mode> <domain> <feature>` — `mode` ∈ `new | refactor | api | deprecate`. e.g. `new wallet savings`, `refactor marketing notification`, `api catalog`, `deprecate payments legacy-checkout`.

## Pick your mode

| If you are… | Mode | Jump to |
|-------------|------|---------|
| Building a brand-new feature across DDD layers | **NEW** | [Mode NEW](#mode-new) |
| Restructuring existing code into DDD / fixing drift | **REFACTOR** | [Mode REFACTOR](#mode-refactor) |
| Adding an endpoint or integrating a third-party API | **API** | [Mode API](#mode-api) |
| Safely sunsetting a feature / endpoint / module | **DEPRECATE** | [Mode DEPRECATE](#mode-deprecate) |

- ❌ Quick bug fix → use `/fix-bug`
- ❌ Don't know the right approach yet → `/research-explore` (WEB or SPIKE) first
- ❌ Multi-step task you want to run as a tracked checklist loop → `/feature-track`

## Read Architecture First (all modes)

Detect stack via `~/.claude/architecture/_shared/stack-detection.md`. Load `ddd-architecture.md` + the stack doc — extract directory layout, layer rules, forbidden imports, check scripts before any code. Severity definitions live in `~/.claude/architecture/_shared/severity-levels.md`.

---
---

# Mode NEW

Build a new feature following DDD layers with rule checks per phase and a final review loop until score ≥ B.

## When to use

- ✅ Feature spans multiple DDD layers (domain + app + infra)
- ✅ The approach is well-understood (no major research / prototype needed)
- ✅ You want automated architecture review at the end
- ❌ Restructuring existing code → use **Mode REFACTOR**
- ❌ Adding only an endpoint → use **Mode API**

## Workflow

```
1 PLAN → 2 DOMAIN → 3 INFRA → 4 APP → 5 WIRE → 6 TESTS → REVIEW LOOP
```

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

## Phase 6: TESTS

### Value Object tests
- All status transitions, terminal states, behavior methods, edge cases

### Entity tests
- Constructor, state transitions, event collection after change, guard methods, boundary values

### UseCase tests
- Mock port interfaces, happy path per method, validation errors, business rules, event dispatching

### Gate
- [ ] All domain tests pass
- [ ] Coverage on new code ≥ 80%

## Review Loop (NEW)

```
LOOP:
  1. /review-code architect {stack} {domain}
  2. IF violations severity ≥ MEDIUM:
       fix all → build → tests → GOTO 1
  3. IF score ≥ B → BREAK
```

## Final Report (NEW)

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
---

# Mode REFACTOR

Restructure existing code into DDD layers, or fix drift in an existing DDD module. **Preserves behavior** — refactor structure, never change logic.

## When to use

- ✅ Migrating a legacy module into DDD layers
- ✅ Existing DDD module has drifted (fat controller, anemic entity, mixed concerns)
- ✅ Splitting one domain into multiple bounded contexts
- ❌ Building a brand-new feature → use **Mode NEW**
- ❌ Just renaming files / variables → just do it
- ❌ Fixing a bug → use `/fix-bug`

## Workflow

```
0 FOUNDATION → 1 ANALYZE → 2 DOMAIN → 3 INFRA → 4 APP → 5 TESTS → 6 CLEANUP → REVIEW LOOP
```

Each phase has a Rule Check. Do not skip any phase.

## Phase 0: FOUNDATION

**New project (no `domain/` yet):** create
- `domain/shared/` — base event types, event collector, dispatcher interface
- Event bus infrastructure
- App bootstrap/config struct

**Existing project:** verify
```bash
ls {domain_root}/shared/ 2>/dev/null && echo PASS || echo NEED SETUP
ls {eventbus_path}/ 2>/dev/null && echo PASS || echo NEED SETUP
```

If FAIL → set up foundation before continuing.

### Gate
- [ ] Shared domain types exist
- [ ] Event infrastructure exists (if domain raises events)

## Phase 1: ANALYZE

**Goal:** read ALL source files in the old module before touching anything.

### Read
- All files in the module dir
- Related models / types / enums
- Routes / providers / screens for this module
- Existing tests (CRITICAL — used in Phase 5)

### Output to user
```markdown
## Refactor Plan: {module} → {domain}

### Current state
- Entities/models: {list with fields}
- Usecases (functions): {list with 1-line logic summary}
- DTOs: {list}
- Cross-module calls: {list}
- Side-effects: {notifications / SSE / analytics / async jobs}
- External deps: {DB, cache, messaging}
- Endpoints/screens: {list with method + path}
- Test files: {list with case counts}

### Proposed DDD structure
- Value objects to extract: {list}
- Entities: {list}
- Events: {list}
- Ports: {list}
- Usecases: {list}
- Listeners: {list}
```

### Gate
- [ ] All module files read
- [ ] Plan presented to user
- [ ] **User CONFIRMED** before continuing

## Phase 2: DOMAIN LAYER

Create `domain/{domain}/` (or add to existing). **Order: VO → entities → events → ports → usecases**.

- **Value Objects** (`valueobjects/`) — extract typed values (status strings, rates, amounts). Immutable + behavior methods. Stdlib imports only.
- **Entities** (`entities/`) — convert old models. Constructor + behavior methods + event collection. Add mappers to/from persistence. No framework imports.
- **Events** (`events/`) — one file per event. Extract from existing direct side-effect calls.
- **Ports** (`ports/`) — one file per interface. Store ports (persistence), adapter ports (external services). Platform-agnostic naming (`URLParser` not `ShopeeURLParser`). No infra imports.
- **UseCases** (`usecases/`) — extract business logic from old controllers/handlers/services. Import from `ports/`. Split by concern, ≤200 lines/file. No infra imports.

### Gate
```bash
{build_domain} && echo PASS || echo FAIL
{grep_forbidden in domain/} && echo FAIL || echo PASS
{cross_domain_check} && echo FAIL || echo PASS
```

## Phase 3: INFRASTRUCTURE LAYER

- Implement port interfaces from `domain/{domain}/ports/`
- Mapper functions: domain entity ↔ persistence model
- Compile-time interface check (where supported)
- NO business logic
- Keep existing persistence models in place

### Gate
- [ ] Infra build passes
- [ ] All port interfaces implemented

## Phase 4: APPLICATION LAYER

### 4.1 Listeners (extract side-effects)
**CRITICAL:** Side-effects (notifications, SSE, analytics, jobs) **MUST NOT** be called directly in usecases or infra. Flow must be: entity collects event → usecase dispatches → listener handles.

- One file per event listener
- Register in event bus

### 4.2 Service
- Thin wrapper, delegates to usecases. No business logic.

### 4.3 Handler / Controller / Screen
- Registration / wiring function
- Thin: parse → service → return
- DTOs in separate file
- **All endpoints must match the old paths + methods**

### Gate
- [ ] App build passes
- [ ] Every old endpoint has a new handler at the same path

## Phase 5: TESTS

**CRITICAL:** read old tests first, copy every scenario. Do not lose coverage.

1. Read all old test files
2. List all test cases + business scenarios
3. Write domain tests covering all of them

### What to test
- **Entities** — behavior methods, edge cases, business rules (pure, no mocks)
- **UseCases** — happy + error paths, validation, event collection (mock ports)
- **Value Objects** — transitions, calculations, edge cases (pure)

### Gate
- [ ] Old test count ≤ new test count
- [ ] Every old scenario covered
- [ ] `{test_command}` passes

## Phase 6: INTEGRATION & CLEANUP

### 6.1 Wire up the new module
- Add registration calls in router / provider / registry
- Remove old module registrations
- Endpoints/screens match old paths

### 6.2 Remove old module
- Delete old directory **only after** build + tests pass
- Do NOT delete shared models/types other modules still use

### Gate
```bash
{full_build} && echo PASS || echo FAIL
test -d {old_module_path} && echo "FAIL: still there" || echo PASS
grep -r "{old_import_path}" --include="*.{ext}" . && echo "FAIL: stale imports" || echo PASS
```

## Review Loop (REFACTOR)

After Phase 6, call `/review-code architect {stack} {domain}`. Loop until score ≥ B.

```
LOOP:
  1. /review-code architect {stack} {domain}
  2. IF violations severity ≥ MEDIUM:
       fix all → full build → all tests → GOTO 1
  3. IF score ≥ B → BREAK
```

## Final Report (REFACTOR)

```markdown
## Refactor Complete: {module} → {domain}

### Changes
- Files created: {N}, modified: {N}, deleted: {N}

### Endpoints preserved
| Old path | New handler | Status |
|----------|-------------|--------|

### Domain events introduced
| Event | Listener(s) |
|-------|-------------|

### Tests
- Files: {N}, cases: {M} — all old scenarios migrated: YES

### Review score: {A/B}
- Build / Lint / Domain purity / Old module removed / No stale imports / Tests: all PASS
```

---
---

# Mode API

End-to-end workflow for designing, implementing, testing, and documenting APIs — both internal endpoints and third-party integrations.

## When to use

- ✅ Adding a new REST / GraphQL endpoint to your service
- ✅ Integrating a third-party API (Stripe, OpenAI, etc.) into the system
- ✅ Replacing or upgrading an existing API integration
- ❌ Just need a one-off HTTP call in a script → use Bash directly
- ❌ Need to research which API to use → use `/research-explore` (WEB) first
- ❌ Building a whole new domain → use **Mode NEW** (which covers the API surface as Phase 4)

## Workflow

```
DESIGN → IMPLEMENT → TEST → DOCUMENT → REVIEW LOOP
```

Before any phase, also read existing API conventions in the project (look at 1–2 existing endpoints as reference).

## Phase 1: DESIGN

**Goal:** lock the API contract before writing any code.

### Actions
1. Identify API type: REST / GraphQL / gRPC / third-party client
2. Define contract:
   - Endpoints / operations (method + path)
   - Request / response schema (use real types from domain entities)
   - Auth method
   - Error codes per endpoint
   - Pagination (cursor or offset) — pick ONE, apply to all list endpoints
   - Idempotency keys for POST/PUT (if applicable)
3. Write the contract as **OpenAPI 3.0** (REST) or **GraphQL SDL**

### Minimal OpenAPI skeleton

```yaml
openapi: 3.0.0
info: { title: <name>, version: 1.0.0 }
servers: [{ url: https://api.example.com/v1 }]
components:
  securitySchemes:
    BearerAuth: { type: http, scheme: bearer }
  schemas:
    Error: { type: object, properties: { code: { type: string }, message: { type: string } } }
paths:
  /resource:
    post:
      summary: Create resource
      security: [{ BearerAuth: [] }]
      requestBody: { content: { application/json: { schema: { $ref: '#/components/schemas/CreateInput' } } } }
      responses:
        '201': { description: Created, content: { application/json: { schema: { $ref: '#/components/schemas/Resource' } } } }
        '400': { description: Validation error, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
```

### Gate
- [ ] Endpoints listed in a table (method, path, auth, purpose)
- [ ] Request / response schemas defined
- [ ] Error codes listed (with stable string codes, not just HTTP status)
- [ ] Pagination strategy chosen (cursor preferred)
- [ ] **User CONFIRMED contract** before continuing

## Phase 2: IMPLEMENT

**Goal:** implement the contract per stack conventions, respecting DDD layers.

### Layered placement (DDD)

| Concern | Layer | Notes |
|---------|-------|-------|
| Route definition | `application/ports/http/` | Thin handler: parse → service → respond |
| Request / Response DTOs | `application/ports/http/dto/` | NOT domain types |
| Validation | Handler or domain (depending on stack) | Reject bad input before reaching usecase |
| Business logic | `domain/{domain}/usecases/` | NEVER in the handler |
| External API client | `infrastructure/adapters/` | Implements a port in `domain/{domain}/ports/` |
| Auth check | Middleware / decorator | NOT inline in handler |

### Standard error response

All endpoints return errors in the same shape:

```json
{ "error": { "code": "STRING", "message": "human-readable", "details": {} } }
```

`code` is stable across versions; `message` may change. Map domain errors → HTTP codes in ONE place (middleware / interceptor).

### Standard pagination (cursor)

```
GET /resource?cursor=<opaque>&limit=<int 1..100, default 20>
→
{
  "data": [...],
  "pagination": { "next_cursor": "..." | null }
}
```

### Gate
- [ ] Routes registered in router / app module
- [ ] Handler is thin (parse → service → respond)
- [ ] Business logic in usecase, not handler
- [ ] External calls go through infrastructure adapter
- [ ] Auth + validation in middleware, not handler
- [ ] Build passes: `{stack_build_command}`

## Phase 3: TEST

**Goal:** verify the contract holds and breaks safely.

### Test layers

| Layer | Type | What |
|-------|------|------|
| Handler | Unit | Validation, error mapping (mock service) |
| UseCase | Unit | Business logic (mock port) |
| Adapter (external API) | Integration | Real HTTP call to sandbox OR contract test with `nock` / `WireMock` |
| End-to-end | Integration | Full request → response, real DB |

### Mandatory test cases per endpoint
- [ ] Happy path
- [ ] Auth failure (missing / invalid token)
- [ ] Validation failure (each required field missing)
- [ ] Permission failure (valid token, wrong scope)
- [ ] Not found (where applicable)
- [ ] Rate limit / quota (where applicable)
- [ ] Idempotency (POST with same key returns same response)

### Gate
- [ ] All mandatory cases covered
- [ ] Tests pass: `{stack_test_command}`
- [ ] Error response shape verified in tests

## Phase 4: DOCUMENT

**Goal:** update API docs so consumers can use it without reading code.

### What to update
1. **OpenAPI spec** committed to repo (`openapi.yaml` or per-resource files)
2. **API.md** — append the new endpoint(s) (or use `/docs-sync` for full re-author)
3. **CHANGELOG.md** — note breaking / additive changes
4. **README.md** — if this changes quick-start

### Endpoint doc entry (minimal)

```markdown
### POST /resource

Create a resource. Idempotent via `Idempotency-Key` header.

**Auth:** Bearer

**Request**  `{ "field": "value" }`

**Response 201**  `{ "id": "...", "field": "value" }`

**Errors**
| Code | HTTP | Meaning |
|------|------|---------|
| `invalid_field` | 400 | `field` failed validation |
| `unauthorized` | 401 | Token missing or invalid |
| `already_exists` | 409 | Same idempotency key with different body |
```

### Gate
- [ ] OpenAPI spec updated and lints
- [ ] API.md entry added
- [ ] CHANGELOG entry
- [ ] At least 1 example request runs successfully (curl / Postman)

## Review Loop (API)

Run `/review-code architect` for the touched domain. Loop until score ≥ B.

```
LOOP:
  1. /review-code architect {stack} {domain}
  2. Fix violations → re-run tests + build → GOTO 1 (until score ≥ B)
```

## Final Report (API)

```markdown
## API Integration Complete

### Endpoints Added / Changed
| Method | Path | Purpose |
|--------|------|---------|

### Files Created
- `application/ports/http/resource_handler.{ext}`
- `domain/{domain}/usecases/create_resource.{ext}`
- `infrastructure/adapters/{external_service}.{ext}` (if applicable)

### Tests
- {N} test files, {M} test cases — handler, usecase, adapter, e2e

### Documentation
- [x] OpenAPI spec updated  [x] API.md entry added  [x] CHANGELOG entry

### Review Score: {A/B}
```

---
---

# Mode DEPRECATE

Safely sunset a feature, API, or module without breaking users. Built around a **timeline** (T-90 → T+30) and the principle that **announce → warn → migrate → remove → monitor**.

## When to use

- ✅ Sunsetting a public API endpoint, SDK method, or user-facing feature
- ✅ Removing an internal module that other domains depend on
- ✅ Migrating consumers from v1 → v2 of anything
- ❌ Just deleting unused dead code (no consumers) → just delete in PR with explanation
- ❌ Renaming an internal helper → just rename, no deprecation needed
- ❌ Removing a feature behind a flag with 0 users → just remove the flag

## Workflow

```
IDENTIFY → PLAN → MIGRATE → REMOVE → VERIFY
   ↓        ↓        ↓         ↓        ↓
 announce  warn   migrate   remove   monitor
 (T-90)  (T-60)  (T-30)     (T-0)   (T+30)
```

## Deprecation Strategy

| Strategy | When | Timeline |
|----------|------|----------|
| **Soft** | Internal API, replacement available, low usage | Announce → warn → migrate → remove (1–3 months) |
| **Hard** | Security issue, breaking infra change | Announce + remove fast (days to weeks, with mitigation) |
| **Versioned** | Public API, breaking change | Run v1 + v2 side-by-side, sunset v1 over months/years |

## Phase 1: IDENTIFY

**Goal:** know what you're removing and who depends on it.

### Actions
1. Define the target: feature / endpoint / module / class / method
2. Find ALL usages:
   ```bash
   grep -rn "{symbol}" --include="*.{ext}" .
   # for APIs, check access logs:
   {log_query for endpoint hits over last 30/90 days}
   ```
3. Identify consumers: internal teams / services, external users / SDK consumers, third-party integrations, docs and tutorials that reference it
4. Assess impact (per architecture layer): which layers reference it, cross-domain consumers, breaking change severity
5. Find replacement (or document "no replacement, here's the workaround")

### Output

```markdown
## Deprecation Analysis: {target}

### What
- Type: {feature / API / class / method / module}
- Location: {file:line(s)}
- Reason: {security / consolidation / better alternative / cost / etc.}

### Replacement
- {New API / pattern, with migration mapping}  OR  {no replacement — rationale}

### Usage
- Internal callers: {list with team contacts}
- External callers (last 30d): {N requests / N unique tokens}
- Docs referencing it: {list}

### Impact
- Layers affected: {domain / application / infra}
- Severity: {breaking / non-breaking}
- Estimated migration effort per consumer: {hours}
```

### Gate
- [ ] All usages found (internal + external)
- [ ] Stakeholders listed with contacts
- [ ] Replacement defined (or explicit "no replacement")
- [ ] Impact severity assessed

## Phase 2: PLAN

**Goal:** lock the timeline and the communication plan.

### Timeline template

| Phase | Date | Action |
|-------|------|--------|
| T-90 | {date} | Announce deprecation (changelog + email + docs banner) |
| T-60 | {date} | Add runtime warning (log / response header) |
| T-30 | {date} | Hard warning (UI banner / error in non-prod) |
| T-0 | {date} | Remove. Return 410 Gone for APIs |
| T+30 | {date} | Remove deprecation code itself, archive docs |

**Adjust** based on strategy: hard = days, public API = months/quarters.

### Comms checklist
- [ ] CHANGELOG entry
- [ ] Release notes
- [ ] Email to known consumers
- [ ] Docs banner on the deprecated feature page
- [ ] Migration guide written (with code diff before/after)
- [ ] Slack / forum announcement
- [ ] Updated SDK (if applicable) with deprecation in code

### Gate
- [ ] Timeline locked with dates
- [ ] Migration guide drafted
- [ ] Comms plan signed off by stakeholders
- [ ] Replacement available and documented

## Phase 3: MIGRATE

**Goal:** make consumers stop using the deprecated thing.

### Add deprecation markers (in code)

Pick the language idiom — show **what** is deprecated, **when** it goes away, and **what to use instead**.

```ts
/** @deprecated Removed on {date}. Use `newFunction()`. See {link}. */
export function oldFunction() { ... }
```

```go
// Deprecated: removed on {date}. Use NewFunction instead. See {link}.
func OldFunction() { ... }
```

```php
/** @deprecated since 2.0.0, removed in 3.0.0. Use newMethod(). See {link}. */
public function oldMethod() { ... }
```

```dart
@Deprecated('Removed on {date}. Use newWidget(). See {link}.')
class OldWidget { ... }
```

### Add runtime signal (for APIs)
- Response header: `Deprecation: true` + `Sunset: {RFC 3339 date}` + `Link: <docs>; rel="deprecation"`
- Server log: `deprecated.endpoint.called` with caller identity
- Metric: counter of deprecated calls, broken down by consumer

### Migrate internal consumers proactively
- Open PRs against internal consumers yourself when possible
- Track migration progress (% consumers migrated)

### Gate
- [ ] Deprecation markers in code
- [ ] Runtime signals in place (headers, logs, metrics)
- [ ] Internal usage trending down (verify weekly)
- [ ] Migration guide proven by ≥1 consumer

## Phase 4: REMOVE

**Goal:** delete the deprecated thing safely.

### Pre-removal checks
- [ ] Today's date ≥ T-0
- [ ] Usage metric shows 0 calls (or only known stragglers with explicit waiver)
- [ ] Final removal warning sent to remaining consumers
- [ ] Replacement still works and is documented

### Removal steps
1. Delete the code + tests + docs
2. For APIs: return `410 Gone` (NOT 404 — different meaning) with migration link in body
3. Remove DB columns / tables in a follow-up migration (NOT same PR — keep removal reversible)
4. Update CHANGELOG: "Removed: {thing}. See migration guide {link}."
5. Deploy through normal pipeline

### Gate
- [ ] Code, tests, docs removed
- [ ] API returns 410 (if applicable)
- [ ] CHANGELOG entry
- [ ] Deployed to all environments

## Phase 5: VERIFY (T+30)

**Goal:** confirm clean removal.

### Checks
- [ ] No errors related to the removed code in monitoring
- [ ] No customer support tickets about the missing feature
- [ ] No leftover references in code (grep for the symbol)
- [ ] Deprecation infra (warning headers, log alerts) cleaned up
- [ ] DB cleanup migration applied (if any)

### Final report

```markdown
## Deprecation Complete: {target}

### Timeline
- Announced: {date}  Removed: {date}  Verified: {date}

### Outcome
- Consumers migrated: {N/N}
- Errors post-removal: {0 / N — explanation}
- Replacement adoption: {%}

### Cleanup
- [x] Code removed  [x] Tests removed  [x] Docs removed
- [x] DB columns dropped (in {migration})  [x] Deprecation infra cleaned
```

## Anti-Patterns (DEPRECATE)

- **Silent removal** — removing without warning. Always announce first.
- **Vague deprecation** — `@deprecated` with no date and no replacement. Always include both.
- **Forever-deprecation** — marking deprecated and never removing. Set the date.
- **Returning 404 instead of 410** — 404 = "doesn't exist", 410 = "intentionally gone". Use 410.
- **Same-PR removal of API + DB columns** — keep removal reversible; drop columns in a follow-up.

---
---

## Hard Rules (all modes)

- **Read reference / old code first** — your code should look like the rest of the codebase; don't invent logic from variable names.
- **User confirms the plan / contract** before any code is written.
- **Phase order is sequential** — Rule Checks gate the next phase; don't skip ahead.
- **Domain has zero framework imports** — enforce via grep in the domain gate.
- **Listeners handle side-effects** — never call notifications/SSE/analytics from a usecase.
- **REFACTOR preserves behavior** — never change business logic; all endpoints keep their paths; read old tests so no scenario is lost.
- **API:** never put business logic in the handler; never call an external API directly from a usecase (go through an adapter implementing a domain port); error codes are stable strings; one pagination style; idempotency key for any state-creating POST.
- **DEPRECATE:** announce before removing; every `@deprecated` has a date + replacement; return 410 not 404; keep removal reversible.
- **Don't merge with score < B** — fix violations or document the waiver.

## Related Skills

| When | Use |
|------|-----|
| Don't know approach yet | `/research-explore` (WEB) → then NEW mode |
| Want to validate by prototyping | `/research-explore` (SPIKE) → then NEW mode |
| Run the work as a tracked checklist loop | `/feature-track` |
| Architecture / TDD / PR review | `/review-code` (ARCHITECT / TDD / PR modes) |
| Documenting the full API surface | `/docs-sync` |
| Quick bug fix instead | `/fix-bug` |

## Recommended Agents

| Phase / Mode | Agent | Purpose |
|--------------|-------|---------|
| PLAN / ANALYZE | `@clean-architect` | Architecture design / alignment |
| ANALYZE (REFACTOR) | `@refactor`, `@code-reviewer` | Refactor scope + smell detection |
| DESIGN (API) | `@api-designer` | API contract design (OpenAPI / GraphQL) |
| IDENTIFY (DEPRECATE) | `@refactor`, `@code-reviewer` | Dependency analysis + find usages |
| BUILD / IMPLEMENT | Stack-specific dev agent | Implementation |
| BUILD | `@db-designer` | Schema if new tables needed |
| TESTS | `@test-writer` | Domain / integration tests |
| REVIEW | `@code-reviewer`, `@security-audit` | Code quality + security |
| DOCUMENT / DEPRECATE | `@docs-writer` | OpenAPI + API.md + migration guide |
