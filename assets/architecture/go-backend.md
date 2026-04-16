# Go Backend Architecture

> Production-grade DDD with Hexagonal Architecture for Go + Gin

**Prerequisite:** Read `ddd-architecture.md` first. This doc shows how DDD maps to Go.

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
| Real-time | SSE + Redis pub/sub |

---

## DDD Directory Structure

```
internal/
├── domain/{domain}/
│   ├── entities/                    # Aggregates + entities with behavior
│   │   └── {entity}.go             # New(), state transitions, guard checks
│   ├── valueobjects/               # Immutable typed values with behavior
│   │   └── {vo}.go                 # Only stdlib imports
│   ├── ports/                      # Hexagonal ports — 1 file per interface
│   │   └── {store_name}.go         # Store interface + related DTOs
│   ├── events/                     # 1 file per domain event
│   │   └── {event_name}.go         # Embed shared.BaseEvent
│   ├── usecases/                   # Business orchestration (pure, no infra)
│   │   └── {action}.go             # One file per use case
│   └── validators/                 # (optional) Pure validation rules
│
├── domain/shared/
│   ├── base_event.go               # BaseEvent struct
│   └── event_collector.go          # EventCollector for entities
│
├── application/
│   ├── ports/http/
│   │   ├── {module}_handler.go     # Register{Module}Routes + handlers
│   │   └── {module}_dtos.go        # Request/Response structs
│   ├── services/
│   │   └── {module}_service.go     # Thin wrapper → domain usecases
│   ├── listeners/
│   │   └── on_{event_name}.go      # Event side-effects
│   └── eventbus/
│       ├── dispatcher.go
│       └── registry.go
│
├── infrastructure/
│   ├── database/
│   │   └── {domain}_{entity}_store.go
│   ├── cache/
│   ├── messaging/
│   ├── auth/
│   ├── storage/
│   ├── logger/
│   └── http/
│       ├── response.go
│       └── pagination.go
│
├── models/                         # GORM models (persistence only)
│   └── {entity}.go
│
├── middleware/
│   ├── auth.go
│   ├── admin_auth.go
│   ├── cors.go
│   ├── logger.go
│   ├── recovery.go
│   └── api_key.go
│
├── config/
│   └── config.go
│
├── bootstrap/
│   └── app.go                      # App struct with all dependencies
│
└── cmd/v1/
    ├── main.go
    └── router.go
```

### Layer Mapping (Generic DDD → Go)

| Generic DDD | Go Path |
|-------------|---------|
| `domain/` | `internal/domain/` |
| `application/ports/{transport}/` | `internal/application/ports/http/` |
| `application/services/` | `internal/application/services/` |
| `application/listeners/` | `internal/application/listeners/` |
| `infrastructure/{persistence}/` | `internal/infrastructure/database/` |
| `models/` | `internal/models/` |

---

## Layer Rules (Import Rules)

```
domain/valueobjects/   → only stdlib
domain/entities/        → only stdlib + domain/shared + domain/valueobjects
domain/ports/           → only stdlib + domain/entities + domain/valueobjects + domain/shared
domain/events/          → only stdlib + domain/shared
domain/usecases/        → domain/entities + ports + events + valueobjects (NO infra)
application/services/   → domain/usecases (thin wrapper)
application/ports/http/ → application/services + bootstrap + infrastructure/http
application/listeners/  → domain/events + bootstrap + infrastructure/messaging
infrastructure/database → domain/ports + models/
```

---

## Hard Rules

- `domain/` MUST NOT import gorm, gin, redis, firebase, asynq, or any external package
- Domain A MUST NOT import Domain B
- NO circular imports
- Domain entities returned via API MUST have `json:"snake_case"` tags
- Async goroutines MUST use `context.Background()`
- Event names in `NewBaseEvent("...")` MUST match `eventbus/registry.go`
- Entity SHOULD embed `shared.EventCollector` and raise events on state changes
- Ports use domain types (entities, value objects), NOT `string` for typed values
- Store constructors: `NewXxxStore(db *gorm.DB) *XxxStore`

