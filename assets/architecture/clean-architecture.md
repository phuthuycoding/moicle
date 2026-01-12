# Clean Architecture Reference

## Overview

Clean Architecture tách biệt concerns thành các layers độc lập, giúp code dễ test, maintain và scale.

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

## Dependency Rule

- Dependencies chỉ được point **inward**
- Domain layer **không depend** vào bất kỳ layer nào
- Outer layers depend vào inner layers qua **interfaces**

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
