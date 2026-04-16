# DDD Architecture Reference

> **Standard architecture** for all stacks. Every project follows this structure. Stack-specific docs extend this with implementation details.

## Overview

Domain-Driven Design with Hexagonal Architecture (Ports & Adapters). Business logic lives in the Domain layer, isolated from frameworks, databases, and UI.

```
┌─────────────────────────────────────────────────────┐
│                   Application                        │
│        (Handlers, Controllers, UI, Listeners)        │
├─────────────────────────────────────────────────────┤
│                     Domain                           │
│   (Entities, Value Objects, Ports, UseCases, Events) │
├─────────────────────────────────────────────────────┤
│                  Infrastructure                      │
│        (DB, API Clients, Cache, Messaging)           │
└─────────────────────────────────────────────────────┘
```

**Dependency Rule:** Dependencies point **inward** only. Domain depends on nothing. Application and Infrastructure depend on Domain via **ports (interfaces)**.

---

## Standard Directory Structure

Every project, regardless of stack, follows this structure:

```
{project_root}/
├── domain/
│   └── {domain}/
│       ├── entities/           # Aggregates + entities with behavior
│       ├── valueobjects/       # Immutable typed values with behavior
│       ├── ports/              # Interfaces (1 file per port)
│       ├── events/             # Domain events (1 file per event)
│       ├── usecases/           # Business logic orchestration
│       └── validators/         # (optional) Pure validation rules
│
├── application/
│   ├── ports/
│   │   └── {transport}/        # HTTP handlers / UI screens / CLI
│   ├── services/               # Thin wrappers -> domain usecases
│   └── listeners/              # Event side-effects
│
├── infrastructure/
│   ├── {persistence}/          # DB / API client implementations
│   ├── adapters/               # External service adapters
│   └── {shared_infra}/         # Cache, messaging, auth, logger
│
└── models/                     # Persistence models (ORM/schema)
```

### Stack-Specific Mapping

| Generic | Go + Gin | React + Vite | Flutter | Laravel | Remix |
|---------|----------|-------------|---------|---------|-------|
| `domain/` | `internal/domain/` | `src/domain/` | `lib/domain/` | `app/Domain/` | `app/domain/` |
| `application/ports/{transport}/` | `application/ports/http/` | `application/ports/ui/` | `application/ports/ui/` | `app/Http/Controllers/` | `app/routes/` |
| `application/services/` | `application/services/` | `application/services/` | `application/services/` | `app/Services/` | `app/domain/{domain}/services.server.ts` |
| `application/listeners/` | `application/listeners/` | `application/listeners/` | `application/listeners/` | `app/Listeners/` | `app/listeners/` |
| `infrastructure/{persistence}/` | `infrastructure/database/` | `infrastructure/api/` | `infrastructure/api/` | `app/Infrastructure/Repositories/` | `app/infrastructure/` |
| `models/` | `internal/models/` | N/A (types in domain) | N/A (freezed in domain) | `app/Models/` | `prisma/schema.prisma` |

---

## Domain Layer

The heart of the system. **ZERO framework dependencies.** Only stdlib/language built-ins allowed.

### Entities (`entities/`)

Business objects with **behavior**, not just data bags.

**Rules:**
- Constructor: `New{Entity}()` / `create{Entity}()` / `{Entity}.create()`
- State transitions via behavior methods (not direct field mutation)
- Embed/use EventCollector to raise domain events on state changes
- Guard methods: `isActive()`, `canTransitionTo()`, `isExpired()`
- Only imports: stdlib + valueobjects + shared (within same domain)

**Anti-patterns:**
- Anemic entity (only getters/setters, no behavior)
- Entity importing framework/infra packages
- Business logic outside entity (in controller or store)

### Value Objects (`valueobjects/`)

Immutable types with behavior. Represent concepts like Money, Email, Status, Rate.