---

## Forbidden Imports in Domain

```
"gorm.io/*"
"github.com/gin-gonic/*"
"github.com/redis/*"
"firebase.google.com/*"
"github.com/hibiken/asynq"
```

---

## Domain Layer Examples

### Entity with Behavior

```go
package entities

import (
    "time"

    "myapp/internal/domain/shared"
    "myapp/internal/domain/wallet/valueobjects"
)

type Wallet struct {
    shared.EventCollector
    ID        string
    UserID    string
    Balance   valueobjects.Money
    Status    valueobjects.WalletStatus
    CreatedAt time.Time
    UpdatedAt time.Time
}

func NewWallet(userID string) *Wallet {
    w := &Wallet{
        ID:        shared.NewID(),
        UserID:    userID,
        Balance:   valueobjects.ZeroMoney(),
        Status:    valueobjects.WalletStatusActive,
        CreatedAt: time.Now(),
        UpdatedAt: time.Now(),
    }
    w.Raise(events.NewWalletCreated(w.ID, userID))
    return w
}

func (w *Wallet) IsActive() bool {
    return w.Status == valueobjects.WalletStatusActive
}

func (w *Wallet) CanWithdraw(amount valueobjects.Money) bool {
    return w.IsActive() && w.Balance.GreaterOrEqual(amount)
}

func (w *Wallet) Withdraw(amount valueobjects.Money) error {
    if !w.CanWithdraw(amount) {
        return ErrInsufficientBalance
    }
    w.Balance = w.Balance.Subtract(amount)
    w.UpdatedAt = time.Now()
    w.Raise(events.NewWalletWithdrawalCreated(w.ID, w.UserID, amount))
    return nil
}

func (w *Wallet) Deposit(amount valueobjects.Money) {
    w.Balance = w.Balance.Add(amount)
    w.UpdatedAt = time.Now()
}
```

### Value Object

```go
package valueobjects

import "fmt"

type Money struct {
    amount   int64
    currency string
}

func NewMoney(amount int64, currency string) Money {
    return Money{amount: amount, currency: currency}
}

func ZeroMoney() Money {
    return Money{amount: 0, currency: "VND"}
}

func (m Money) Amount() int64    { return m.amount }
func (m Money) Currency() string { return m.currency }

func (m Money) Add(other Money) Money {
    return Money{amount: m.amount + other.amount, currency: m.currency}
}

func (m Money) Subtract(other Money) Money {
    return Money{amount: m.amount - other.amount, currency: m.currency}
}

func (m Money) GreaterOrEqual(other Money) bool {
    return m.amount >= other.amount
}

func (m Money) Format() string {
    return fmt.Sprintf("%d %s", m.amount, m.currency)
}

type WalletStatus string

const (
    WalletStatusActive   WalletStatus = "active"
    WalletStatusFrozen   WalletStatus = "frozen"
    WalletStatusClosed   WalletStatus = "closed"
)

func (s WalletStatus) IsTerminal() bool {
    return s == WalletStatusClosed
}

func (s WalletStatus) CanTransitionTo(target WalletStatus) bool {
    switch s {
    case WalletStatusActive:
        return target == WalletStatusFrozen || target == WalletStatusClosed
    case WalletStatusFrozen:
        return target == WalletStatusActive || target == WalletStatusClosed
    default:
        return false
    }
}
```

### Port Interface

```go
package ports

import (
    "context"

    "myapp/internal/domain/wallet/entities"
    "myapp/internal/domain/wallet/valueobjects"
)

type WalletStore interface {
    FindByID(ctx context.Context, id string) (*entities.Wallet, error)
    FindByUserID(ctx context.Context, userID string) (*entities.Wallet, error)
    Save(ctx context.Context, wallet *entities.Wallet) error
    UpdateBalance(ctx context.Context, id string, balance valueobjects.Money) error
}
```

