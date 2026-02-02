---
name: api-integration
description: API integration workflow for adding new endpoints or integrating external APIs. Use when adding API endpoints, integrating third-party APIs, or when user says "integrate api", "add endpoint", "new api", "connect api", "api integration".
---

# API Integration Workflow

End-to-end workflow for designing, implementing, testing, and documenting APIs.

## IMPORTANT: Read Architecture First

**Before starting any phase, you MUST read the appropriate architecture reference:**

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

**Follow the structure and patterns defined in these files exactly.**

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| DESIGN | `@api-designer` | API contract design (OpenAPI) |
| DESIGN | `@clean-architect` | Ensure architecture compliance |
| IMPLEMENT | `@go-backend-dev`, `@laravel-backend-dev`, `@remix-fullstack-dev` | Backend implementation |
| IMPLEMENT | `@react-frontend-dev`, `@flutter-mobile-dev` | Client integration |
| IMPLEMENT | `@db-designer` | Database schema (if needed) |
| TEST | `@test-writer` | API tests (unit/integration) |
| TEST | `@security-audit` | Security testing |
| DOCUMENT | `@docs-writer` | API documentation |

## Workflow Overview

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ 1. DESIGN│──▶│2. IMPLEMENT──▶│ 3. TEST  │──▶│4. DOCUMENT
└──────────┘   └──────────┘   └──────────┘   └──────────┘
                                    │
                                    └───────────◀──────────┘
                                      Feedback Loop
```

---

## Phase 1: DESIGN

**Goal**: Design API contract (request/response, endpoints, schema)

### Actions
1. Identify API type:
   - [ ] REST API
   - [ ] GraphQL API
   - [ ] gRPC
   - [ ] Third-party integration

2. **Read architecture doc** for the stack
3. Define API contract:
   - Endpoints/operations
   - Request/response schema
   - HTTP methods
   - Status codes
   - Authentication/authorization
   - Error handling

4. Create OpenAPI spec (REST) or GraphQL schema

### Output Template
```yaml
# OpenAPI 3.0 Spec Example
openapi: 3.0.0
info:
  title: [API Name]
  version: 1.0.0
  description: [API Description]

servers:
  - url: https://api.example.com/v1

paths:
  /resource:
    get:
      summary: [Description]
      parameters:
        - name: id
          in: query
          schema:
            type: string
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Resource'
        '400':
          description: Bad Request
        '401':
          description: Unauthorized
        '404':
          description: Not Found
        '500':
          description: Internal Server Error

components:
  schemas:
    Resource:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
      required:
        - id
        - name
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
```

### Design Checklist
```markdown
## API Design: [Endpoint/Feature Name]

### Reference
- Architecture Doc: [path to architecture file]
- API Type: [REST/GraphQL/gRPC]
- Stack: [Go/Laravel/Remix/etc.]

### Endpoints
| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | /api/resource | List resources | Yes |
| POST | /api/resource | Create resource | Yes |
| GET | /api/resource/:id | Get resource | Yes |
| PUT | /api/resource/:id | Update resource | Yes |
| DELETE | /api/resource/:id | Delete resource | Yes |

### Request/Response Schema
[Define schemas here]

### Authentication
- Method: [Bearer Token/JWT/API Key/OAuth2]
- Header: [Authorization: Bearer {token}]

### Error Handling
- 400: Validation errors
- 401: Authentication failed
- 403: Authorization failed
- 404: Resource not found
- 500: Server error

### Rate Limiting
- Limit: [requests per minute]
- Headers: X-RateLimit-Limit, X-RateLimit-Remaining
```

### Gate
- [ ] Architecture doc read
- [ ] API type identified
- [ ] All endpoints defined
- [ ] Request/response schema defined
- [ ] Authentication strategy defined
- [ ] Error handling specified
- [ ] OpenAPI spec created (if REST)

---

## Phase 2: IMPLEMENT

**Goal**: Implement API following architecture patterns

### Actions
1. **Re-read architecture doc** for implementation patterns
2. Follow the layer structure from doc:
   - Routes/Controllers layer
   - Use Cases/Services layer
   - Repository/Data layer
   - Models/Entities layer

3. Implement based on stack:

#### Go (Gin)
```go
// Follow go-backend.md structure
// Routes → Handlers → Use Cases → Repositories
```

#### Laravel
```php
// Follow laravel-backend.md structure
// Routes → Controllers → Services → Repositories
```

#### Remix
```typescript
// Follow remix-fullstack.md structure
// Routes → Actions/Loaders → Services → Repositories
```

4. Implement validation:
   - Request validation
   - Schema validation
   - Business rules validation

5. Implement error handling per architecture doc

6. Implement authentication/authorization

### Implementation Checklist
```markdown
## Implementation: [API Name]

