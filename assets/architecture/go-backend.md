# Go Backend Structure

> Reference: [Clean Architecture](./clean-architecture.md)

## Project Structure

```
{project}/
├── cmd/
│   └── api/
│       └── main.go                 # Entry point
├── internal/
│   ├── config/
│   │   └── config.go               # App configuration
│   ├── domain/
│   │   ├── entities/               # Business entities
│   │   ├── repositories/           # Repository interfaces
│   │   └── errors/                 # Domain errors
│   ├── application/
│   │   ├── use_cases/              # Use cases
│   │   └── dto/                    # DTOs
│   ├── infrastructure/
│   │   ├── database/               # DB connection, migrations
│   │   ├── repositories/           # Repository implementations
│   │   └── services/               # External services
│   └── presentation/
│       ├── http/
│       │   ├── handlers/           # HTTP handlers
│       │   ├── middleware/         # Middlewares
│       │   ├── routes/             # Route definitions
│       │   └── server.go           # HTTP server setup
│       └── dto/                    # Request/Response DTOs
├── pkg/                            # Public packages
│   ├── logger/
│   └── validator/
├── migrations/                     # SQL migrations
├── scripts/                        # Build/deploy scripts
├── .claude/
│   └── agents/
├── CLAUDE.md
├── go.mod
├── go.sum
├── Makefile
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Module Pattern

Mỗi feature/module có cấu trúc riêng:

```
internal/modules/{module}/
├── domain/
│   ├── entity.go
│   └── repository.go
├── application/
│   ├── create_use_case.go
│   ├── get_use_case.go
│   └── dto.go
├── infrastructure/
│   └── repository_impl.go
└── presentation/
    ├── handler.go
    └── routes.go
```

## Key Files

### cmd/api/main.go
```go
package main

func main() {
    cfg := config.Load()
    db := database.Connect(cfg.DB)

    // Wire dependencies
    userRepo := repositories.NewUserRepository(db)
    userUseCase := usecases.NewUserUseCase(userRepo)
    userHandler := handlers.NewUserHandler(userUseCase)

    // Setup routes
    router := routes.Setup(userHandler)

    // Start server
    server.Run(router, cfg.Port)
}
```

### Makefile
```makefile
.PHONY: run build test migrate

run:
	go run cmd/api/main.go

build:
	go build -o bin/api cmd/api/main.go

test:
	go test -v ./...

migrate-up:
	migrate -path migrations -database $(DB_URL) up

migrate-down:
	migrate -path migrations -database $(DB_URL) down
```

## Conventions

| Item | Convention | Example |
|------|------------|---------|
| Package | lowercase, short | `user`, `auth` |
| Interface | -er suffix | `UserRepository` |
| Struct | PascalCase | `UserService` |
| File | snake_case | `user_handler.go` |
| Error | ErrXxx | `ErrUserNotFound` |
