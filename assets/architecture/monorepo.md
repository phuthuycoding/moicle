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
├── pnpm-workspace.yaml             # (If pnpm) Workspace config
├── turbo.json                      # Turborepo config
└── README.md
```

## Package Manager Selection

**Ask the user to choose a package manager:**

1.  **pnpm** (Recommended):
    *   Uses `pnpm-workspace.yaml`.
2.  **Bun** / **Yarn** / **NPM**:
    *   Uses `workspaces` in `package.json`.

## Workspace Configuration

### Option 1: pnpm (pnpm-workspace.yaml)
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### Option 2: Bun / Yarn / NPM (package.json)
Add to root `package.json`:
```json
{
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
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