**Rules:**
- Only stdlib imports (NO external packages, NO domain/shared)
- Immutable: no setters, return new instance on change
- Behavior methods: `IsTerminal()`, `CanTransitionTo()`, `Format()`, `Validate()`
- Typed strings for enums with query methods
- Must be in `valueobjects/` directory, NOT mixed in `entities/`

### Ports (`ports/`)

Interfaces that define how the domain communicates with the outside world. Hexagonal architecture's "ports".

**Rules:**
- One file per port interface
- Store ports: `{entity}_store` — persistence interface + related DTOs
- Adapter ports: `{adapter_name}` — external service interface
- Use domain types (entities, value objects) in signatures, NOT primitives for typed values
- Platform-agnostic naming: `URLParser`, NOT `ShopeeURLParser`
- No infrastructure imports

### Events (`events/`)

Domain events represent something significant that happened in the domain.

**Rules:**
- One file per event
- Embed/extend base event type from shared
- Naming: `{Domain}{Action}` (e.g., `WalletWithdrawalCreated`, `OrderCompleted`)
- Carry data needed by listeners (userID, amounts, names)
- Event name string MUST match event registry

### UseCases (`usecases/`)

Business logic orchestration. The "what" of the system.

**Rules:**
- Constructor struct/class with port dependencies (injected via interfaces)
- Split by concern: one file per action group
- Business logic lives HERE, not in store/controller/service
- Dispatch entity events after successful persistence
- No infrastructure imports (no ORM, no HTTP framework, no cache client)
- No inline interface definitions — interfaces MUST be in `ports/`

### Validators (`validators/`) — optional

Pure validation rules. No DB access, no side effects.

---

## Application Layer

Thin layer that wires domain to the outside world.

### Ports/Transport (`ports/{transport}/`)

HTTP handlers, UI screens, CLI commands. The entry point for user interactions.

**Rules:**
- Thin: parse request/input -> call service -> return response/render
- NO business logic
- Registration/wiring function: create store -> usecase -> service -> handler -> routes
- DTOs in separate file (request/response structs)

### Services (`services/`)

Thin wrapper that delegates to domain usecases.

**Rules:**
- Orchestrate one or more usecases
- NO business logic — just delegation
- Can coordinate cross-domain calls if needed
- No infrastructure imports

### Listeners (`listeners/`)

Handle domain event side-effects.

**Rules:**
- One file per event: `on_{event_name}`
- Side-effects only: notifications, SSE, analytics, async jobs
- Receive app/bootstrap context for accessing infrastructure
- Use background context for async work, NOT request context
- Register in event registry/bus

---

## Infrastructure Layer

Implements domain port interfaces. All framework/external dependencies live here.

**Rules:**
- Implements interfaces from `domain/{domain}/ports/`
- Compile-time interface check (where language supports it)
- Mapper functions between domain entities and persistence models
- NO business logic — pure persistence/communication
- Use context consistently

---

## Hard Rules (ALL stacks)

| # | Rule | Violation = |
|---|------|-------------|
| HR1 | Domain layer has ZERO framework/external imports | CRITICAL |
| HR2 | Domain A MUST NOT import Domain B | CRITICAL |
| HR3 | No circular imports/dependencies | CRITICAL |
| HR4 | Entities have behavior methods (not anemic) | HIGH |
| HR5 | Entities raise domain events on state changes | HIGH |
| HR6 | Ports are interfaces in `ports/` dir (not inline in usecases) | HIGH |
| HR7 | Ports use domain types, not primitives for typed values | MEDIUM |
| HR8 | UseCases contain business logic, not controllers/stores | HIGH |
| HR9 | Listeners handle side-effects, not usecases | HIGH |
| HR10 | One file per port interface | MEDIUM |
| HR11 | One file per domain event | MEDIUM |
| HR12 | Value objects only import stdlib | HIGH |
| HR13 | Service layer is thin (delegation only) | MEDIUM |
| HR14 | Controllers/handlers are thin (no business logic) | MEDIUM |
| HR15 | Infrastructure stores have no business logic | HIGH |

---

## Import Rules (Dependency Direction)

