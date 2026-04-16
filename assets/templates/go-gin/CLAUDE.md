# CLAUDE.md - Go + Gin Backend (DDD Architecture)

## Project Overview

Backend API service built with:
- **Go 1.24+** - Programming language
- **Gin** - HTTP web framework
- **GORM** - ORM for database operations
- **Redis** - Caching and session storage
- **Viper** - Configuration management

Architecture: **Domain-Driven Design** with strict layer separation. Domain layer has zero infrastructure dependencies.

## Quick Start

```bash
# Install dependencies
go mod download

# Run development server
go run cmd/v1/main.go

# Build for production
go build -o bin/api cmd/v1/main.go

# Run tests
go test ./...
```

## Project Structure

```
{project_name}/
├── cmd/v1/
│   ├── main.go                     # Entry point + AutoMigrate
│   └── router.go                   # Route registration
├── internal/
│   ├── domain/
│   │   ├── shared/                 # Shared types (EventCollector, BaseEvent, EventDispatcher)
│   │   └── {domain}/
│   │       ├── entities/           # Aggregates with behavior + EventCollector
│   │       │   └── {entity}.go
│   │       ├── valueobjects/       # Typed values, only stdlib
│   │       │   └── {vo}.go
│   │       ├── ports/              # 1 interface per file
│   │       │   └── {store_name}.go
│   │       ├── events/             # 1 event per file, embed BaseEvent
│   │       │   └── {event_name}.go
│   │       ├── usecases/           # Business logic, NO infra imports
│   │       │   └── {action}.go
│   │       └── validators/         # (optional) Pure validation
│   ├── application/
│   │   ├── ports/http/
│   │   │   ├── {module}_handler.go  # Register{Module}Routes(r gin.IRouter, app *bootstrap.App)
│   │   │   └── {module}_dtos.go
│   │   ├── services/
│   │   │   └── {module}_service.go
│   │   ├── listeners/
│   │   │   └── on_{event_name}.go
│   │   └── eventbus/
│   │       ├── dispatcher.go
│   │       └── registry.go
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── mysql.go
│   │   │   └── {domain}_{entity}_store.go
│   │   ├── http/
│   │   │   ├── response.go
│   │   │   └── pagination.go
│   │   ├── cache/
│   │   ├── messaging/
│   │   ├── auth/
│   │   └── logger/
│   ├── models/                     # GORM models (DB representation)
│   │   └── {entity}.go
│   ├── bootstrap/
│   │   └── app.go
│   └── config/
│       └── config.go
├── config.yaml
├── go.mod
└── go.sum
```

## Key Patterns

### Entity Pattern

Entities live in `internal/domain/{domain}/entities/`. They hold behavior, embed `EventCollector`, and are created via a `New()` constructor.

```go
// internal/domain/order/entities/order.go
package entities

import (
	"time"

	"github.com/google/uuid"
	"yourproject/internal/domain/order/events"
	"yourproject/internal/domain/order/valueobjects"
	"yourproject/internal/domain/shared"
)

type Order struct {
	shared.EventCollector
	ID        string
	CustomerID string
	Status    valueobjects.OrderStatus
	Total     valueobjects.Money
	Items     []OrderItem
	CreatedAt time.Time
	UpdatedAt time.Time
}

func New(customerID string, items []OrderItem, total valueobjects.Money) *Order {
	id := uuid.New().String()
	o := &Order{
		ID:         id,
		CustomerID: customerID,
		Status:     valueobjects.OrderStatusPending,
		Total:      total,
		Items:      items,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}
	o.Record(events.NewOrderCreated(id, customerID, total.Amount()))
	return o
}

func (o *Order) Confirm() error {
	if o.Status != valueobjects.OrderStatusPending {
		return ErrOrderNotPending
	}
	o.Status = valueobjects.OrderStatusConfirmed
	o.UpdatedAt = time.Now()
	o.Record(events.NewOrderConfirmed(o.ID))
	return nil
}

func (o *Order) Cancel(reason string) error {
	if o.Status == valueobjects.OrderStatusCancelled {
		return ErrOrderAlreadyCancelled
	}
	o.Status = valueobjects.OrderStatusCancelled
	o.UpdatedAt = time.Now()
	o.Record(events.NewOrderCancelled(o.ID, reason))
	return nil
}
```