### Architecture Reference
- Doc: [architecture file path]
- Pattern: [pattern from doc]

### Layer Implementation (from architecture doc)
- [ ] Routes/API layer
- [ ] Controller/Handler layer
- [ ] Use Case/Service layer
- [ ] Repository/Data layer
- [ ] Models/DTOs

### Validation
- [ ] Request validation
- [ ] Schema validation
- [ ] Business rules

### Security
- [ ] Authentication implemented
- [ ] Authorization implemented
- [ ] Input sanitization
- [ ] SQL injection prevention
- [ ] XSS prevention

### Error Handling
- [ ] Custom error types
- [ ] Error middleware
- [ ] Consistent error format
- [ ] Logging

### Testing Endpoints
# GET
curl -X GET http://localhost:8080/api/resource \
  -H "Authorization: Bearer {token}"

# POST
curl -X POST http://localhost:8080/api/resource \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"name": "test"}'

# PUT
curl -X PUT http://localhost:8080/api/resource/123 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"name": "updated"}'

# DELETE
curl -X DELETE http://localhost:8080/api/resource/123 \
  -H "Authorization: Bearer {token}"
```

### Gate
- [ ] Follows architecture doc structure
- [ ] All layers implemented
- [ ] Validation works
- [ ] Authentication/authorization works
- [ ] Error handling works
- [ ] Manual testing successful

---

## Phase 3: TEST

**Goal**: Write comprehensive API tests

### Actions
1. **Read testing patterns from architecture doc**
2. Write tests following doc conventions:
   - Unit tests for each layer
   - Integration tests for endpoints
   - E2E tests for workflows

3. Test coverage:
   - [ ] Happy path
   - [ ] Validation errors (400)
   - [ ] Authentication errors (401)
   - [ ] Authorization errors (403)
   - [ ] Not found errors (404)
   - [ ] Server errors (500)
   - [ ] Edge cases
   - [ ] Rate limiting (if applicable)

4. Security testing:
   - [ ] SQL injection attempts
   - [ ] XSS attempts
   - [ ] Invalid tokens
   - [ ] Expired tokens
   - [ ] CSRF protection (if applicable)

### Test Template

#### Go Example
```go
func TestGetResource(t *testing.T) {
    // Setup
    router := setupTestRouter()

    // Test cases
    tests := []struct {
        name           string
        resourceID     string
        token          string
        expectedStatus int
        expectedBody   string
    }{
        {
            name:           "Success",
            resourceID:     "123",
            token:          validToken,
            expectedStatus: 200,
        },
        {
            name:           "Unauthorized",
            resourceID:     "123",
            token:          "",
            expectedStatus: 401,
        },
        {
            name:           "Not Found",
            resourceID:     "999",
            token:          validToken,
            expectedStatus: 404,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            req := httptest.NewRequest("GET", "/api/resource/"+tt.resourceID, nil)
            if tt.token != "" {
                req.Header.Set("Authorization", "Bearer "+tt.token)
            }

            w := httptest.NewRecorder()
            router.ServeHTTP(w, req)

            assert.Equal(t, tt.expectedStatus, w.Code)
        })
    }
}
```

#### Laravel Example
```php
public function test_get_resource()
{
    // Happy path
    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $this->token,
    ])->get('/api/resource/123');

    $response->assertStatus(200)
             ->assertJson(['id' => '123']);

    // Unauthorized
    $response = $this->get('/api/resource/123');
    $response->assertStatus(401);

    // Not found
    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $this->token,
    ])->get('/api/resource/999');

    $response->assertStatus(404);
}
```

#### TypeScript/Remix Example
```typescript
describe('GET /api/resource', () => {
  it('should return resource with valid auth', async () => {
    const response = await fetch('/api/resource/123', {
      headers: {
        'Authorization': `Bearer ${validToken}`,
      },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.id).toBe('123');
  });

  it('should return 401 without auth', async () => {
    const response = await fetch('/api/resource/123');
    expect(response.status).toBe(401);
  });

  it('should return 404 for non-existent resource', async () => {
    const response = await fetch('/api/resource/999', {
      headers: {
        'Authorization': `Bearer ${validToken}`,
      },
    });

    expect(response.status).toBe(404);
  });
});
```

### Run Tests
```bash
# Go
go test ./... -v -cover

# Laravel
php artisan test --coverage

# React/Remix
bun test --coverage

# Flutter (client integration)
flutter test
```

### Gate
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] All status codes tested
- [ ] Security tests pass
- [ ] Edge cases covered
- [ ] Coverage meets standards (>80%)

### Feedback Loop
If tests fail → Return to IMPLEMENT → Fix → Re-test

---

## Phase 4: DOCUMENT

**Goal**: Create clear, accurate API documentation

### Actions
1. Generate documentation from OpenAPI spec (if REST)
2. Write usage examples
3. Document authentication flow
4. Document error codes
5. Create Postman/Insomnia collection (optional)

### Documentation Template
```markdown
# [API Name] Documentation

## Base URL
```
https://api.example.com/v1
```

## Authentication

All endpoints require authentication unless specified otherwise.

### Bearer Token
```bash
Authorization: Bearer {your_token}
```

### Getting a Token
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}
```

## Endpoints

### List Resources
```http
GET /api/resource
```

**Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 10, max: 100) |
| sort | string | No | Sort field (default: created_at) |
| order | string | No | Sort order: asc/desc (default: desc) |

**Response 200 OK**
```json
{
  "data": [
    {
      "id": "123",
      "name": "Resource Name",
      "created_at": "2026-02-02T10:00:00Z",
      "updated_at": "2026-02-02T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "total_pages": 10
  }
}
```

**Example**
```bash
curl -X GET "https://api.example.com/v1/api/resource?page=1&limit=10" \
  -H "Authorization: Bearer {token}"
```

### Create Resource
```http
POST /api/resource
```

**Request Body**
```json
{
  "name": "New Resource",
  "description": "Description"
}
```

**Response 201 Created**
```json
{
  "id": "124",
  "name": "New Resource",
  "description": "Description",
  "created_at": "2026-02-02T10:00:00Z",
  "updated_at": "2026-02-02T10:00:00Z"
}
```

**Example**
```bash
curl -X POST "https://api.example.com/v1/api/resource" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Resource",
    "description": "Description"
  }'
