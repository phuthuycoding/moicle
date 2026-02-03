# Go Backend Architecture

> Production-grade Clean Architecture with Modular Design

## Project Structure

```
{project}/
├── cmd/
│   ├── api/
│   │   ├── main.go                   # Entry point (HTTP + gRPC + SSE)
│   │   └── router.go                 # Route definitions & middleware
│   └── background/
│       ├── main.go                   # CLI entry (Cobra)
│       ├── commands/                 # CLI subcommands
│       │   ├── consumer.go           # Task consumer
│       │   ├── scheduler.go          # Task scheduler
│       │   └── sync.go               # Sync command
│       └── consumers/                # Task handlers (Asynq)
│           ├── notification.go
│           └── cleanup.go
├── internal/
│   ├── config/
│   │   └── config.go                 # App configuration
│   ├── middleware/
│   │   ├── auth.go                   # Auth middleware + caching
│   │   ├── admin_auth.go             # Admin auth
│   │   ├── cors.go                   # CORS
│   │   ├── logger.go                 # Request logging
│   │   ├── recovery.go               # Panic recovery
│   │   └── api_key.go                # API key validation
│   ├── grpc/                         # gRPC services (optional)
│   │   └── account_service.go
│   └── modules/                      # Feature modules
│       ├── auth/
│       │   ├── controllers/
│       │   │   └── auth_controller.go
│       │   ├── usecases/
│       │   │   └── auth_usecase.go
│       │   ├── dtos/
│       │   │   └── auth_dto.go
│       │   └── init.go               # Module init & routes
│       ├── user/
│       │   ├── controllers/
│       │   ├── usecases/
│       │   ├── dtos/
│       │   └── init.go
│       └── {feature}/                # Other modules...
│           ├── controllers/
│           ├── usecases/
│           ├── dtos/
│           ├── validators/           # (optional) Chain validators
│           └── init.go
├── pkg/
│   ├── database/
│   │   ├── database.go               # GORM connection
│   │   ├── user.go                   # User model
│   │   └── {entity}.go               # Other models
│   ├── enums/                        # Enumeration types
│   ├── events/                       # Event definitions
│   ├── queue/                        # Task queue (Asynq)
│   │   ├── tasks.go                  # Task definitions
│   │   └── client.go                 # Queue client
│   ├── redis/                        # Redis client
│   ├── sse/                          # Server-Sent Events
│   │   └── hub.go                    # SSE Hub
│   ├── response/                     # HTTP response helpers
│   ├── logger/                       # Structured logging
│   ├── storage/                      # File storage (S3/R2)
│   └── utils/                        # Utility functions
├── migrations/                       # SQL migrations
├── chart/                            # Kubernetes Helm charts (optional)
├── .env.example
├── go.mod
├── Makefile
├── Dockerfile
└── README.md
```

## Architecture Pattern

```
Controller → Usecase → Database (GORM)
    ↓           ↓
 Request    Business
 Binding     Logic
    ↓           ↓
  DTOs      Models
```

**Layer Responsibilities:**

| Layer | Responsibility |
|-------|----------------|
| Controller | HTTP handling, request/response, validation |
| Usecase | Business logic, orchestration |
| DTO | Data transfer objects, API contracts |
| Model | Database entities (pkg/database) |

## Module Structure

Each feature is an independent module:

```
internal/modules/{feature}/
├── controllers/
│   └── {feature}_controller.go   # HTTP handlers
├── usecases/
│   └── {feature}_usecase.go      # Business logic
├── dtos/
│   └── {feature}_dto.go          # Request/Response DTOs
├── validators/                    # (optional)
│   └── {feature}_validator.go    # Chain validators
└── init.go                        # Module init & route registration
```

## Key Files

