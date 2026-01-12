# Go Backend Structure

> Simple Handler + Service pattern with GORM

## Project Structure

```
{project}/
├── cmd/
│   └── api/
│       └── main.go                 # Entry point
├── internal/
│   ├── config/
│   │   └── config.go               # App configuration
│   ├── models/                     # GORM models
│   │   ├── user.go
│   │   └── story.go
│   ├── handlers/                   # HTTP handlers
│   │   ├── user_handler.go
│   │   └── story_handler.go
│   ├── services/                   # Business logic
│   │   ├── user_service.go
│   │   └── story_service.go
│   ├── middleware/                 # HTTP middleware
│   │   ├── auth.go
│   │   └── cors.go
│   └── routes/                     # Route definitions
│       └── routes.go
├── pkg/                            # Shared packages
│   ├── database/                   # DB connection
│   ├── logger/
│   └── validator/
├── migrations/                     # SQL migrations
├── .claude/
├── CLAUDE.md
├── go.mod
├── Makefile
├── Dockerfile
└── README.md
```

## Architecture Pattern

```
Handler → Service → Model (GORM)
   ↓         ↓
Request   Database
Binding    Query
```

**Simple flow:**
1. Handler receives HTTP request
2. Handler calls Service
3. Service contains business logic
4. Service uses GORM Models directly
5. Handler returns response

## Key Files

### internal/models/user.go
```go
package models

import "gorm.io/gorm"

type User struct {
    gorm.Model
    Name     string `json:"name"`
    Email    string `json:"email" gorm:"uniqueIndex"`
    Password string `json:"-"`
}
```

### internal/services/user_service.go
```go
package services

import (
    "myapp/internal/models"
    "gorm.io/gorm"
)

type UserService struct {
    db *gorm.DB
}

func NewUserService(db *gorm.DB) *UserService {
    return &UserService{db: db}
}

func (s *UserService) GetByID(id uint) (*models.User, error) {
    var user models.User
    if err := s.db.First(&user, id).Error; err != nil {
        return nil, err
    }
    return &user, nil
}

func (s *UserService) GetAll() ([]models.User, error) {
    var users []models.User
    if err := s.db.Find(&users).Error; err != nil {
        return nil, err
    }
    return users, nil
}

func (s *UserService) Create(user *models.User) error {
    return s.db.Create(user).Error
}
```

### internal/handlers/user_handler.go
```go
package handlers

import (
    "net/http"
    "myapp/internal/services"
    "github.com/gin-gonic/gin"
)

type UserHandler struct {
    userService *services.UserService
}

func NewUserHandler(userService *services.UserService) *UserHandler {
    return &UserHandler{userService: userService}
}

func (h *UserHandler) GetAll(c *gin.Context) {
    users, err := h.userService.GetAll()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, gin.H{"data": users})
}

func (h *UserHandler) GetByID(c *gin.Context) {
    id := c.Param("id")
    user, err := h.userService.GetByID(id)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"data": user})
}
```

### cmd/api/main.go
```go
package main

import (
    "myapp/internal/config"
    "myapp/internal/handlers"
    "myapp/internal/services"
    "myapp/pkg/database"
)

func main() {
    cfg := config.Load()
    db := database.Connect(cfg.DB)

    // Wire dependencies
    userService := services.NewUserService(db)
    userHandler := handlers.NewUserHandler(userService)

    // Setup routes
    r := gin.Default()
    r.GET("/users", userHandler.GetAll)
    r.GET("/users/:id", userHandler.GetByID)

    r.Run(cfg.Port)
}
```

## Conventions

| Item | Convention | Example |
|------|------------|---------|
| Package | lowercase, short | `user`, `auth` |
| Struct | PascalCase | `UserService` |
| File | snake_case | `user_handler.go` |
| Handler func | PascalCase | `GetByID`, `Create` |
| Service func | PascalCase | `GetAll`, `FindByEmail` |

## Makefile

```makefile
.PHONY: run build test

run:
	go run cmd/api/main.go

build:
	go build -o bin/api cmd/api/main.go

test:
	go test -v ./...

migrate:
	go run cmd/migrate/main.go
```

## When to Add More Structure

**Current pattern is enough for:**
- Small to medium APIs
- CRUD operations
- Simple business logic

**Consider adding layers when:**
- Multiple data sources (DB + external APIs)
- Complex business rules
- Need to swap database
- Large team with clear boundaries
