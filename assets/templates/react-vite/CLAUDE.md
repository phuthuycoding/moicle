# CLAUDE.md - React + Vite + TypeScript Frontend Template

## Project Overview

Frontend application built with:
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite 6** - Build tool
- **Tailwind CSS 4** - Utility-first CSS
- **shadcn/ui** - UI component library
- **React Router 7** - Client-side routing
- **TanStack Query** - Server state management
- **React Hook Form + Zod** - Forms & validation

## Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run linter
pnpm lint
```

## Project Structure

```
{project_name}/
├── src/
│   ├── app/
│   │   ├── config/              # App configuration
│   │   │   ├── routes.ts        # Route definitions
│   │   │   └── menu.ts          # Navigation menu
│   │   ├── layouts/             # Layout components
│   │   │   ├── root-layout.tsx
│   │   │   └── sidebar-layout.tsx
│   │   ├── modules/             # Feature modules
│   │   │   └── {module}/
│   │   │       ├── types/       # Models, DTOs, Zod schemas
│   │   │       ├── services/    # Pure API functions
│   │   │       ├── hooks/       # Query/mutation hooks
│   │   │       ├── components/  # Feature components
│   │   │       └── pages/       # Page components
│   │   ├── shared/              # Shared utilities
│   │   │   ├── components/
│   │   │   ├── contexts/
│   │   │   └── hooks/
│   │   └── router.tsx           # Router setup
│   ├── components/ui/           # shadcn/ui components
│   ├── lib/
│   │   ├── http-client.ts       # HTTP client
│   │   └── utils.ts             # Utility functions
│   ├── main.tsx                 # App entry
│   └── index.css                # Global styles
├── public/
├── .env
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Key Patterns and Conventions

### File Naming
- Use `kebab-case.tsx` for components
- Use `use-*.ts` for hooks
- Use `*.model.ts` for types
- Use `*.schema.ts` for Zod schemas
- Use `*.service.ts` for API service functions

### Module Layering

```
pages / components  →  hooks  →  services  →  types
```

- **Components** consume hooks only — never call services directly
- **Hooks** orchestrate queries/mutations and local state
- **Services** are pure: input → API → typed output
- **Types** are shared contracts

### Types (models + schemas)

```typescript
// modules/entity/types/entity.model.ts
export interface Entity {
  id: string;
  name: string;
  status: 'active' | 'inactive';
}

export interface CreateEntityDTO {
  name: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; perPage: number; total: number };
}
```

```typescript
// modules/entity/types/entity.schema.ts
import { z } from 'zod';

export const createEntitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export type CreateEntityFormData = z.infer<typeof createEntitySchema>;
```

### Services (pure API calls)

```typescript
// modules/entity/services/entity.service.ts
import { httpClient } from '@/lib/http-client';
import type { Entity, CreateEntityDTO, Paginated } from '../types/entity.model';

export const entityService = {
  list:   (params: { page?: number; search?: string }) =>
            httpClient.get<Paginated<Entity>>('/entities', { params }),
  detail: (id: string) => httpClient.get<Entity>(`/entities/${id}`),
  create: (data: CreateEntityDTO) => httpClient.post<Entity>('/entities', data),
  update: (id: string, data: Partial<CreateEntityDTO>) =>
            httpClient.patch<Entity>(`/entities/${id}`, data),
  remove: (id: string) => httpClient.delete<void>(`/entities/${id}`),
};
```

### Hooks (queries + mutations)

```typescript
// modules/entity/hooks/use-entity-list.ts
import { useQuery } from '@tanstack/react-query';
import { entityService } from '../services/entity.service';

export const entityKeys = {
  all: ['entities'] as const,
  list: (params: unknown) => [...entityKeys.all, 'list', params] as const,
  detail: (id: string) => [...entityKeys.all, 'detail', id] as const,
};

export function useEntityList(params: { page?: number; search?: string }) {
  return useQuery({
    queryKey: entityKeys.list(params),
    queryFn: () => entityService.list(params),
    placeholderData: (prev) => prev,
  });
}
```

