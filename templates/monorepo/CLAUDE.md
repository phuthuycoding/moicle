# CLAUDE.md - Monorepo Template (Frontend + Backend)

## Project Overview

Monorepo containing:
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Go + Gin + GORM (or Node.js + Express alternative)
- **Shared**: Common types and utilities

## Quick Start

```bash
# Backend (Terminal 1)
cd apps/backend && go run cmd/api/main.go  # Port 8080

# Frontend (Terminal 2)
cd apps/frontend && pnpm dev  # Port 5173

# Or run both with task runner
pnpm dev:all
```

## Project Structure

```
{project_name}/
├── apps/
│   ├── backend/                 # Backend application
│   │   ├── cmd/
│   │   │   └── api/
│   │   │       └── main.go
│   │   ├── internal/
│   │   │   ├── config/
│   │   │   ├── middleware/
│   │   │   └── modules/
│   │   │       ├── router/
│   │   │       └── {module}/
│   │   │           ├── controllers/
│   │   │           ├── models/
│   │   │           ├── usecases/
│   │   │           └── init.go
│   │   ├── pkg/
│   │   │   ├── database/
│   │   │   └── response/
│   │   ├── config.yaml
│   │   └── go.mod
│   │
│   └── frontend/                # Frontend application
│       ├── src/
│       │   ├── app/
│       │   │   ├── config/
│       │   │   ├── layouts/
│       │   │   ├── modules/
│       │   │   │   └── {module}/
│       │   │   │       ├── components/
│       │   │   │       ├── models/
│       │   │   │       ├── viewmodels/
│       │   │   │       └── pages/
│       │   │   ├── shared/
│       │   │   └── router.tsx
│       │   ├── components/ui/
│       │   ├── lib/
│       │   │   └── api-client.ts
│       │   └── main.tsx
│       ├── package.json
│       └── vite.config.ts
│
├── packages/                    # Shared packages (optional)
│   └── shared-types/
│       └── index.ts
│
├── scripts/                     # Development scripts
├── docker-compose.yml
├── package.json                 # Root package.json for scripts
└── README.md
```

## Backend Module Structure

### Module Init Pattern

```go
// internal/modules/{module}/init.go
package module

import (
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
)

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

### GORM Model Pattern

```go
// models/entity.go
type Entity struct {
    ID        string    `gorm:"type:char(36);primaryKey" json:"id"`
    Name      string    `gorm:"type:varchar(255);not null" json:"name"`
    Status    string    `gorm:"type:varchar(50);default:'active'" json:"status"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}
```

### Response Format

```go
// Success
c.JSON(http.StatusOK, gin.H{"data": result})

// Paginated
c.JSON(http.StatusOK, gin.H{
    "data":        items,
    "total":       total,
    "page":        page,
    "limit":       limit,
    "total_pages": totalPages,
})
```

## Frontend Module Structure

### MVVM Pattern

**Model** - Data types and API functions:
```typescript
// models/entity.model.ts
export interface Entity {
  id: string;
  name: string;
  status: 'active' | 'inactive';
}

export async function getEntities(): Promise<Entity[]> {
  return api.get<Entity[]>('/entities');
}
```

**ViewModel** - Business logic:
```typescript
// viewmodels/use-entities.ts
export function useEntitiesViewModel() {
  const [data, setData] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const entities = await getEntities();
    setData(entities);
    setIsLoading(false);
  }, []);

  return { data, isLoading, loadData };
}
```

**View** - Pure UI:
```typescript
// components/entity-table.tsx
interface Props {
  data: Entity[];
  onEdit: (entity: Entity) => void;
}

export function EntityTable({ data, onEdit }: Props) {
  return <Table>...</Table>;
}
```

### API Client

```typescript
// lib/api-client.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    const json = await response.json();
    return json.data ?? json;
  },

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
```

## Adding New Module

### Backend Module

1. Create directory structure:
```bash
mkdir -p apps/backend/internal/modules/{module}/{controllers,models,usecases}
```

2. Create model (`models/entity.go`)
3. Create usecase (`usecases/usecase.go`)
4. Create controller (`controllers/controller.go`)
5. Create init.go and register in router

### Frontend Module

1. Create directory structure:
```bash
mkdir -p apps/frontend/src/app/modules/{module}/{models,viewmodels,components,pages}
```

2. Create model (`models/entity.model.ts`)
3. Create viewmodel (`viewmodels/use-entity.ts`)
4. Create components and pages
5. Add route in router.tsx
6. Add menu item in config/menu.ts

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/{resource}/ | List all |
| GET | /api/{resource}/:id | Get by ID |
| POST | /api/{resource}/ | Create |
| PUT | /api/{resource}/:id | Update |
| DELETE | /api/{resource}/:id | Delete |

### Query Parameters
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search term
- `sort_by` - Sort field
- `order` - Sort order (asc/desc)

## Configuration

### Backend (config.yaml)
```yaml
server:
  port: 8080
  mode: debug

database:
  type: mysql
  host: localhost
  port: 3306
  user: root
  password: ""
  dbname: {project_name}

redis:
  address: localhost:6379
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_NAME={project_name}
```

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./apps/backend
    ports:
      - "8080:8080"
    depends_on:
      - db
      - redis
    environment:
      - DATABASE_URL=mysql://root:password@db:3306/{project_name}

  frontend:
    build: ./apps/frontend
    ports:
      - "5173:80"

  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: {project_name}
    volumes:
      - db_data:/var/lib/mysql

  redis:
    image: redis:7-alpine

volumes:
  db_data:
```

## Development Scripts

### Root package.json
```json
{
  "scripts": {
    "dev:backend": "cd apps/backend && go run cmd/api/main.go",
    "dev:frontend": "cd apps/frontend && pnpm dev",
    "dev:all": "concurrently \"pnpm dev:backend\" \"pnpm dev:frontend\"",
    "build:backend": "cd apps/backend && go build -o bin/api cmd/api/main.go",
    "build:frontend": "cd apps/frontend && pnpm build",
    "test:backend": "cd apps/backend && go test ./...",
    "test:frontend": "cd apps/frontend && pnpm test"
  }
}
```

## Conventions

### Backend
- File naming: `snake_case.go`
- UUID primary keys
- Nullable fields use pointers
- No soft deletes

### Frontend
- File naming: `kebab-case.tsx`
- Hook naming: `use-*.ts`
- No direct API calls in components
- Zod schemas in models folder

## Shared Types (Optional)

```typescript
// packages/shared-types/index.ts
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export type Status = 'active' | 'inactive' | 'pending';
```

Use in frontend:
```typescript
import type { PaginatedResponse } from '@{project_name}/shared-types';
```