### Domain Event

```go
package events

import "myapp/internal/domain/shared"

type WalletWithdrawalCreated struct {
    shared.BaseEvent
    WalletID string
    UserID   string
    Amount   int64
}

func NewWalletWithdrawalCreated(walletID, userID string, amount int64) WalletWithdrawalCreated {
    return WalletWithdrawalCreated{
        BaseEvent: shared.NewBaseEvent("wallet.withdrawal.created"),
        WalletID:  walletID,
        UserID:    userID,
        Amount:    amount,
    }
}
```

### Use Case

```go
package usecases

import (
    "context"
    "errors"

    "myapp/internal/domain/wallet/entities"
    "myapp/internal/domain/wallet/ports"
    "myapp/internal/domain/wallet/valueobjects"
)

type WithdrawUseCase struct {
    walletStore ports.WalletStore
}

func NewWithdrawUseCase(walletStore ports.WalletStore) *WithdrawUseCase {
    return &WithdrawUseCase{walletStore: walletStore}
}

func (uc *WithdrawUseCase) Execute(ctx context.Context, walletID string, amount valueobjects.Money) (*entities.Wallet, error) {
    wallet, err := uc.walletStore.FindByID(ctx, walletID)
    if err != nil {
        return nil, err
    }

    if err := wallet.Withdraw(amount); err != nil {
        return nil, err
    }

    if err := uc.walletStore.Save(ctx, wallet); err != nil {
        return nil, err
    }

    return wallet, nil
}
```

---

## Application Layer Examples

### Handler (ports/http)

```go
package http

import (
    "net/http"

    "github.com/gin-gonic/gin"

    "myapp/internal/application/services"
    "myapp/internal/bootstrap"
    infrahttp "myapp/internal/infrastructure/http"
)

type WalletHandler struct {
    service *services.WalletService
}

func RegisterWalletRoutes(r *gin.RouterGroup, app *bootstrap.App) {
    store := database.NewWalletStore(app.DB)
    withdrawUC := usecases.NewWithdrawUseCase(store)
    service := services.NewWalletService(withdrawUC)
    handler := &WalletHandler{service: service}

    wallets := r.Group("/wallets")
    {
        wallets.POST("/:id/withdraw", handler.Withdraw)
        wallets.GET("/:id", handler.GetByID)
    }
}

func (h *WalletHandler) Withdraw(c *gin.Context) {
    var req WithdrawRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        infrahttp.Error(c, http.StatusBadRequest, "Invalid request")
        return
    }

    wallet, err := h.service.Withdraw(c, c.Param("id"), req.Amount, req.Currency)
    if err != nil {
        infrahttp.Error(c, http.StatusUnprocessableEntity, err.Error())
        return
    }

    infrahttp.Success(c, ToWalletResponse(wallet))
}
```

### DTOs (ports/http)

```go
package http

import "myapp/internal/domain/wallet/entities"

type WithdrawRequest struct {
    Amount   int64  `json:"amount" binding:"required,gt=0"`
    Currency string `json:"currency" binding:"required"`
}

type WalletResponse struct {
    ID      string `json:"id"`
    UserID  string `json:"user_id"`
    Balance int64  `json:"balance"`
    Status  string `json:"status"`
}

func ToWalletResponse(w *entities.Wallet) *WalletResponse {
    return &WalletResponse{
        ID:      w.ID,
        UserID:  w.UserID,
        Balance: w.Balance.Amount(),
        Status:  string(w.Status),
    }
}
```

### Service (thin wrapper)