```typescript
// modules/entity/hooks/use-entity-mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { entityService } from '../services/entity.service';
import { entityKeys } from './use-entity-list';
import type { CreateEntityDTO } from '../types/entity.model';

export function useCreateEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEntityDTO) => entityService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: entityKeys.all }),
  });
}

export function useDeleteEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => entityService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: entityKeys.all }),
  });
}
```

### Components (pure UI)

```typescript
// modules/entity/components/entity-table.tsx
interface EntityTableProps {
  data: Entity[];
  isLoading?: boolean;
  onEdit: (entity: Entity) => void;
  onDelete: (entity: Entity) => void;
}

export function EntityTable({ data, isLoading, onEdit, onDelete }: EntityTableProps) {
  if (isLoading) return <TableSkeleton rows={5} />;

  return (
    <Table>
      {data.map((entity) => (
        <TableRow key={entity.id}>
          <TableCell>{entity.name}</TableCell>
          <TableCell>
            <Button onClick={() => onEdit(entity)}>Edit</Button>
            <Button variant="destructive" onClick={() => onDelete(entity)}>Delete</Button>
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
}
```

### Page (composition)

```typescript
// modules/entity/pages/entity-list-page.tsx
import { useState } from 'react';
import { useEntityList } from '../hooks/use-entity-list';
import { useDeleteEntity } from '../hooks/use-entity-mutations';
import { EntityTable } from '../components/entity-table';
import { EntityFormDialog } from '../components/entity-form-dialog';
import type { Entity } from '../types/entity.model';

export default function EntityListPage() {
  const [params, setParams] = useState({ page: 1 });
  const [editing, setEditing] = useState<Entity | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading } = useEntityList(params);
  const deleteEntity = useDeleteEntity();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Entities</h1>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>Add New</Button>
      </div>

      <EntityTable
        data={data?.data ?? []}
        isLoading={isLoading}
        onEdit={(e) => { setEditing(e); setFormOpen(true); }}
        onDelete={(e) => deleteEntity.mutate(e.id)}
      />

      <EntityFormDialog open={formOpen} onOpenChange={setFormOpen} entity={editing} />
    </div>
  );
}
```

### HTTP Client

```typescript
// lib/http-client.ts
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  const token = await getAuthToken();
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

## Adding a New Module

1. Create module directory structure:
```bash
mkdir -p src/app/modules/{module}/{types,services,hooks,components,pages}
```

2. Create types (`types/{module}.model.ts`, `types/{module}.schema.ts`)
3. Create service (`services/{module}.service.ts`)
4. Create hooks (`hooks/use-{module}-list.ts`, `hooks/use-{module}-mutations.ts`)
5. Create components (`components/*.tsx`)
6. Create page (`pages/{module}-list-page.tsx`)
7. Add route in `src/app/router.tsx`
8. Add menu item in `src/app/config/menu.ts`

## Form with Zod + React Hook Form

```typescript
// modules/entity/components/entity-form.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEntitySchema, type CreateEntityFormData } from '../types/entity.schema';
import { useCreateEntity } from '../hooks/use-entity-mutations';

export function EntityForm({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm<CreateEntityFormData>({
    resolver: zodResolver(createEntitySchema),
  });
  const createEntity = useCreateEntity();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => createEntity.mutate(data, { onSuccess }))}>
        <FormField name="name" control={form.control} render={...} />
        <Button type="submit" disabled={createEntity.isPending}>Save</Button>
      </form>
    </Form>
  );
}
```

## Loading States

```typescript
// Initial load → skeleton
{isLoading && <TableSkeleton rows={5} />}

// Background refresh → overlay
{isFetching && !isLoading && (
  <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
    <Spinner />
  </div>
)}
```

## Configuration

### Environment Variables (.env)
```
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_NAME={project_name}
```

### Path Aliases (tsconfig.json)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

## Rules

- Components NEVER call services directly — always via a hook
- Services are pure (no React imports)
- Query keys exported from the hook file, used for invalidation
- Validate external input with Zod at the boundary
- Server state lives in TanStack Query cache, not Zustand/Redux