### cmd/api/main.go
```go
package main

import (
    "context"
    "log"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"

    "myapp/internal/config"
    "myapp/pkg/database"
    "myapp/pkg/redis"
    "myapp/pkg/queue"
    "myapp/pkg/sse"
)

func main() {
    cfg := config.Load()

    // Initialize dependencies
    db := database.Connect(cfg.Database)
    redisClient := redis.NewClient(cfg.Redis)
    queueClient := queue.NewClient(redisClient)
    sseHub := sse.NewHub(redisClient)

    // Start SSE Hub
    go sseHub.Run()

    // Setup router
    router := SetupRouter(db, redisClient, queueClient, sseHub, cfg)

    // HTTP Server
    server := &http.Server{
        Addr:         ":" + cfg.Port,
        Handler:      router,
        ReadTimeout:  15 * time.Second,
        WriteTimeout: 0, // Disabled for SSE
    }

    // Graceful shutdown
    go func() {
        if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatalf("Server error: %v", err)
        }
    }()

    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    if err := server.Shutdown(ctx); err != nil {
        log.Fatalf("Shutdown error: %v", err)
    }
}
```

### cmd/api/router.go
```go
package main

import (
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"

    "myapp/internal/config"
    "myapp/internal/middleware"
    "myapp/internal/modules/auth"
    "myapp/internal/modules/user"
    "myapp/pkg/queue"
    "myapp/pkg/redis"
    "myapp/pkg/sse"
)

func SetupRouter(
    db *gorm.DB,
    redisClient *redis.Client,
    queueClient *queue.Client,
    sseHub *sse.Hub,
    cfg *config.Config,
) *gin.Engine {
    r := gin.New()

    // Global middleware
    r.Use(middleware.Recovery())
    r.Use(middleware.Logger())
    r.Use(middleware.CORS(cfg.AllowedOrigins))

    // Health check
    r.GET("/health", func(c *gin.Context) {
        c.JSON(200, gin.H{"status": "ok"})
    })

    // Auth middleware
    authMiddleware := middleware.NewAuthMiddleware(db, redisClient, cfg.Firebase)

    // Initialize modules
    auth.Init(r, db, redisClient, authMiddleware)
    user.Init(r, db, authMiddleware)

    return r
}
```

### internal/modules/auth/init.go
```go
package auth

import (
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"

    "myapp/internal/middleware"
    "myapp/internal/modules/auth/controllers"
    "myapp/internal/modules/auth/usecases"
    "myapp/pkg/redis"
)

func Init(
    r *gin.Engine,
    db *gorm.DB,
    redisClient *redis.Client,
    authMiddleware *middleware.AuthMiddleware,
) {
    // Initialize usecase
    usecase := usecases.NewAuthUsecase(db, redisClient)

    // Initialize controller
    controller := controllers.NewAuthController(usecase)

    // Register routes
    authGroup := r.Group("/auth")
    {
        authGroup.POST("/verify", controller.VerifyToken)

        // Protected routes
        protected := authGroup.Group("")
        protected.Use(authMiddleware.Authenticate())
        {
            protected.GET("/me", controller.GetMe)
            protected.PUT("/me", controller.UpdateMe)
        }
    }
}
```

### internal/modules/auth/controllers/auth_controller.go
```go
package controllers

import (
    "net/http"

    "github.com/gin-gonic/gin"

    "myapp/internal/modules/auth/dtos"
    "myapp/internal/modules/auth/usecases"
    "myapp/pkg/response"
)

type AuthController struct {
    usecase *usecases.AuthUsecase
}

func NewAuthController(usecase *usecases.AuthUsecase) *AuthController {
    return &AuthController{usecase: usecase}
}

func (c *AuthController) VerifyToken(ctx *gin.Context) {
    var req dtos.VerifyTokenRequest
    if err := ctx.ShouldBindJSON(&req); err != nil {
        response.Error(ctx, http.StatusBadRequest, "Invalid request")
        return
    }

    user, err := c.usecase.VerifyToken(ctx, req.Token)
    if err != nil {
        response.Error(ctx, http.StatusUnauthorized, "Invalid token")
        return
    }

    response.Success(ctx, dtos.ToUserResponse(user))
}

func (c *AuthController) GetMe(ctx *gin.Context) {
    userID := ctx.GetString("user_id")

    user, err := c.usecase.GetByID(ctx, userID)
    if err != nil {
        response.Error(ctx, http.StatusNotFound, "User not found")
        return
    }

    response.Success(ctx, dtos.ToUserResponse(user))
}

func (c *AuthController) UpdateMe(ctx *gin.Context) {
    userID := ctx.GetString("user_id")

    var req dtos.UpdateUserRequest
    if err := ctx.ShouldBindJSON(&req); err != nil {
        response.Error(ctx, http.StatusBadRequest, "Invalid request")
        return
    }

    user, err := c.usecase.Update(ctx, userID, &req)
    if err != nil {
        response.Error(ctx, http.StatusInternalServerError, err.Error())
        return
    }

    response.Success(ctx, dtos.ToUserResponse(user))
}
```