```go
package services

import (
    "context"

    "myapp/internal/domain/wallet/entities"
    "myapp/internal/domain/wallet/usecases"
    "myapp/internal/domain/wallet/valueobjects"
)

type WalletService struct {
    withdrawUC *usecases.WithdrawUseCase
}

func NewWalletService(withdrawUC *usecases.WithdrawUseCase) *WalletService {
    return &WalletService{withdrawUC: withdrawUC}
}

func (s *WalletService) Withdraw(ctx context.Context, walletID string, amount int64, currency string) (*entities.Wallet, error) {
    money := valueobjects.NewMoney(amount, currency)
    return s.withdrawUC.Execute(ctx, walletID, money)
}
```

### Listener

```go
package listeners

import (
    "context"
    "log"

    "myapp/internal/bootstrap"
    "myapp/internal/domain/wallet/events"
)

func OnWalletWithdrawalCreated(app *bootstrap.App) func(interface{}) {
    return func(evt interface{}) {
        event := evt.(events.WalletWithdrawalCreated)

        go func() {
            ctx := context.Background()
            log.Printf("Withdrawal created: wallet=%s amount=%d", event.WalletID, event.Amount)
            // Send notification, update analytics, etc.
        }()
    }
}
```

---

## Infrastructure Layer Examples

### Store Implementation

```go
package database

import (
    "context"

    "gorm.io/gorm"

    "myapp/internal/domain/wallet/entities"
    "myapp/internal/domain/wallet/ports"
    "myapp/internal/domain/wallet/valueobjects"
    "myapp/internal/models"
)

var _ ports.WalletStore = (*WalletStore)(nil)

type WalletStore struct {
    db *gorm.DB
}

func NewWalletStore(db *gorm.DB) *WalletStore {
    return &WalletStore{db: db}
}

func (s *WalletStore) FindByID(ctx context.Context, id string) (*entities.Wallet, error) {
    var model models.Wallet
    if err := s.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
        return nil, err
    }
    return toEntity(&model), nil
}

func (s *WalletStore) Save(ctx context.Context, wallet *entities.Wallet) error {
    model := toModel(wallet)
    return s.db.WithContext(ctx).Save(model).Error
}

func toEntity(m *models.Wallet) *entities.Wallet {
    return &entities.Wallet{
        ID:      m.ID,
        UserID:  m.UserID,
        Balance: valueobjects.NewMoney(m.Balance, m.Currency),
        Status:  valueobjects.WalletStatus(m.Status),
    }
}

func toModel(e *entities.Wallet) *models.Wallet {
    return &models.Wallet{
        ID:       e.ID,
        UserID:   e.UserID,
        Balance:  e.Balance.Amount(),
        Currency: e.Balance.Currency(),
        Status:   string(e.Status),
    }
}
```

### GORM Model

```go
package models

import (
    "time"

    "github.com/google/uuid"
    "gorm.io/gorm"
)

type Wallet struct {
    ID        string         `gorm:"type:char(36);primaryKey" json:"id"`
    UserID    string         `gorm:"type:char(36);index" json:"user_id"`
    Balance   int64          `gorm:"type:bigint;default:0" json:"balance"`
    Currency  string         `gorm:"type:varchar(10);default:VND" json:"currency"`
    Status    string         `gorm:"type:varchar(20);default:active" json:"status"`
    CreatedAt time.Time      `json:"created_at"`
    UpdatedAt time.Time      `json:"updated_at"`
    DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (w *Wallet) BeforeCreate(tx *gorm.DB) error {
    if w.ID == "" {
        w.ID = uuid.New().String()
    }
    return nil
}
```

---

## Wiring Pattern

The `Register{Module}Routes` function wires all layers together:

```
store → usecase → service → handler → routes
```