### Shared EventCollector

```go
// internal/domain/shared/event_collector.go
package shared

type Event interface {
	EventName() string
}

type BaseEvent struct {
	Name      string
	OccurredAt int64
}

func (e BaseEvent) EventName() string { return e.Name }

type EventCollector struct {
	events []Event
}

func (ec *EventCollector) Record(e Event) {
	ec.events = append(ec.events, e)
}

func (ec *EventCollector) PullEvents() []Event {
	evts := ec.events
	ec.events = nil
	return evts
}
```

### Value Object Pattern

Value objects live in `internal/domain/{domain}/valueobjects/`. They use only stdlib, are immutable, and validate on construction.

```go
// internal/domain/order/valueobjects/money.go
package valueobjects

import "errors"

var ErrNegativeAmount = errors.New("amount must not be negative")

type Money struct {
	amount   float64
	currency string
}

func NewMoney(amount float64, currency string) (Money, error) {
	if amount < 0 {
		return Money{}, ErrNegativeAmount
	}
	return Money{amount: amount, currency: currency}, nil
}

func (m Money) Amount() float64  { return m.amount }
func (m Money) Currency() string { return m.currency }

func (m Money) Add(other Money) (Money, error) {
	if m.currency != other.currency {
		return Money{}, errors.New("currency mismatch")
	}
	return NewMoney(m.amount+other.amount, m.currency)
}
```

### Port Pattern

Ports live in `internal/domain/{domain}/ports/`. One interface per file. Domain defines what it needs, infrastructure implements it.

```go
// internal/domain/order/ports/order_store.go
package ports

import "yourproject/internal/domain/order/entities"

type OrderStore interface {
	FindByID(id string) (*entities.Order, error)
	FindByCustomerID(customerID string, page, limit int) ([]*entities.Order, int64, error)
	Save(order *entities.Order) error
	Update(order *entities.Order) error
}
```

### Event Pattern

Events live in `internal/domain/{domain}/events/`. One event per file, embed `BaseEvent`.

```go
// internal/domain/order/events/order_created.go
package events

import (
	"time"
	"yourproject/internal/domain/shared"
)

type OrderCreated struct {
	shared.BaseEvent
	OrderID    string
	CustomerID string
	Total      float64
}

func NewOrderCreated(orderID, customerID string, total float64) OrderCreated {
	return OrderCreated{
		BaseEvent:  shared.BaseEvent{Name: "order.created", OccurredAt: time.Now().Unix()},
		OrderID:    orderID,
		CustomerID: customerID,
		Total:      total,
	}
}
```

### UseCase Pattern

Usecases live in `internal/domain/{domain}/usecases/`. One action per file. They depend only on ports (interfaces), never on infrastructure.

```go
// internal/domain/order/usecases/create_order.go
package usecases

import (
	"yourproject/internal/domain/order/entities"
	"yourproject/internal/domain/order/ports"
	"yourproject/internal/domain/order/valueobjects"
)

type CreateOrder struct {
	orderStore ports.OrderStore
}

func NewCreateOrder(orderStore ports.OrderStore) *CreateOrder {
	return &CreateOrder{orderStore: orderStore}
}

type CreateOrderInput struct {
	CustomerID string
	Items      []entities.OrderItem
	Total      float64
	Currency   string
}

func (uc *CreateOrder) Execute(input CreateOrderInput) (*entities.Order, error) {
	total, err := valueobjects.NewMoney(input.Total, input.Currency)
	if err != nil {
		return nil, err
	}

	order := entities.New(input.CustomerID, input.Items, total)
	if err := uc.orderStore.Save(order); err != nil {
		return nil, err
	}
	return order, nil
}
```

### Handler Wiring Pattern

Handlers live in `internal/application/ports/http/`. Each module exposes `Register{Module}Routes` that receives `gin.IRouter` and `*bootstrap.App`.