### internal/modules/auth/usecases/auth_usecase.go
```go
package usecases

import (
    "context"
    "errors"

    "gorm.io/gorm"

    "myapp/internal/modules/auth/dtos"
    "myapp/pkg/database"
    "myapp/pkg/firebase"
    "myapp/pkg/redis"
)

type AuthUsecase struct {
    db          *gorm.DB
    redisClient *redis.Client
}

func NewAuthUsecase(db *gorm.DB, redisClient *redis.Client) *AuthUsecase {
    return &AuthUsecase{
        db:          db,
        redisClient: redisClient,
    }
}

func (u *AuthUsecase) VerifyToken(ctx context.Context, token string) (*database.User, error) {
    // Verify Firebase token
    firebaseToken, err := firebase.VerifyToken(ctx, token)
    if err != nil {
        return nil, err
    }

    // Find or create user
    var user database.User
    result := u.db.Where("firebase_uid = ?", firebaseToken.UID).First(&user)

    if errors.Is(result.Error, gorm.ErrRecordNotFound) {
        // Create new user
        user = database.User{
            FirebaseUID: firebaseToken.UID,
            Email:       firebaseToken.Claims["email"].(string),
        }
        if err := u.db.Create(&user).Error; err != nil {
            return nil, err
        }
    } else if result.Error != nil {
        return nil, result.Error
    }

    return &user, nil
}

func (u *AuthUsecase) GetByID(ctx context.Context, id string) (*database.User, error) {
    var user database.User
    if err := u.db.First(&user, "id = ?", id).Error; err != nil {
        return nil, err
    }
    return &user, nil
}

func (u *AuthUsecase) Update(ctx context.Context, id string, req *dtos.UpdateUserRequest) (*database.User, error) {
    var user database.User
    if err := u.db.First(&user, "id = ?", id).Error; err != nil {
        return nil, err
    }

    updates := map[string]interface{}{}
    if req.Name != nil {
        updates["name"] = *req.Name
    }
    if req.Phone != nil {
        updates["phone"] = *req.Phone
    }

    if err := u.db.Model(&user).Updates(updates).Error; err != nil {
        return nil, err
    }

    return &user, nil
}
```

### internal/modules/auth/dtos/auth_dto.go
```go
package dtos

import "myapp/pkg/database"

type VerifyTokenRequest struct {
    Token string `json:"token" binding:"required"`
}

type UpdateUserRequest struct {
    Name  *string `json:"name"`
    Phone *string `json:"phone"`
}

type UserResponse struct {
    ID        string  `json:"id"`
    Email     string  `json:"email"`
    Name      *string `json:"name"`
    Phone     *string `json:"phone"`
    AvatarURL *string `json:"avatar_url"`
    CreatedAt string  `json:"created_at"`
}

func ToUserResponse(user *database.User) *UserResponse {
    return &UserResponse{
        ID:        user.ID,
        Email:     user.Email,
        Name:      user.Name,
        Phone:     user.Phone,
        AvatarURL: user.AvatarURL,
        CreatedAt: user.CreatedAt.Format("2006-01-02T15:04:05Z"),
    }
}
```

