---
name: feature-api
description: API integration workflow for adding new endpoints or integrating external APIs. Use when adding API endpoints, integrating third-party APIs, or when user says "integrate api", "add endpoint", "new api", "connect api", "api integration".
---

# API Integration Workflow

End-to-end workflow for designing, implementing, testing, and documenting APIs — both internal endpoints and third-party integrations.

## When to use this skill

- ✅ Adding a new REST / GraphQL endpoint to your service
- ✅ Integrating a third-party API (Stripe, OpenAI, etc.) into the system
- ✅ Replacing or upgrading an existing API integration
- ❌ Just need a one-off HTTP call in a script → use Bash directly
- ❌ Need to research which API to use → use `/research-web` first
- ❌ Building a whole new domain → use `/feature-new` (which calls this skill internally for the API surface)

---

## Workflow

```
DESIGN → IMPLEMENT → TEST → DOCUMENT → REVIEW LOOP
```

## Read Architecture First

Before any phase, read:
1. `~/.claude/architecture/ddd-architecture.md` (core DDD)
2. Stack-specific doc (`go-backend.md`, `nodejs-nestjs.md`, etc.)
3. Existing API conventions in the project (look at 1–2 existing endpoints as reference)

---

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

---

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

---

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

---

## Phase 4: DOCUMENT

**Goal:** update API docs so consumers can use it without reading code.

### What to update
1. **OpenAPI spec** committed to repo (`openapi.yaml` or per-resource files)
2. **API.md** — append the new endpoint(s) (or refer to `/docs-write` skill for full re-author)
3. **CHANGELOG.md** — note breaking / additive changes
4. **README.md** — if this changes quick-start

### Endpoint doc entry (minimal)

```markdown
### POST /resource

Create a resource. Idempotent via `Idempotency-Key` header.

**Auth:** Bearer

**Request**
```json
{ "field": "value" }
```

**Response 201**
```json
{ "id": "...", "field": "value" }
```

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

---

## Phase 5: REVIEW LOOP

Run `/review-architect` for the touched domain. Loop until score ≥ B.

```
LOOP:
  1. Run /review-architect {stack} {domain}
  2. Fix violations
  3. Re-run tests + build
  4. GOTO 1 (until score ≥ B)
```

---

## Final Report

```markdown
## API Integration Complete

### Endpoints Added / Changed
| Method | Path | Purpose |
|--------|------|---------|
| POST | /v1/resource | Create resource |

### Files Created
- `application/ports/http/resource_handler.{ext}`
- `domain/{domain}/usecases/create_resource.{ext}`
- `infrastructure/adapters/{external_service}.{ext}` (if applicable)

### Tests
- {N} test files, {M} test cases
- Coverage: handler, usecase, adapter, e2e

### Documentation
- [x] OpenAPI spec updated
- [x] API.md entry added
- [x] CHANGELOG entry

### Review Score: {A/B}
```

---

## Hard Rules

- **NEVER put business logic in the handler** — handler is thin parse-call-respond
- **NEVER call an external API directly from a usecase** — go through an infrastructure adapter that implements a domain port
- **Error codes are stable strings**, not just HTTP status — frontend/SDK depend on them
- **Pick one pagination style** for the whole API (cursor preferred), don't mix
- **Idempotency key required** for any POST that creates state

---

## Related Skills

| When | Use |
|------|-----|
| Designing the API contract from scratch | `@api-designer` agent |
| Adding the endpoint as part of a larger feature | `/feature-new` (calls this internally) |
| Writing tests for the endpoint | `/review-tdd` |
| Documenting the full API surface | `/docs-write` |
| Reviewing architecture compliance | `/review-architect` |

---

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| DESIGN | `@api-designer` | API contract design (OpenAPI / GraphQL) |
| DESIGN | `@clean-architect` | Ensure DDD compliance |
| IMPLEMENT | Stack-specific dev agent | Implementation |
| IMPLEMENT | `@db-designer` | DB schema if new tables needed |
| TEST | `@test-writer` | Unit + integration tests |
| TEST | `@security-audit` | Auth / injection / rate-limit checks |
| DOCUMENT | `@docs-writer` | OpenAPI + API.md |