```go
// internal/application/ports/http/order_handler.go
package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"yourproject/internal/bootstrap"
	"yourproject/internal/domain/order/usecases"
)

func RegisterOrderRoutes(r gin.IRouter, app *bootstrap.App) {
	h := &orderHandler{
		createOrder: usecases.NewCreateOrder(app.OrderStore),
	}

	g := r.Group("/orders")
	{
		g.POST("/", h.Create)
		g.GET("/:id", h.GetByID)
		g.GET("/", h.List)
		g.PUT("/:id/confirm", h.Confirm)
		g.PUT("/:id/cancel", h.Cancel)
	}
}

type orderHandler struct {
	createOrder *usecases.CreateOrder
}

func (h *orderHandler) Create(c *gin.Context) {
	var dto CreateOrderDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	order, err := h.createOrder.Execute(dto.ToInput())
	if err != nil {
		c.JSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": order})
}
```

### DTOs

```go
// internal/application/ports/http/order_dtos.go
package http

import "yourproject/internal/domain/order/usecases"

type CreateOrderDTO struct {
	CustomerID string         `json:"customer_id" binding:"required"`
	Items      []OrderItemDTO `json:"items" binding:"required,dive"`
	Currency   string         `json:"currency" binding:"required"`
}

func (d CreateOrderDTO) ToInput() usecases.CreateOrderInput {
	// map DTO to usecase input
	return usecases.CreateOrderInput{
		CustomerID: d.CustomerID,
		Currency:   d.Currency,
	}
}
```

### Store Pattern (Infrastructure)

Stores live in `internal/infrastructure/database/`. They implement domain ports using GORM models.

```go
// internal/infrastructure/database/order_order_store.go
package database

import (
	"gorm.io/gorm"
	"yourproject/internal/domain/order/entities"
	"yourproject/internal/domain/order/ports"
	"yourproject/internal/models"
)

type orderStore struct {
	db *gorm.DB
}

func NewOrderStore(db *gorm.DB) ports.OrderStore {
	return &orderStore{db: db}
}

func (s *orderStore) FindByID(id string) (*entities.Order, error) {
	var m models.Order
	if err := s.db.First(&m, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return m.ToEntity(), nil
}

func (s *orderStore) Save(order *entities.Order) error {
	m := models.OrderFromEntity(order)
	return s.db.Create(&m).Error
}

func (s *orderStore) Update(order *entities.Order) error {
	m := models.OrderFromEntity(order)
	return s.db.Save(&m).Error
}

func (s *orderStore) FindByCustomerID(customerID string, page, limit int) ([]*entities.Order, int64, error) {
	var items []models.Order
	var total int64

	s.db.Model(&models.Order{}).Where("customer_id = ?", customerID).Count(&total)
	err := s.db.Where("customer_id = ?", customerID).
		Offset((page - 1) * limit).Limit(limit).
		Find(&items).Error

	result := make([]*entities.Order, len(items))
	for i, m := range items {
		result[i] = m.ToEntity()
	}
	return result, total, err
}
```

### GORM Model Pattern

Models live in `internal/models/`. They are pure GORM structs with `ToEntity()` and `FromEntity()` converters.

```go
// internal/models/order.go
package models

import (
	"time"

	"yourproject/internal/domain/order/entities"
	"yourproject/internal/domain/order/valueobjects"
)

type Order struct {
	ID         string    `gorm:"type:char(36);primaryKey" json:"id"`
	CustomerID string    `gorm:"type:char(36);not null;index" json:"customer_id"`
	Status     string    `gorm:"type:varchar(50);default:'pending'" json:"status"`
	Total      float64   `gorm:"type:decimal(10,2)" json:"total"`
	Currency   string    `gorm:"type:varchar(10)" json:"currency"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (m *Order) ToEntity() *entities.Order {
	total, _ := valueobjects.NewMoney(m.Total, m.Currency)
	return &entities.Order{
		ID:         m.ID,
		CustomerID: m.CustomerID,
		Status:     valueobjects.OrderStatus(m.Status),
		Total:      total,
		CreatedAt:  m.CreatedAt,
		UpdatedAt:  m.UpdatedAt,
	}
}

func OrderFromEntity(e *entities.Order) Order {
	return Order{
		ID:         e.ID,
		CustomerID: e.CustomerID,
		Status:     string(e.Status),
		Total:      e.Total.Amount(),
		Currency:   e.Total.Currency(),
		CreatedAt:  e.CreatedAt,
		UpdatedAt:  e.UpdatedAt,
	}
}
```

### Bootstrap Pattern

```go
// internal/bootstrap/app.go
package bootstrap