### internal/middleware/auth.go
```go
package middleware

import (
    "net/http"
    "strings"
    "time"

    "github.com/gin-gonic/gin"
    "gorm.io/gorm"

    "myapp/pkg/database"
    "myapp/pkg/firebase"
    "myapp/pkg/redis"
)

type AuthMiddleware struct {
    db          *gorm.DB
    redisClient *redis.Client
}

func NewAuthMiddleware(db *gorm.DB, redisClient *redis.Client) *AuthMiddleware {
    return &AuthMiddleware{
        db:          db,
        redisClient: redisClient,
    }
}

func (m *AuthMiddleware) Authenticate() gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing authorization header"})
            return
        }

        token := strings.TrimPrefix(authHeader, "Bearer ")

        // Check Redis cache first
        cacheKey := "auth:" + token[:32]
        if cached, err := m.redisClient.Get(c, cacheKey); err == nil {
            c.Set("user_id", cached)
            c.Next()
            return
        }

        // Verify Firebase token
        firebaseToken, err := firebase.VerifyToken(c, token)
        if err != nil {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
            return
        }

        // Get user from database
        var user database.User
        if err := m.db.Where("firebase_uid = ?", firebaseToken.UID).First(&user).Error; err != nil {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
            return
        }

        // Cache for 1 hour
        m.redisClient.Set(c, cacheKey, user.ID, time.Hour)

        c.Set("user_id", user.ID)
        c.Set("user", &user)
        c.Next()
    }
}

func (m *AuthMiddleware) Optional() gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.Next()
            return
        }

        token := strings.TrimPrefix(authHeader, "Bearer ")

        firebaseToken, err := firebase.VerifyToken(c, token)
        if err != nil {
            c.Next()
            return
        }

        var user database.User
        if err := m.db.Where("firebase_uid = ?", firebaseToken.UID).First(&user).Error; err == nil {
            c.Set("user_id", user.ID)
            c.Set("user", &user)
        }

        c.Next()
    }
}
```

### pkg/database/database.go
```go
package database

import (
    "fmt"
    "log"

    "gorm.io/driver/mysql"
    "gorm.io/gorm"
    "gorm.io/gorm/logger"
)

type Config struct {
    Host     string
    Port     string
    User     string
    Password string
    Name     string
}

func Connect(cfg Config) *gorm.DB {
    dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=UTC",
        cfg.User, cfg.Password, cfg.Host, cfg.Port, cfg.Name)

    db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
        Logger: logger.Default.LogMode(logger.Info),
    })
    if err != nil {
        log.Fatalf("Failed to connect to database: %v", err)
    }

    sqlDB, _ := db.DB()
    sqlDB.SetMaxOpenConns(100)
    sqlDB.SetMaxIdleConns(10)

    // Auto-migrate models
    db.AutoMigrate(
        &User{},
        // Add other models here
    )

    return db
}
```

### pkg/database/user.go
```go
package database

import (
    "time"

    "github.com/google/uuid"
    "gorm.io/gorm"
)

type User struct {
    ID          string         `gorm:"type:char(36);primaryKey" json:"id"`
    FirebaseUID string         `gorm:"type:varchar(128);uniqueIndex" json:"-"`
    Email       string         `gorm:"type:varchar(255);uniqueIndex" json:"email"`
    Name        *string        `gorm:"type:varchar(255)" json:"name"`
    Phone       *string        `gorm:"type:varchar(20)" json:"phone"`
    AvatarURL   *string        `gorm:"type:varchar(500)" json:"avatar_url"`
    Status      string         `gorm:"type:varchar(20);default:active" json:"status"`
    CreatedAt   time.Time      `json:"created_at"`
    UpdatedAt   time.Time      `json:"updated_at"`
    DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
    if u.ID == "" {
        u.ID = uuid.New().String()
    }
    return nil
}
```

### pkg/response/response.go
```go
package response

import "github.com/gin-gonic/gin"

type Response struct {
    Success bool        `json:"success"`
    Data    interface{} `json:"data,omitempty"`
    Error   string      `json:"error,omitempty"`
    Meta    *Meta       `json:"meta,omitempty"`
}

type Meta struct {
    Page       int   `json:"page"`
    PerPage    int   `json:"per_page"`
    Total      int64 `json:"total"`
    TotalPages int   `json:"total_pages"`
}

func Success(c *gin.Context, data interface{}) {
    c.JSON(200, Response{
        Success: true,
        Data:    data,
    })
}

func SuccessWithMeta(c *gin.Context, data interface{}, meta *Meta) {
    c.JSON(200, Response{
        Success: true,
        Data:    data,
        Meta:    meta,
    })
}

func Error(c *gin.Context, status int, message string) {
    c.JSON(status, Response{
        Success: false,
        Error:   message,
    })
}

func Created(c *gin.Context, data interface{}) {
    c.JSON(201, Response{
        Success: true,
        Data:    data,
    })
}
```