```
valueobjects/    -> only stdlib
entities/        -> only stdlib + valueobjects + domain/shared
ports/           -> only stdlib + entities + valueobjects + domain/shared
events/          -> only stdlib + domain/shared
usecases/        -> entities + ports + events + valueobjects (NO infra)
validators/      -> entities + valueobjects

services/        -> usecases (thin wrapper)
ports/{transport}/ -> services + bootstrap/config + infrastructure utilities
listeners/       -> events + bootstrap/config + infrastructure utilities
infrastructure/  -> ports (implements interfaces) + models/persistence
```

---

## Domain Design Guidelines

### How to Identify Domains

A domain is a bounded context — a cohesive area of business logic.

**Signs of a good domain boundary:**
- Has its own entities that don't belong elsewhere
- Has business rules specific to this area
- Can be described independently (e.g., "Wallet manages balances and transactions")
- Changes in this area don't require changes in other domains

**Example domains:**
| Domain | Responsibility |
|--------|---------------|
| Identity | Authentication, user profiles, sessions |
| Wallet | Balances, transactions, withdrawals |
| Catalog | Products, categories, search |
| Order | Order lifecycle, checkout, payment |
| Notification | Email, push, in-app messaging |

### How to Identify Aggregates

An aggregate is a cluster of entities treated as a single unit for data changes.

**Rules:**
- One aggregate root per aggregate
- External references only to the aggregate root
- Transactions don't cross aggregate boundaries
- Cascade deletes within the aggregate

### Cross-Domain Communication

Domains communicate via **domain events**, never by direct import.

```
Domain A -> raises Event -> EventBus -> Listener -> Domain B service
```

---

## Severity Levels

| Level | Meaning | Examples |
|-------|---------|---------|
| CRITICAL | Architecture broken | Build fails, circular imports, domain imports framework |
| HIGH | DDD violation | Cross-domain import, business logic in wrong layer, no ports |
| MEDIUM | Structure issue | Anemic entity, fat controller, missing events, missing tests |
| LOW | Convention issue | File naming, redundant code, DTOs in wrong package |

**ALL levels must be fixed** during review.

---

## Check Scripts Template

Each stack architecture doc provides specific check scripts. General pattern:

```bash
# Phase check template (adapt per stack)

echo "=== Build ==="
{stack_build_command} && echo "PASS" || echo "FAIL"

echo "=== Lint ==="
{stack_lint_command} && echo "PASS" || echo "FAIL"

echo "=== Domain Purity ==="
# Check no framework imports in domain/
{grep_forbidden_imports_in_domain} && echo "FAIL" || echo "PASS"

echo "=== No Cross-Domain Imports ==="
# Check domain A doesn't import domain B
{check_cross_domain} && echo "FAIL" || echo "PASS"

echo "=== Tests ==="
{stack_test_command} && echo "PASS" || echo "FAIL"
```

---

## Review Checklist

| Area | Checks |
|------|--------|
| Entities | Has constructor, behavior methods, event collection, no framework imports |
| Value Objects | Separate dir, stdlib only, immutable, behavior methods |
| Ports | Separate dir, 1 file per interface, domain types, no infra imports |
| Events | 1 per file, extends base event, carries data, name matches registry |
| UseCases | Uses port interfaces, split by concern, business logic here, no infra |
| Services | Thin wrapper, delegates to usecases |
| Handlers/Controllers | Thin, registration/wiring function, DTOs separate |
| Listeners | 1 per event, side-effects only, registered in event bus |
| Infrastructure | Implements port interfaces, mappers, no business logic |
| Tests | Entities, value objects, usecases all tested |

---

## Testing Strategy

| Layer | Test Type | Dependencies |
|-------|-----------|-------------|
| Value Objects | Unit | None (pure) |
| Entities | Unit | None (pure) |
| UseCases | Unit | Mock port interfaces |
| Infrastructure | Integration | Real DB/API (or testcontainers) |
| Handlers | Integration/E2E | Full stack |
| Listeners | Unit | Mock infrastructure |