import (
	"yourproject/internal/domain/order/ports"
)

type App struct {
	OrderStore ports.OrderStore
	// add more stores/services here
}
```

### Listener Pattern

Listeners live in `internal/application/listeners/`. They react to domain events.

```go
// internal/application/listeners/on_order_created.go
package listeners

import (
	"log"
	"yourproject/internal/domain/order/events"
	"yourproject/internal/domain/shared"
)

type OnOrderCreated struct{}

func (l *OnOrderCreated) Handle(evt shared.Event) {
	e := evt.(events.OrderCreated)
	log.Printf("Order created: %s for customer %s, total: %.2f", e.OrderID, e.CustomerID, e.Total)
	// send email, update analytics, etc.
}
```

### EventBus Pattern

```go
// internal/application/eventbus/dispatcher.go
package eventbus

import "yourproject/internal/domain/shared"

type Handler interface {
	Handle(event shared.Event)
}

type Dispatcher struct {
	handlers map[string][]Handler
}

func NewDispatcher() *Dispatcher {
	return &Dispatcher{handlers: make(map[string][]Handler)}
}

func (d *Dispatcher) Register(eventName string, h Handler) {
	d.handlers[eventName] = append(d.handlers[eventName], h)
}

func (d *Dispatcher) Dispatch(events []shared.Event) {
	for _, evt := range events {
		for _, h := range d.handlers[evt.EventName()] {
			go h.Handle(evt)
		}
	}
}
```

### Router Pattern

```go
// cmd/v1/router.go
package main

import (
	"github.com/gin-gonic/gin"
	"yourproject/internal/bootstrap"
	apphttp "yourproject/internal/application/ports/http"
)

func setupRouter(app *bootstrap.App) *gin.Engine {
	r := gin.Default()

	v1 := r.Group("/api/v1")
	apphttp.RegisterOrderRoutes(v1, app)
	// apphttp.RegisterProductRoutes(v1, app)

	return r
}
```

## Adding a New Domain Module

### Step 1: Domain Layer (no dependencies)

```bash
mkdir -p internal/domain/{domain}/{entities,valueobjects,ports,events,usecases}
```

1. Define **value objects** in `valueobjects/` (validate on construction, stdlib only)
2. Define **entity** in `entities/` with `New()` constructor, behavior methods, embed `EventCollector`
3. Define **events** in `events/` (one per file, embed `BaseEvent`)
4. Define **port interfaces** in `ports/` (one per file)
5. Write **usecases** in `usecases/` (one action per file, depend on ports only)

### Step 2: Infrastructure Layer

1. Create GORM model in `internal/models/` with `ToEntity()` / `FromEntity()`
2. Implement store in `internal/infrastructure/database/` satisfying the domain port
3. Add `AutoMigrate(&models.YourEntity{})` in `cmd/v1/main.go`

### Step 3: Application Layer

1. Add store field to `internal/bootstrap/app.go`
2. Create handler in `internal/application/ports/http/` with `Register{Module}Routes`
3. Create DTOs in `internal/application/ports/http/{module}_dtos.go`
4. Register routes in `cmd/v1/router.go`
5. (Optional) Add listeners in `internal/application/listeners/`

## Import Rules

Domain purity is enforced by convention:

| Layer | Can Import | CANNOT Import |
|-------|-----------|---------------|
| `domain/` | Only stdlib + `domain/shared/` | `application/`, `infrastructure/`, `models/`, any external lib |
| `domain/{x}/usecases/` | `domain/{x}/entities/`, `domain/{x}/ports/`, `domain/{x}/valueobjects/`, `domain/{x}/events/` | Anything outside its own domain |
| `application/` | `domain/`, `bootstrap/`, `infrastructure/` (for wiring only) | — |
| `infrastructure/` | `domain/ports/`, `domain/entities/`, `models/` | `application/` |
| `models/` | `domain/entities/`, `domain/valueobjects/` | `application/`, `infrastructure/` |

**Golden rule**: If you need to add `gorm.io` or any external import to a file under `domain/`, you are doing it wrong.

## API Endpoints Pattern

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/{resource}/ | List items (paginated) |
| GET | /api/v1/{resource}/:id | Get single item |
| POST | /api/v1/{resource}/ | Create item |
| PUT | /api/v1/{resource}/:id | Update item |
| PUT | /api/v1/{resource}/:id/{action} | Trigger domain action |
| DELETE | /api/v1/{resource}/:id | Delete item |

### Query Parameters for List
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search term
- `sort_by` - Sort field
- `order` - Sort order (asc/desc)

### Response Format

```go
// internal/infrastructure/http/response.go