### pkg/queue/tasks.go (Asynq)
```go
package queue

import (
    "encoding/json"

    "github.com/hibiken/asynq"
)

const (
    TaskSendNotification = "notification:send"
    TaskSyncData         = "sync:data"
    TaskCleanup          = "cleanup:expired"
)

type NotificationPayload struct {
    UserID  string `json:"user_id"`
    Title   string `json:"title"`
    Body    string `json:"body"`
    Data    map[string]string `json:"data"`
}

func NewSendNotificationTask(payload *NotificationPayload) (*asynq.Task, error) {
    data, err := json.Marshal(payload)
    if err != nil {
        return nil, err
    }
    return asynq.NewTask(TaskSendNotification, data), nil
}
```

### pkg/sse/hub.go (Server-Sent Events)
```go
package sse

import (
    "context"
    "encoding/json"
    "sync"

    "myapp/pkg/redis"
)

type Client struct {
    UserID  string
    Channel chan []byte
}

type Hub struct {
    clients     map[string]map[*Client]bool
    register    chan *Client
    unregister  chan *Client
    broadcast   chan *Message
    mutex       sync.RWMutex
    redisClient *redis.Client
}

type Message struct {
    UserID string      `json:"user_id,omitempty"`
    Type   string      `json:"type"`
    Data   interface{} `json:"data"`
}

func NewHub(redisClient *redis.Client) *Hub {
    return &Hub{
        clients:     make(map[string]map[*Client]bool),
        register:    make(chan *Client),
        unregister:  make(chan *Client),
        broadcast:   make(chan *Message, 256),
        redisClient: redisClient,
    }
}

func (h *Hub) Run() {
    // Subscribe to Redis for cross-instance communication
    go h.subscribeRedis()

    for {
        select {
        case client := <-h.register:
            h.mutex.Lock()
            if h.clients[client.UserID] == nil {
                h.clients[client.UserID] = make(map[*Client]bool)
            }
            h.clients[client.UserID][client] = true
            h.mutex.Unlock()

        case client := <-h.unregister:
            h.mutex.Lock()
            if clients, ok := h.clients[client.UserID]; ok {
                delete(clients, client)
                close(client.Channel)
                if len(clients) == 0 {
                    delete(h.clients, client.UserID)
                }
            }
            h.mutex.Unlock()

        case message := <-h.broadcast:
            h.broadcastLocal(message)
        }
    }
}

func (h *Hub) BroadcastUser(userID string, msgType string, data interface{}) {
    msg := &Message{
        UserID: userID,
        Type:   msgType,
        Data:   data,
    }

    // Publish to Redis for cross-instance
    payload, _ := json.Marshal(msg)
    h.redisClient.Publish(context.Background(), "sse:broadcast", payload)
}

func (h *Hub) broadcastLocal(msg *Message) {
    h.mutex.RLock()
    defer h.mutex.RUnlock()

    payload, _ := json.Marshal(msg)

    if msg.UserID != "" {
        if clients, ok := h.clients[msg.UserID]; ok {
            for client := range clients {
                select {
                case client.Channel <- payload:
                default:
                    close(client.Channel)
                    delete(clients, client)
                }
            }
        }
    }
}

func (h *Hub) subscribeRedis() {
    pubsub := h.redisClient.Subscribe(context.Background(), "sse:broadcast")
    ch := pubsub.Channel()

    for msg := range ch {
        var message Message
        if err := json.Unmarshal([]byte(msg.Payload), &message); err == nil {
            h.broadcast <- &message
        }
    }
}

func (h *Hub) Register(client *Client) {
    h.register <- client
}

func (h *Hub) Unregister(client *Client) {
    h.unregister <- client
}
```

