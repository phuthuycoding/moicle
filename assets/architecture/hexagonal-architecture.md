# Hexagonal Architecture Reference (Ports & Adapters)

> **Structural pattern** behind the standard architecture. This doc focuses on the *Ports & Adapters* mechanics — how the application core is isolated from the outside world. For the tactical building blocks (entities, value objects, usecases, events) see [`ddd-architecture.md`](./ddd-architecture.md), which applies this pattern.

## Overview

Hexagonal Architecture (Alistair Cockburn, a.k.a. **Ports & Adapters**) isolates the **application core** (business logic) from everything external — UI, DB, HTTP, message brokers, third-party APIs. The core neither knows nor cares *what* drives it or *what* it drives. Everything crosses the boundary through a **port** (interface) implemented by an **adapter**.

```
              DRIVING SIDE (primary)                DRIVEN SIDE (secondary)
        actors that USE the app             resources the app DEPENDS ON
   ┌──────────────┐                                        ┌──────────────┐
   │ HTTP handler │──┐                                 ┌──▶│  PostgreSQL  │
   ├──────────────┤  │   ┌───────────────────────┐    │   ├──────────────┤
   │   CLI / UI   │──┼──▶│  ▶ port   APP CORE   port ▶ │──▶│  Redis cache │
   ├──────────────┤  │   │     (domain + usecases)│    │   ├──────────────┤
   │ Event/Cron   │──┘   └───────────────────────┘    └──▶│  Payment API │
   └──────────────┘         ▲ implements              implements ▲
     primary adapters    driving ports          driven ports   secondary adapters
```

**Dependency Rule:** all arrows point **inward, toward the core**. The core defines the ports; adapters depend on the core, never the reverse. Swap any adapter (Postgres → Mongo, REST → gRPC) without touching the core.

---

## The Two Kinds of Ports

| | Driving / Primary port | Driven / Secondary port |
|---|------------------------|--------------------------|
| **Who calls whom** | Outside calls the core | Core calls the outside |
| **Defined by** | The use case the app offers | The need the core has |
| **Example** | `PlaceOrder`, `GetWallet` | `OrderStore`, `PaymentGateway`, `Clock` |
| **Implemented by** | The use case / service (core) | An infrastructure adapter |
| **In this repo** | `application/services/` calling `domain/.../usecases/` | `domain/{domain}/ports/` |

> Rule of thumb: a **driving** port is "what the app *does*"; a **driven** port is "what the app *needs*". Both are interfaces; both keep the framework out of the core.

---

## The Two Kinds of Adapters

### Primary / Driving adapters — `application/ports/{transport}/`
Translate an external trigger into a core call. They adapt *the world → the core*.

- HTTP controllers, GraphQL resolvers, CLI commands, UI screens, queue/cron consumers
- **Thin:** parse input → call a driving port (service/usecase) → map result to a response
- NO business logic, NO direct DB/infra access
- One transport = one adapter; the same core is reachable from many adapters

### Secondary / Driven adapters — `infrastructure/`
Implement a driven port so the core can reach a resource. They adapt *the core → the world*.

- Repositories (DB), API clients, cache, message publishers, mailers, clock/uuid wrappers
- **Implement an interface from `domain/{domain}/ports/`** — compile-time checked where the language allows
- Map between domain types and persistence/wire models; no business rules
- The only place framework/driver imports are allowed

---

## Folder Mapping

The hexagon maps onto the standard directory structure (same layout as [`ddd-architecture.md`](./ddd-architecture.md)):

```
domain/{domain}/
├── ports/              # DRIVEN ports (interfaces the core needs)        ← secondary
├── usecases/           # DRIVING ports realized (what the app offers)    ← primary core
├── entities/ valueobjects/ events/                                       ← pure core

application/
├── ports/{transport}/  # PRIMARY adapters (http / ui / cli / consumers)  ← driving
├── services/           # entry into driving ports (thin delegation)
└── listeners/          # event-driven primary adapters

infrastructure/         # SECONDARY adapters (implement domain/ports)      ← driven
```

| Hexagon concept | Lives in | Direction |
|-----------------|----------|-----------|
| Application core | `domain/` | depends on nothing |
| Driving port | `domain/.../usecases/` (+ `application/services/` facade) | core offers |
| Primary adapter | `application/ports/{transport}/`, `application/listeners/` | world → core |
| Driven port | `domain/{domain}/ports/` | core needs |
| Secondary adapter | `infrastructure/` | core → world |

---

## Hard Rules

| # | Rule | Violation = |
|---|------|-------------|
| HX1 | The core (`domain/`) imports ZERO framework/driver/adapter code | CRITICAL |
| HX2 | Every crossing of the boundary goes through a port (interface) | CRITICAL |
| HX3 | Driven ports are **defined by the core**, in `domain/{domain}/ports/` | HIGH |
| HX4 | Secondary adapters depend on the core, never the core on adapters | CRITICAL |
| HX5 | Primary adapters are thin: translate + delegate, no business logic | HIGH |
| HX6 | A port uses domain types in its signature, not framework/DTO types | MEDIUM |
| HX7 | Wiring (adapter → port → core) happens only at the composition root | HIGH |
| HX8 | Side effects (time, randomness, I/O) sit behind driven ports for testability | MEDIUM |

---

## Why It Pays Off

- **Testable core:** drive use cases directly and stub driven ports — no HTTP server, no DB.
- **Swappable edges:** replace Postgres with Mongo, REST with gRPC, or a real payment API with a fake, by writing a new adapter only.
- **Delivery-agnostic:** the same use case is reachable from HTTP, CLI, a queue, or a test, with no core changes.
- **Clear blast radius:** infrastructure churn stops at the adapter; business rules stay put.

## Anti-patterns

- **Leaky port:** an interface that exposes `*sql.Rows`, `http.Request`, or an ORM model — drags the framework into the core.
- **Fat primary adapter:** business logic inside a controller/resolver instead of a use case.
- **Core reaching out:** `domain/` importing the DB client or HTTP package directly (skipping the port).
- **Port defined by the adapter:** the interface living in `infrastructure/` instead of `domain/ports/` — inverts the dependency.
- **Anemic hexagon:** ports/adapters in place but logic still in services/controllers (see anemic-domain anti-pattern in `ddd-architecture.md`).

---

## Relationship to the Other Docs

| Doc | Covers |
|-----|--------|
| `hexagonal-architecture.md` (this) | The structural **Ports & Adapters** boundary |
| `ddd-architecture.md` | Tactical building blocks that fill the core (entities, VOs, usecases, events) + hard rules |
| `{stack}.md` (go-backend, laravel, nodejs-nestjs, react-frontend, remix-fullstack, flutter-mobile) | How ports/adapters map to a specific framework |

Use this doc to reason about **boundaries and direction**; use `ddd-architecture.md` to reason about **what lives inside the core**. Backend stacks (Go, Laravel, NestJS) follow this pattern most strictly; frontends apply a lighter form (driven ports for API/storage adapters).