// Success
c.JSON(http.StatusOK, gin.H{"data": result})

// Error
c.JSON(http.StatusBadRequest, gin.H{"error": "validation failed", "details": errors})

// Paginated
c.JSON(http.StatusOK, gin.H{
    "data":        items,
    "total":       total,
    "page":        page,
    "limit":       limit,
    "total_pages": totalPages,
})
```

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

### Domain Unit Tests (no mocks needed)

```go
// internal/domain/order/entities/order_test.go
func TestNewOrder(t *testing.T) {
	total, _ := valueobjects.NewMoney(100, "USD")
	order := entities.New("customer-1", nil, total)

	assert.NotEmpty(t, order.ID)
	assert.Equal(t, valueobjects.OrderStatusPending, order.Status)

	events := order.PullEvents()
	assert.Len(t, events, 1)
	assert.Equal(t, "order.created", events[0].EventName())
}

func TestOrder_Confirm(t *testing.T) {
	total, _ := valueobjects.NewMoney(100, "USD")
	order := entities.New("customer-1", nil, total)
	order.PullEvents() // clear creation events

	err := order.Confirm()
	assert.NoError(t, err)
	assert.Equal(t, valueobjects.OrderStatusConfirmed, order.Status)

	events := order.PullEvents()
	assert.Len(t, events, 1)
	assert.Equal(t, "order.confirmed", events[0].EventName())
}

func TestOrder_Confirm_WhenNotPending_ReturnsError(t *testing.T) {
	total, _ := valueobjects.NewMoney(100, "USD")
	order := entities.New("customer-1", nil, total)
	_ = order.Confirm()

	err := order.Confirm()
	assert.ErrorIs(t, err, entities.ErrOrderNotPending)
}
```

### Value Object Tests

```go
// internal/domain/order/valueobjects/money_test.go
func TestNewMoney_NegativeAmount(t *testing.T) {
	_, err := valueobjects.NewMoney(-10, "USD")
	assert.ErrorIs(t, err, valueobjects.ErrNegativeAmount)
}

func TestMoney_Add_CurrencyMismatch(t *testing.T) {
	usd, _ := valueobjects.NewMoney(10, "USD")
	eur, _ := valueobjects.NewMoney(5, "EUR")
	_, err := usd.Add(eur)
	assert.Error(t, err)
}
```

### UseCase Tests (mock ports)

```go
// internal/domain/order/usecases/create_order_test.go
type mockOrderStore struct {
	saved *entities.Order
}

func (m *mockOrderStore) Save(o *entities.Order) error {
	m.saved = o
	return nil
}
func (m *mockOrderStore) FindByID(id string) (*entities.Order, error)             { return nil, nil }
func (m *mockOrderStore) Update(o *entities.Order) error                          { return nil }
func (m *mockOrderStore) FindByCustomerID(string, int, int) ([]*entities.Order, int64, error) {
	return nil, 0, nil
}

func TestCreateOrder_Execute(t *testing.T) {
	store := &mockOrderStore{}
	uc := usecases.NewCreateOrder(store)

	order, err := uc.Execute(usecases.CreateOrderInput{
		CustomerID: "cust-1",
		Total:      99.99,
		Currency:   "USD",
	})

	assert.NoError(t, err)
	assert.NotNil(t, order)
	assert.NotNil(t, store.saved)
	assert.Equal(t, "cust-1", store.saved.CustomerID)
}
```

### File Naming
- Use `snake_case.go` for all Go files
- One struct/interface per file when possible
- Test files: `{name}_test.go` in the same package
