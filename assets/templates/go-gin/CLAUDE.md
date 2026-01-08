# CLAUDE.md - Go + Gin Backend Template

## Project Overview

Backend API service built with:
- **Go 1.22+** - Programming language
- **Gin** - HTTP web framework
- **GORM** - ORM for database operations
- **Redis** - Caching and session storage
- **Viper** - Configuration management

## Quick Start

```bash
# Install dependencies
go mod download

# Run development server
go run cmd/api/main.go

# Build for production
go build -o bin/api cmd/api/main.go

# Run tests
go test ./...
```

## Project Structure

```
{project_name}/
├── cmd/
│   └── api/
│       └── main.go              # Application entry point
├── internal/
│   ├── config/                  # Configuration loading (Viper)
│   │   └── config.go
│   ├── middleware/              # HTTP middlewares
│   │   ├── auth.go
│   │   ├── cors.go
│   │   └── logger.go
│   └── modules/                 # Feature modules
│       ├── router/
│       │   └── router.go        # Route registration
│       └── {module}/
│           ├── controllers/
│           │   └── controller.go
│           ├── models/
│           │   └── entity.go
│           ├── usecases/
│           │   └── usecase.go
│           └── init.go
├── pkg/                         # Shared packages
│   ├── database/
│   │   └── database.go
│   ├── queue/
│   │   └── redis.go
│   └── response/
│       └── response.go
├── config.yaml                  # Configuration file
├── go.mod
└── go.sum
```

## Key Patterns and Conventions

### File Naming
- Use `snake_case.go` for all Go files
- One struct per file when possible

### Module Structure
Each module follows the layered architecture:
- **controllers/**: HTTP handlers, request/response mapping
- **usecases/**: Business logic
- **models/**: GORM models and DTOs

### Module Init Pattern

```go
// internal/modules/{module}/init.go
package module

func Init(r *gin.Engine, db *gorm.DB) {
    repo := NewRepository(db)
    uc := NewUseCase(repo)
    ctrl := NewController(uc)

    group := r.Group("/api/{module}")
    {
        group.GET("/", ctrl.List)
        group.GET("/:id", ctrl.Get)
        group.POST("/", ctrl.Create)
        group.PUT("/:id", ctrl.Update)
        group.DELETE("/:id", ctrl.Delete)
    }
}
```

### Response Format

```go
// Success response
c.JSON(http.StatusOK, gin.H{
    "data": result,
})

// Error response
c.JSON(http.StatusBadRequest, gin.H{
    "error": "validation failed",
    "details": errors,
})

// Paginated response
c.JSON(http.StatusOK, gin.H{
    "data":        items,
    "total":       total,
    "page":        page,
    "limit":       limit,
    "total_pages": totalPages,
})
```

### GORM Model Pattern

```go
type Entity struct {
    ID        string     `gorm:"type:char(36);primaryKey" json:"id"`
    Name      string     `gorm:"type:varchar(255);not null" json:"name"`
    Status    string     `gorm:"type:varchar(50);default:'active'" json:"status"`
    CreatedAt time.Time  `json:"created_at"`
    UpdatedAt time.Time  `json:"updated_at"`
}

func (e *Entity) BeforeCreate(tx *gorm.DB) error {
    e.ID = uuid.New().String()
    return nil
}
```

## Adding New Module

1. Create module directory structure:
```bash
mkdir -p internal/modules/{module}/{controllers,models,usecases}
```

2. Create model (`models/entity.go`):
```go
type Entity struct {
    ID   string `gorm:"primaryKey" json:"id"`
    Name string `json:"name"`
}
```

3. Create usecase (`usecases/usecase.go`):
```go
type UseCase struct {
    db *gorm.DB
}

func (uc *UseCase) List() ([]models.Entity, error) {
    var items []models.Entity
    return items, uc.db.Find(&items).Error
}
```

4. Create controller (`controllers/controller.go`):
```go
type Controller struct {
    uc *usecases.UseCase
}

func (ctrl *Controller) List(c *gin.Context) {
    items, err := ctrl.uc.List()
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    c.JSON(200, gin.H{"data": items})
}
```

5. Create init.go and register in router

## API Endpoints Pattern

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/{resource}/ | List all items |
| GET | /api/{resource}/:id | Get single item |
| POST | /api/{resource}/ | Create item |
| PUT | /api/{resource}/:id | Update item |
| DELETE | /api/{resource}/:id | Delete item |

### Query Parameters for List
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search term
- `sort_by` - Sort field
- `order` - Sort order (asc/desc)

## Configuration

### config.yaml
```yaml
server:
  port: 8080
  mode: debug  # debug, release, test

database:
  type: mysql  # mysql, postgres, sqlite
  host: localhost
  port: 3306
  user: root
  password: ""
  dbname: {project_name}

redis:
  address: localhost:6379
  password: ""
  db: 0

jwt:
  secret: your-secret-key
  expiry: 24h
```

### Environment Variables
- `CONFIG_PATH` - Path to config file (default: ./config.yaml)
- `GIN_MODE` - Gin mode (debug/release)

## Testing

```go
// Use testify for assertions
func TestController_List(t *testing.T) {
    router := setupTestRouter()
    w := httptest.NewRecorder()
    req, _ := http.NewRequest("GET", "/api/items/", nil)
    router.ServeHTTP(w, req)

    assert.Equal(t, 200, w.Code)
}
```