### cmd/background/main.go (Cobra CLI)
```go
package main

import (
    "log"

    "github.com/spf13/cobra"

    "myapp/cmd/background/commands"
)

func main() {
    rootCmd := &cobra.Command{
        Use:   "worker",
        Short: "Background worker CLI",
    }

    rootCmd.AddCommand(commands.ConsumerCmd())
    rootCmd.AddCommand(commands.SchedulerCmd())
    rootCmd.AddCommand(commands.SyncCmd())

    if err := rootCmd.Execute(); err != nil {
        log.Fatal(err)
    }
}
```

### cmd/background/commands/consumer.go
```go
package commands

import (
    "log"

    "github.com/hibiken/asynq"
    "github.com/spf13/cobra"

    "myapp/cmd/background/consumers"
    "myapp/internal/config"
    "myapp/pkg/database"
    "myapp/pkg/queue"
)

func ConsumerCmd() *cobra.Command {
    return &cobra.Command{
        Use:   "consumer",
        Short: "Start task consumer",
        Run: func(cmd *cobra.Command, args []string) {
            cfg := config.Load()
            db := database.Connect(cfg.Database)

            srv := asynq.NewServer(
                asynq.RedisClientOpt{Addr: cfg.Redis.Addr},
                asynq.Config{
                    Concurrency: 10,
                },
            )

            mux := asynq.NewServeMux()
            mux.HandleFunc(queue.TaskSendNotification, consumers.HandleSendNotification(db))
            mux.HandleFunc(queue.TaskCleanup, consumers.HandleCleanup(db))

            if err := srv.Run(mux); err != nil {
                log.Fatalf("Failed to run server: %v", err)
            }
        },
    }
}
```

## Validator Chain Pattern (Optional)

For complex validations:

```go
package validators

import (
    "context"
    "errors"
)

type Validator interface {
    Validate(ctx context.Context, data interface{}) error
}

type ValidatorChain struct {
    validators []Validator
}

func NewValidatorChain() *ValidatorChain {
    return &ValidatorChain{
        validators: make([]Validator, 0),
    }
}

func (c *ValidatorChain) Add(v Validator) *ValidatorChain {
    c.validators = append(c.validators, v)
    return c
}

func (c *ValidatorChain) Validate(ctx context.Context, data interface{}) error {
    for _, v := range c.validators {
        if err := v.Validate(ctx, data); err != nil {
            return err
        }
    }
    return nil
}

// Example validator
type AmountValidator struct {
    MinAmount int64
    MaxAmount int64
}

func (v *AmountValidator) Validate(ctx context.Context, data interface{}) error {
    amount := data.(int64)
    if amount < v.MinAmount {
        return errors.New("amount too small")
    }
    if amount > v.MaxAmount {
        return errors.New("amount too large")
    }
    return nil
}
```

## Conventions

| Item | Convention | Example |
|------|------------|---------|
| Package | lowercase, short | `auth`, `user` |
| Module folder | snake_case | `bank_account/` |
| File | snake_case | `auth_controller.go` |
| Struct | PascalCase | `AuthController` |
| Interface | PascalCase | `Validator` |
| Function | PascalCase | `GetByID`, `Create` |
| Private func | camelCase | `validateToken` |
| Constants | PascalCase | `TaskSendNotification` |
| Enums | PascalCase | `StatusActive` |

## Makefile

```makefile
.PHONY: dev run build test migrate

dev:
	air

run:
	go run cmd/api/main.go

build:
	go build -o bin/api cmd/api/main.go
	go build -o bin/worker cmd/background/main.go

test:
	go test -v ./...

migrate:
	go run cmd/migrate/main.go

worker-consumer:
	go run cmd/background/main.go consumer

worker-scheduler:
	go run cmd/background/main.go scheduler
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Gin |
| ORM | GORM |
| Database | MySQL/PostgreSQL |
| Cache | Redis |
| Queue | Asynq |
| Auth | Firebase Auth |
| CLI | Cobra |
| gRPC | google.golang.org/grpc |
| Storage | AWS S3 / Cloudflare R2 |

## When to Use What

| Scenario | Solution |
|----------|----------|
| Simple CRUD | Controller → Usecase → Model |
| Complex validation | Validator Chain pattern |
| Background jobs | Asynq task queue |
| Real-time events | SSE Hub + Redis pub/sub |
| Inter-service | gRPC |
| File upload | Storage package (S3/R2) |
| Push notifications | FCM via queue |
