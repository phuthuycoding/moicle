---
name: api-integration
description: "Design API contracts, implement endpoints across layers, write comprehensive tests, and generate API documentation following architecture patterns. Use when adding API endpoints, integrating third-party APIs, or when user says 'integrate api', 'add endpoint', 'new api', 'connect api', 'api integration'."
user-invocable: true
triggers:
  - integrate api
  - add endpoint
  - new api
  - connect api
  - api integration
---

# API Integration Workflow

End-to-end workflow for designing, implementing, testing, and documenting APIs following architecture-defined layer patterns.

## IMPORTANT: Read Architecture First

Read the appropriate architecture reference before starting:

- Global: `~/.claude/architecture/` (clean-architecture.md, flutter-mobile.md, react-frontend.md, go-backend.md, laravel-backend.md, remix-fullstack.md, monorepo.md)
- Project-specific: `.claude/architecture/` (overrides global if present)

**Follow the structure and patterns defined in these files exactly.**

## Workflow

```
DESIGN → IMPLEMENT → TEST → DOCUMENT
                       │
                       └──── Feedback Loop (if tests fail → IMPLEMENT)
```

---

## Phase 1: DESIGN

**Goal**: Define API contract — endpoints, schemas, authentication, error handling.

1. Identify API type: REST, GraphQL, gRPC, or third-party integration
2. Read architecture doc for the target stack
3. Define for each endpoint: HTTP method, path, request/response schema, authentication requirements, error codes
4. Create OpenAPI spec (for REST) or GraphQL schema

### Gate
- [ ] Architecture doc read
- [ ] All endpoints defined with request/response schemas
- [ ] Authentication strategy defined
- [ ] Error handling specified
- [ ] OpenAPI spec or schema created

---

## Phase 2: IMPLEMENT

**Goal**: Build endpoints following architecture layer patterns.

1. Re-read architecture doc for implementation patterns
2. Implement across layers as defined in the architecture doc:
   - **Routes/Controllers** — request parsing, response formatting
   - **Use Cases/Services** — business logic
   - **Repository/Data** — database operations
   - **Models/Entities** — data structures and DTOs
3. Implement request validation, business rules validation, error handling, and authentication/authorization
4. Manual smoke test with curl:
   ```bash
   curl -X GET http://localhost:8080/api/resource \
     -H "Authorization: Bearer {token}"
   curl -X POST http://localhost:8080/api/resource \
     -H "Authorization: Bearer {token}" \
     -H "Content-Type: application/json" \
     -d '{"name": "test"}'
   ```

### Gate
- [ ] Follows architecture doc layer structure
- [ ] All layers implemented
- [ ] Validation and error handling work
- [ ] Authentication/authorization work
- [ ] Manual testing successful

---

## Phase 3: TEST

**Goal**: Write comprehensive tests covering all status codes and security scenarios.

1. Read testing patterns from architecture doc
2. Write tests per architecture conventions:
   - **Unit tests** for each layer
   - **Integration tests** for endpoints
   - **E2E tests** for workflows
3. Cover: happy path, validation errors (400), auth errors (401/403), not found (404), server errors (500), edge cases, rate limiting
4. Security tests: SQL injection, XSS, invalid/expired tokens, CSRF
5. Run tests:
   ```bash
   go test ./... -v -cover         # Go
   php artisan test --coverage      # Laravel
   bun test --coverage              # React/Remix
   flutter test                     # Flutter
   ```

### Gate
- [ ] Unit and integration tests pass
- [ ] All status codes tested
- [ ] Security tests pass
- [ ] Coverage meets standards (>80%)

### Feedback Loop
If tests fail → return to IMPLEMENT → fix → re-test

---

## Phase 4: DOCUMENT

**Goal**: Create clear, accurate API documentation.

1. Generate documentation from OpenAPI spec (if REST)
2. Document for each endpoint: method, path, parameters, request/response schemas with examples, authentication requirements
3. Include: base URL, authentication flow, error response format, rate limiting, pagination, versioning
4. Provide usage examples in relevant languages (curl, JavaScript/TypeScript, Python, Go)

### Gate
- [ ] All endpoints documented with examples
- [ ] Authentication flow documented
- [ ] Error codes documented
- [ ] Examples tested and working
