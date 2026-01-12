# Monorepo Structure

> Reference: [Clean Architecture](./clean-architecture.md)

## Project Structure

```
{project}/
├── apps/
│   ├── web/                        # React frontend
│   │   └── (see react-frontend.md)
│   ├── api/                        # Go/Node backend
│   │   └── (see go-backend.md or remix-fullstack.md)
│   └── mobile/                     # Flutter (optional)
│       └── (see flutter-mobile.md)
├── packages/
│   ├── shared/
│   │   ├── types/                  # Shared TypeScript types
│   │   ├── utils/                  # Shared utilities
│   │   └── config/                 # Shared configuration
│   ├── ui/                         # Shared UI components
│   │   ├── src/
│   │   │   └── components/
│   │   └── package.json
│   └── api-client/                 # Generated API client
│       ├── src/
│       └── package.json
├── tools/
│   ├── scripts/                    # Build/deploy scripts
│   └── generators/                 # Code generators
├── .claude/
│   └── agents/
├── CLAUDE.md
├── package.json                    # Root package.json
├── pnpm-workspace.yaml             # pnpm workspaces
├── turbo.json                      # Turborepo config
├── docker-compose.yml
└── README.md
```

## Workspace Configuration

### pnpm-workspace.yaml
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "test": {
      "dependsOn": ["build"]
    }
  }
}
```

### Root package.json
```json
{
  "name": "monorepo",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "dev:web": "turbo run dev --filter=web",
    "dev:api": "turbo run dev --filter=api"
  },
  "devDependencies": {
    "turbo": "latest"
  }
}
```

## Shared Packages

### packages/shared/types
```typescript
// packages/shared/types/src/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface CreateUserDTO {
  email: string;
  name: string;
}
```

### packages/ui
```typescript
// packages/ui/src/components/Button.tsx
export interface ButtonProps {
  variant: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant, children, onClick }: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}
```

## Docker Compose

```yaml
version: '3.8'
services:
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    ports:
      - "3000:3000"
    depends_on:
      - api

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/app
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

## Conventions

| Item | Location | Example |
|------|----------|---------|
| Shared types | `packages/shared/types` | `User`, `ApiResponse` |
| Shared UI | `packages/ui` | `Button`, `Modal` |
| API client | `packages/api-client` | Auto-generated |
| App-specific | `apps/{app}/src` | Features, pages |

## Cross-App Import

```typescript
// apps/web/src/features/users/UserList.tsx
import { User } from '@repo/shared/types';
import { Button } from '@repo/ui';
import { apiClient } from '@repo/api-client';
```