```go
func Register{Module}Routes(r *gin.RouterGroup, app *bootstrap.App) {
    // 1. Infrastructure (implements ports)
    store := database.New{Entity}Store(app.DB)

    // 2. Domain use cases (depends on ports)
    createUC := usecases.NewCreate{Entity}UseCase(store)
    listUC := usecases.NewList{Entity}UseCase(store)

    // 3. Application service (thin wrapper)
    service := services.New{Module}Service(createUC, listUC)

    // 4. HTTP handler
    handler := &{Module}Handler{service: service}

    // 5. Routes
    group := r.Group("/{module}")
    {
        group.POST("", handler.Create)
        group.GET("", handler.List)
        group.GET("/:id", handler.GetByID)
    }
}
```

### Bootstrap App Struct

```go
package bootstrap

import (
    "gorm.io/gorm"

    "myapp/internal/application/eventbus"
    "myapp/internal/config"
)

type App struct {
    DB         *gorm.DB
    Config     *config.Config
    EventBus   *eventbus.Dispatcher
    // Add other shared dependencies
}
```

### Router Setup

```go
func SetupRouter(app *bootstrap.App) *gin.Engine {
    r := gin.New()

    r.Use(middleware.Recovery())
    r.Use(middleware.Logger())
    r.Use(middleware.CORS(app.Config.AllowedOrigins))

    r.GET("/health", func(c *gin.Context) {
        c.JSON(200, gin.H{"status": "ok"})
    })

    v1 := r.Group("/v1")
    {
        http.RegisterWalletRoutes(v1, app)
        http.RegisterAuthRoutes(v1, app)
        // Register more domains here
    }

    return r
}
```

---

## Check Scripts

```bash
DOMAIN={domain}

echo "=== Build ==="
go build ./internal/domain/$DOMAIN/... && echo "PASS" || echo "FAIL"

echo "=== Vet ==="
go vet ./internal/domain/$DOMAIN/... && echo "PASS" || echo "FAIL"

echo "=== Domain Purity ==="
grep -rn '"gorm.io\|"github.com/gin\|"github.com/redis\|"firebase.google.com\|"github.com/hibiken' internal/domain/$DOMAIN/ && echo "FAIL: infra in domain" || echo "PASS"

echo "=== No Cross-Domain Imports ==="
for d in $(ls internal/domain/ | grep -v shared | grep -v $DOMAIN); do
    grep -rn "domain/$d" internal/domain/$DOMAIN/ && echo "FAIL: imports domain/$d"
done

echo "=== Tests ==="
go test ./internal/domain/$DOMAIN/... -v && echo "PASS" || echo "FAIL"
```

---

## Test Patterns

### Entity Tests (pure, no mocks)

```go
package entities_test

import (
    "testing"

    "myapp/internal/domain/wallet/entities"
    "myapp/internal/domain/wallet/valueobjects"
)

func TestWallet_Withdraw_Success(t *testing.T) {
    wallet := entities.NewWallet("user-1")
    wallet.Deposit(valueobjects.NewMoney(10000, "VND"))

    err := wallet.Withdraw(valueobjects.NewMoney(5000, "VND"))

    if err != nil {
        t.Fatalf("expected no error, got %v", err)
    }
    if wallet.Balance.Amount() != 5000 {
        t.Fatalf("expected balance 5000, got %d", wallet.Balance.Amount())
    }
}

func TestWallet_Withdraw_InsufficientBalance(t *testing.T) {
    wallet := entities.NewWallet("user-1")
    wallet.Deposit(valueobjects.NewMoney(1000, "VND"))

    err := wallet.Withdraw(valueobjects.NewMoney(5000, "VND"))

    if err == nil {
        t.Fatal("expected error for insufficient balance")
    }
}

func TestWallet_RaisesEventOnWithdraw(t *testing.T) {
    wallet := entities.NewWallet("user-1")
    wallet.Deposit(valueobjects.NewMoney(10000, "VND"))
    wallet.ClearEvents()

    wallet.Withdraw(valueobjects.NewMoney(5000, "VND"))

    events := wallet.Events()
    if len(events) != 1 {
        t.Fatalf("expected 1 event, got %d", len(events))
    }
}
```

### UseCase Tests (mock ports)