```

### Get Resource
```http
GET /api/resource/:id
```

**Path Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Resource ID |

**Response 200 OK**
```json
{
  "id": "123",
  "name": "Resource Name",
  "description": "Description",
  "created_at": "2026-02-02T10:00:00Z",
  "updated_at": "2026-02-02T10:00:00Z"
}
```

**Example**
```bash
curl -X GET "https://api.example.com/v1/api/resource/123" \
  -H "Authorization: Bearer {token}"
```

### Update Resource
```http
PUT /api/resource/:id
```

**Path Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Resource ID |

**Request Body**
```json
{
  "name": "Updated Name",
  "description": "Updated Description"
}
```

**Response 200 OK**
```json
{
  "id": "123",
  "name": "Updated Name",
  "description": "Updated Description",
  "created_at": "2026-02-02T10:00:00Z",
  "updated_at": "2026-02-02T11:00:00Z"
}
```

**Example**
```bash
curl -X PUT "https://api.example.com/v1/api/resource/123" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "description": "Updated Description"
  }'
```

### Delete Resource
```http
DELETE /api/resource/:id
```

**Path Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Resource ID |

**Response 204 No Content**

**Example**
```bash
curl -X DELETE "https://api.example.com/v1/api/resource/123" \
  -H "Authorization: Bearer {token}"
```

## Error Codes

| Code | Description | Example |
|------|-------------|---------|
| 400 | Bad Request - Validation failed | Missing required field |
| 401 | Unauthorized - Invalid or missing token | Token expired |
| 403 | Forbidden - Insufficient permissions | User role not allowed |
| 404 | Not Found - Resource doesn't exist | Invalid resource ID |
| 422 | Unprocessable Entity - Business logic error | Duplicate entry |
| 429 | Too Many Requests - Rate limit exceeded | Exceeded 100 req/min |
| 500 | Internal Server Error - Server issue | Database connection failed |

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  }
}
```

