# React Frontend Structure

> Module-based architecture with hooks + services. Idiomatic React — no MVVM ceremony.

## Project Structure

```
{project}/
├── src/
│   ├── components/                 # Shared components
│   │   └── ui/                     # Base UI (Button, Input...)
│   ├── config/                     # App configuration
│   │   ├── app.config.ts
│   │   └── routes.config.ts
│   ├── core/
│   │   ├── context/                # Global contexts (auth, theme)
│   │   ├── hooks/                  # Core reusable hooks
│   │   ├── errors/                 # Error handling
│   │   ├── utils/                  # Core utilities
│   │   ├── http-client.ts          # API client
│   │   └── bootstrap.ts            # App initialization
│   ├── modules/
│   │   └── {module}/
│   │       ├── types/              # Types, interfaces, DTOs, schemas
│   │       ├── services/           # API calls
│   │       ├── hooks/              # Module hooks (state + data fetching)
│   │       ├── components/         # Module components
│   │       ├── pages/              # Page components
│   │       └── index.ts
│   ├── lib/                        # Third-party integrations
│   ├── utils/                      # Shared utilities
│   ├── router.tsx                  # Route definitions
│   ├── index.tsx                   # Entry point
│   └── index.css                   # Global styles
├── public/
├── .claude/
├── CLAUDE.md
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Layering

```
┌─────────────────────────────────────────────────┐
│                  Pages / Components              │
│                    (render UI)                   │
├─────────────────────────────────────────────────┤
│                      Hooks                       │
│   (state, queries, mutations, business logic)    │
├─────────────────────────────────────────────────┤
│                     Services                     │
│                 (pure API calls)                 │
├─────────────────────────────────────────────────┤
│                      Types                       │
│            (models, DTOs, Zod schemas)           │
└─────────────────────────────────────────────────┘
```

**Rules:**
- Components consume hooks, not services directly
- Hooks orchestrate services + state (TanStack Query, Zustand, useState)
- Services are pure functions: input → API → output
- Types are the contract shared across all layers

## Module Structure

```
modules/{module}/
├── types/
│   ├── {module}.model.ts          # Types & interfaces
│   ├── {module}.schema.ts         # Zod schemas (validation)
│   └── index.ts
├── services/
│   ├── {module}.service.ts        # API functions
│   └── index.ts
├── hooks/
│   ├── use-{module}-list.ts       # List query hook
│   ├── use-{module}-detail.ts     # Detail query hook
│   ├── use-{module}-mutations.ts  # Create/update/delete mutations
│   └── index.ts
├── components/
│   ├── {module}-table.tsx
│   ├── {module}-form.tsx
│   └── index.ts
├── pages/
│   ├── {module}-list-page.tsx
│   └── index.ts
└── index.ts
```

## Key Files

### types/user.model.ts
```ts
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}

export interface UserListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: { field: keyof User; order: 'asc' | 'desc' };
}
```

### types/user.schema.ts
```ts
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
```

### services/user.service.ts
```ts
import { httpClient } from '@/core/http-client';
import type { User, CreateUserRequest, Paginated, UserListParams } from '../types/user.model';

export const userService = {
  list: (params: UserListParams) =>
    httpClient.get<Paginated<User>>('/users', { params }),

  detail: (id: string) =>
    httpClient.get<User>(`/users/${id}`),

  create: (data: CreateUserRequest) =>
    httpClient.post<User>('/users', data),

  update: (id: string, data: Partial<CreateUserRequest>) =>
    httpClient.patch<User>(`/users/${id}`, data),

  remove: (id: string) =>
    httpClient.delete<void>(`/users/${id}`),
};
```

### hooks/use-user-list.ts
```ts
import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import type { UserListParams } from '../types/user.model';

export const userKeys = {
  all: ['users'] as const,
  list: (params: UserListParams) => [...userKeys.all, 'list', params] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
};

export const useUserList = (params: UserListParams) => {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userService.list(params),
    placeholderData: (prev) => prev,
  });
};
```

### hooks/use-user-mutations.ts
```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import { userKeys } from './use-user-list';
import type { CreateUserRequest } from '../types/user.model';

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};
```

### pages/user-list-page.tsx
```tsx
import { useState } from 'react';
import { useUserList } from '../hooks/use-user-list';
import { useDeleteUser } from '../hooks/use-user-mutations';
import { UserTable } from '../components/user-table';
import { UserFormDialog } from '../components/user-form-dialog';
import type { User } from '../types/user.model';

export default function UserListPage() {
  const [params, setParams] = useState({ page: 1, pageSize: 20 });
  const [editing, setEditing] = useState<User | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading } = useUserList(params);
  const deleteUser = useDeleteUser();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          Add User
        </Button>
      </div>

      <UserTable
        data={data?.data ?? []}
        meta={data?.meta}
        isLoading={isLoading}
        onEdit={(user) => { setEditing(user); setFormOpen(true); }}
        onDelete={(user) => deleteUser.mutate(user.id)}
        onPageChange={(page) => setParams((p) => ({ ...p, page }))}
      />

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editing}
      />
    </div>
  );
}
```

### core/http-client.ts
```ts
const BASE_URL = import.meta.env.VITE_API_URL;

const buildUrl = (path: string, params?: Record<string, unknown>) => {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
};

const request = async <T>(path: string, init: RequestInit & { params?: Record<string, unknown> } = {}): Promise<T> => {
  const { params, ...rest } = init;
  const token = getToken();
  const res = await fetch(buildUrl(path, params), {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...rest.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new HttpError(res.status, body?.message ?? res.statusText, body);
  }

  return res.status === 204 ? (undefined as T) : res.json();
};

export const httpClient = {
  get:    <T>(path: string, opts?: { params?: Record<string, unknown> }) => request<T>(path, { method: 'GET', ...opts }),
  post:   <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch:  <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  put:    <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
```

## State Management

Pick the right tool per scope:

| Scope | Tool |
|-------|------|
| Server state (API data) | TanStack Query / SWR |
| Component-local state | `useState` / `useReducer` |
| Cross-component UI state | Context API |
| Global client state (cart, filters) | Zustand |
| Form state | React Hook Form + Zod |

Do NOT dump everything into Redux/Zustand — server state belongs in a query cache.

## Conventions

| Item | Convention | Example |
|------|------------|---------|
| Module folder | kebab-case | `user-profile/` |
| Type file | kebab-case.model.ts | `user.model.ts` |
| Schema file | kebab-case.schema.ts | `user.schema.ts` |
| Service file | kebab-case.service.ts | `user.service.ts` |
| Hook file | use-kebab-case.ts | `use-user-list.ts` |
| Component file | kebab-case.tsx | `user-table.tsx` |
| Component export | PascalCase named export | `export const UserTable` |
| Page file | kebab-case-page.tsx | `user-list-page.tsx` |
| Page export | default export | `export default UserListPage` |

## Rules

- Components do NOT call services directly — always go through a hook
- Services are pure: no React, no state, just `fetch` + types
- Query keys live next to hooks and are exported for invalidation
- Validate external input at the boundary with Zod — trust types inside the app
- One module = one feature domain; shared code goes to `core/` or `components/ui/`