```go
package usecases_test

import (
    "context"
    "testing"

    "myapp/internal/domain/wallet/entities"
    "myapp/internal/domain/wallet/usecases"
    "myapp/internal/domain/wallet/valueobjects"
)

type mockWalletStore struct {
    wallet *entities.Wallet
    saved  *entities.Wallet
}

func (m *mockWalletStore) FindByID(ctx context.Context, id string) (*entities.Wallet, error) {
    if m.wallet != nil && m.wallet.ID == id {
        return m.wallet, nil
    }
    return nil, errors.New("not found")
}

func (m *mockWalletStore) Save(ctx context.Context, wallet *entities.Wallet) error {
    m.saved = wallet
    return nil
}

func TestWithdrawUseCase_Success(t *testing.T) {
    wallet := entities.NewWallet("user-1")
    wallet.Deposit(valueobjects.NewMoney(10000, "VND"))

    store := &mockWalletStore{wallet: wallet}
    uc := usecases.NewWithdrawUseCase(store)

    result, err := uc.Execute(context.Background(), wallet.ID, valueobjects.NewMoney(5000, "VND"))

    if err != nil {
        t.Fatalf("expected no error, got %v", err)
    }
    if result.Balance.Amount() != 5000 {
        t.Fatalf("expected 5000, got %d", result.Balance.Amount())
    }
    if store.saved == nil {
        t.Fatal("expected wallet to be saved")
    }
}
```

### Integration Tests (real DB)

```go
package database_test

import (
    "context"
    "testing"

    "myapp/internal/infrastructure/database"
    "myapp/internal/domain/wallet/entities"
    "myapp/internal/domain/wallet/valueobjects"
    "myapp/internal/models"
    "myapp/internal/testutil"
)

func TestWalletStore_SaveAndFind(t *testing.T) {
    db := testutil.SetupTestDB(t)
    db.AutoMigrate(&models.Wallet{})

    store := database.NewWalletStore(db)
    ctx := context.Background()

    wallet := entities.NewWallet("user-1")
    wallet.Deposit(valueobjects.NewMoney(10000, "VND"))

    err := store.Save(ctx, wallet)
    if err != nil {
        t.Fatalf("save failed: %v", err)
    }

    found, err := store.FindByID(ctx, wallet.ID)
    if err != nil {
        t.Fatalf("find failed: %v", err)
    }

    if found.Balance.Amount() != 10000 {
        t.Fatalf("expected 10000, got %d", found.Balance.Amount())
    }
}
```

---

## Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Package | lowercase, short | `entities`, `usecases`, `ports` |
| Domain folder | snake_case | `bank_account/` |
| File | snake_case | `wallet_store.go`, `withdraw.go` |
| Entity struct | PascalCase | `Wallet`, `Transaction` |
| Value object struct | PascalCase | `Money`, `WalletStatus` |
| Port interface | PascalCase + Store/Client suffix | `WalletStore`, `PaymentClient` |
| UseCase struct | PascalCase + UseCase suffix | `WithdrawUseCase` |
| Handler struct | PascalCase + Handler suffix | `WalletHandler` |
| Service struct | PascalCase + Service suffix | `WalletService` |
| Constructor | `New` prefix | `NewWallet()`, `NewWalletStore()` |
| Private func | camelCase | `validateToken`, `toEntity` |
| Constants | PascalCase | `WalletStatusActive` |
| Event struct | `{Domain}{Action}` PascalCase | `WalletWithdrawalCreated` |
| Listener file | `on_{event_name}.go` | `on_wallet_withdrawal_created.go` |
| Handler file | `{module}_handler.go` | `wallet_handler.go` |
| DTO file | `{module}_dtos.go` | `wallet_dtos.go` |
| Store file | `{domain}_{entity}_store.go` | `wallet_wallet_store.go` |

---

## Middleware