## Rate Limiting

- **Limit**: 100 requests per minute per API key
- **Headers**:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

When rate limit is exceeded, you'll receive a 429 response:
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retry_after": 60
  }
}
```

## Pagination

All list endpoints support pagination:

**Query Parameters**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response Meta**
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "total_pages": 10
  },
  "links": {
    "first": "/api/resource?page=1",
    "prev": null,
    "next": "/api/resource?page=2",
    "last": "/api/resource?page=10"
  }
}
```

## Versioning

API versioning is handled via the URL path:
- Current: `/v1/`
- Legacy: `/v1/` (deprecated)

Breaking changes will result in a new version.

## SDKs and Tools

### Postman Collection
[Download Postman Collection](./postman_collection.json)

### Code Examples

#### JavaScript/TypeScript
```typescript
const response = await fetch('https://api.example.com/v1/api/resource', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
```

#### Python
```python
import requests

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json',
}

response = requests.get(
    'https://api.example.com/v1/api/resource',
    headers=headers
)
data = response.json()
```

#### Go
```go
req, _ := http.NewRequest("GET", "https://api.example.com/v1/api/resource", nil)
req.Header.Set("Authorization", "Bearer "+token)
req.Header.Set("Content-Type", "application/json")

client := &http.Client{}
resp, _ := client.Do(req)
defer resp.Body.Close()
```

## Support

For API support, contact: api-support@example.com
```

### Documentation Checklist
- [ ] All endpoints documented
- [ ] Request/response examples provided
- [ ] Authentication documented
- [ ] Error codes documented
- [ ] Rate limiting documented
- [ ] Code examples provided
- [ ] Postman collection created (optional)

### Gate
- [ ] Documentation complete
- [ ] Examples tested
- [ ] OpenAPI spec updated
- [ ] README updated (if needed)

---

## Quick Reference

### HTTP Status Codes
| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing/invalid auth |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Business logic error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### REST Conventions
| Method | Path | Action | Success Code |
|--------|------|--------|--------------|
| GET | /resource | List all | 200 |
| GET | /resource/:id | Get one | 200 |
| POST | /resource | Create | 201 |
| PUT | /resource/:id | Update (full) | 200 |
| PATCH | /resource/:id | Update (partial) | 200 |
| DELETE | /resource/:id | Delete | 204 |

### API Design Best Practices
1. **Use nouns for resources**, not verbs (e.g., `/users` not `/getUsers`)
2. **Use HTTP methods** for actions (GET, POST, PUT, DELETE)
3. **Version your API** (`/v1/resource`)
4. **Use plural nouns** (`/users` not `/user`)
5. **Use query params for filtering/sorting** (`?status=active&sort=name`)
6. **Return consistent error format**
7. **Use proper status codes**
8. **Implement pagination** for list endpoints
9. **Use authentication** (Bearer tokens, API keys)
10. **Document everything** (OpenAPI/Swagger)

### Authentication Patterns
| Pattern | Use Case | Implementation |
|---------|----------|----------------|
| Bearer Token | Most APIs | `Authorization: Bearer {token}` |
| API Key | Simple APIs | `X-API-Key: {key}` |
| JWT | Stateless auth | Decode and verify token |
| OAuth2 | Third-party integration | OAuth2 flow |
| Basic Auth | Simple/legacy | `Authorization: Basic {base64}` |

### Phase Summary
| Phase | Key Actions | Output |
|-------|-------------|--------|
| DESIGN | Define contract, OpenAPI spec | API specification |
| IMPLEMENT | Code per architecture doc | Working endpoints |
| TEST | Unit/integration/security tests | Test coverage >80% |
| DOCUMENT | API docs, examples, Postman | Complete documentation |

### When to Loop Back
- **TEST fails** → Return to IMPLEMENT
- **Security issues found** → Return to IMPLEMENT
- **Design changes** → Return to DESIGN

### Success Criteria
API integration is complete when:
1. OpenAPI spec created
2. Follows architecture doc
3. All endpoints working
4. Tests passing (>80% coverage)
5. Security validated
6. Documentation complete
7. Ready for production
