# Clean Architecture Reference

> **Optional pattern** - Use when strict layer separation is needed. For simpler projects, consider stack-specific patterns.

## Overview

Clean Architecture separates concerns into independent layers, making code easier to test, maintain and scale.

```
┌─────────────────────────────────────────────────────┐
│                   Presentation                       │
│              (UI, Controllers, Views)                │
├─────────────────────────────────────────────────────┤
│                   Application                        │
│            (Use Cases, App Services)                 │
├─────────────────────────────────────────────────────┤
│                     Domain                           │
│         (Entities, Repository Interfaces)            │
├─────────────────────────────────────────────────────┤
│                  Infrastructure                      │
│        (DB, API, External Services, Repos)           │
└─────────────────────────────────────────────────────┘
```

## When to Use

**Use Clean Architecture when:**
- Large, long-term project with multiple developers
- Need to swap infrastructure easily (DB, external APIs)
- Strict testability requirements
- Domain logic is complex and needs isolation

**Consider simpler patterns when:**
- Small to medium projects
- Rapid prototyping
- Simple CRUD applications
- Framework conventions are sufficient

## Dependency Rule

- Dependencies only point **inward**
- Domain layer **does not depend** on any other layer
- Outer layers depend on inner layers via **interfaces**

## Layers

### 1. Domain Layer (Core)
```
domain/
├── entities/           # Business objects
├── value_objects/      # Immutable objects
├── repositories/       # Repository interfaces
├── services/           # Domain services (interfaces)
└── errors/             # Domain-specific errors
```

**Rules:**
- Pure business logic, no framework dependencies
- Entities contain business rules
- Repository interfaces defined here, implemented in Infrastructure

### 2. Application Layer (Use Cases)
```
application/
├── use_cases/          # Application-specific business rules
├── dto/                # Data Transfer Objects
├── mappers/            # Entity <-> DTO mappers
└── interfaces/         # Port interfaces
```

**Rules:**
- Orchestrate domain objects
- Contains application-specific business rules
- No direct DB/API access, use repository interfaces

### 3. Infrastructure Layer
```
infrastructure/
├── repositories/       # Repository implementations
├── datasources/        # DB, API clients
├── services/           # External service implementations
└── mappers/            # DB models <-> Entities
```

**Rules:**
- Implements repository interfaces from Domain
- Contains all external dependencies (DB, HTTP, etc.)
- Can be swapped without affecting other layers

### 4. Presentation Layer
```
presentation/
├── controllers/        # HTTP handlers / Controllers
├── views/              # UI components
├── view_models/        # Presentation logic
└── routes/             # Route definitions
```

**Rules:**
- Handles user input/output
- Calls Use Cases, never Domain directly
- Contains UI-specific logic only

## Naming Conventions

| Layer | Suffix | Example |
|-------|--------|---------|
| Entity | - | `User`, `Order` |
| Use Case | `UseCase` | `CreateUserUseCase` |
| Repository Interface | `Repository` | `UserRepository` |
| Repository Impl | `RepositoryImpl` | `UserRepositoryImpl` |
| Controller | `Controller` | `UserController` |
| DTO | `DTO` / `Request` / `Response` | `CreateUserDTO` |

## Data Flow

```
Request → Controller → UseCase → Repository(Interface) → RepositoryImpl → DB
                           ↓
Response ← Controller ← DTO ← Entity
```

## Testing Strategy

| Layer | Test Type | Mock |
|-------|-----------|------|
| Domain | Unit | None |
| Application | Unit | Repository interfaces |
| Infrastructure | Integration | DB (testcontainers) |
| Presentation | E2E | Full stack |

## Alternative Patterns

If Clean Architecture is overkill for your project:

| Stack | Simpler Alternative |
|-------|---------------------|
| Laravel | Domain + UseCase pattern (see `laravel-backend.md`) |
| Go | Handler + Service pattern |
| React | Feature-based folders |
| Flutter | BLoC or Provider pattern |

Choose the pattern that fits your project's complexity.