```go
package middleware

import (
    "net/http"
    "strings"
    "time"

    "github.com/gin-gonic/gin"
    "gorm.io/gorm"

    "myapp/internal/models"
    "myapp/internal/infrastructure/auth"
    "myapp/internal/infrastructure/cache"
)

type AuthMiddleware struct {
    db          *gorm.DB
    cache       cache.Client
}

func NewAuthMiddleware(db *gorm.DB, cache cache.Client) *AuthMiddleware {
    return &AuthMiddleware{db: db, cache: cache}
}

func (m *AuthMiddleware) Authenticate() gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing authorization header"})
            return
        }

        token := strings.TrimPrefix(authHeader, "Bearer ")

        cacheKey := "auth:" + token[:32]
        if cached, err := m.cache.Get(c, cacheKey); err == nil {
            c.Set("user_id", cached)
            c.Next()
            return
        }

        firebaseToken, err := auth.VerifyToken(c, token)
        if err != nil {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
            return
        }

        var user models.User
        if err := m.db.Where("firebase_uid = ?", firebaseToken.UID).First(&user).Error; err != nil {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
            return
        }

        m.cache.Set(c, cacheKey, user.ID, time.Hour)

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

        firebaseToken, err := auth.VerifyToken(c, token)
        if err != nil {
            c.Next()
            return
        }

        var user models.User
        if err := m.db.Where("firebase_uid = ?", firebaseToken.UID).First(&user).Error; err == nil {
            c.Set("user_id", user.ID)
            c.Set("user", &user)
        }

        c.Next()
    }
}
```

---

## HTTP Response Helpers

```go
package http

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
    c.JSON(200, Response{Success: true, Data: data})
}

func SuccessWithMeta(c *gin.Context, data interface{}, meta *Meta) {
    c.JSON(200, Response{Success: true, Data: data, Meta: meta})
}

func Error(c *gin.Context, status int, message string) {
    c.JSON(status, Response{Success: false, Error: message})
}

func Created(c *gin.Context, data interface{}) {
    c.JSON(201, Response{Success: true, Data: data})
}
```

---

## Background Workers (Asynq)

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
    UserID string            `json:"user_id"`
    Title  string            `json:"title"`
    Body   string            `json:"body"`
    Data   map[string]string `json:"data"`
}

func NewSendNotificationTask(payload *NotificationPayload) (*asynq.Task, error) {
    data, err := json.Marshal(payload)
    if err != nil {
        return nil, err
    }
    return asynq.NewTask(TaskSendNotification, data), nil
}
```

---

## Validator Chain Pattern (Optional)

For complex domain validations that compose multiple rules:

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
    return &ValidatorChain{validators: make([]Validator, 0)}
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
```

---

## Makefile

```makefile
.PHONY: dev run build test migrate lint domain-check

dev:
	air

run:
	go run internal/cmd/v1/main.go

build:
	go build -o bin/api internal/cmd/v1/main.go

test:
	go test -v ./...

test-domain:
	go test -v ./internal/domain/...

migrate:
	go run cmd/migrate/main.go

lint:
	go vet ./...

domain-check:
	@echo "=== Domain Purity ===" && \
	grep -rn '"gorm.io\|"github.com/gin\|"github.com/redis\|"firebase.google.com\|"github.com/hibiken' internal/domain/ && echo "FAIL: infra in domain" || echo "PASS"
```

---

## When to Use What

| Scenario | Solution |
|----------|----------|
| New business capability | New domain with entities, ports, usecases |
| Simple CRUD | Domain entity + store port + single usecase |
| Complex validation | Validator Chain in domain/validators |
| Background jobs | Asynq task queue (infrastructure) |
| Real-time events | SSE Hub + Redis pub/sub (infrastructure) |
| Cross-domain communication | Domain events via EventBus |
| Inter-service | gRPC (infrastructure) |
| File upload | Storage adapter (infrastructure) |
| Push notifications | FCM via Asynq queue |
