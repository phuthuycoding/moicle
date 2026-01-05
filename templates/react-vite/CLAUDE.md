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
│   │   ├── modules/             # Feature modules (MVVM)
│   │   │   └── {module}/
│   │   │       ├── components/
│   │   │       ├── models/
│   │   │       ├── viewmodels/
│   │   │       └── pages/
│   │   ├── shared/              # Shared utilities
│   │   │   ├── components/
│   │   │   ├── contexts/
│   │   │   └── hooks/
│   │   └── router.tsx           # Router setup
│   ├── components/ui/           # shadcn/ui components
│   ├── lib/
│   │   ├── api-client.ts        # API client
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
- Use `*.model.ts` for models
- Use `*.schema.ts` for Zod schemas

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

export async function createEntity(data: CreateEntityDTO): Promise<Entity> {
  return api.post<Entity>('/entities', data);
}
```

**ViewModel** - Business logic and state:
```typescript
// viewmodels/use-entities.ts
export function useEntitiesViewModel() {
  const [data, setData] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const entities = await getEntities();
      setData(entities);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, loadData };
}
```

**View** - Pure UI components:
```typescript
// components/entity-table.tsx
interface EntityTableProps {
  data: Entity[];
  onEdit: (entity: Entity) => void;
  onDelete: (entity: Entity) => void;
}

export function EntityTable({ data, onEdit, onDelete }: EntityTableProps) {
  return (
    <Table>
      {data.map((entity) => (
        <TableRow key={entity.id}>
          <TableCell>{entity.name}</TableCell>
          <TableCell>
            <Button onClick={() => onEdit(entity)}>Edit</Button>
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
}
```

### API Client

```typescript
// lib/api-client.ts
import { getAuth } from '@/app/shared/contexts/auth-context';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = {
  async get<T>(endpoint: string, options?: { requireAuth?: boolean }): Promise<T> {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (options?.requireAuth !== false) {
      const token = await getAuth().currentUser?.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
    return response.json();
  },

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    // Similar to get with method: 'POST' and body
  },
};
```

### Page Component Pattern

```typescript
// pages/entities-page.tsx
export default function EntitiesPage() {
  const vm = useEntitiesPageViewModel();

  useEffect(() => {
    vm.loadData();
  }, [vm.loadData]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Entities</h1>
        <Button onClick={() => vm.setIsFormOpen(true)}>Add New</Button>
      </div>

      <EntityTable
        data={vm.data}
        isLoading={vm.isLoading}
        onEdit={vm.handleEdit}
        onDelete={vm.handleDelete}
      />

      <EntityFormDialog
        open={vm.isFormOpen}
        onOpenChange={vm.setIsFormOpen}
        entity={vm.editingEntity}
        onSubmit={vm.handleSubmit}
      />
    </div>
  );
}
```

## Adding New Module

1. Create module directory structure:
```bash
mkdir -p src/app/modules/{module}/{models,viewmodels,components,pages}
```

2. Create model (`models/entity.model.ts`)
3. Create viewmodel (`viewmodels/use-entity.ts`)
4. Create components (`components/*.tsx`)
5. Create page (`pages/entity-page.tsx`)
6. Add route in `src/app/router.tsx`
7. Add menu item in `src/app/config/menu.ts`

## Component Guidelines

### Form with Zod Validation

```typescript
// models/entity.schema.ts
import { z } from 'zod';

export const entitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

export type EntityFormData = z.infer<typeof entitySchema>;
```

```typescript
// components/entity-form.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function EntityForm({ onSubmit }: Props) {
  const form = useForm<EntityFormData>({
    resolver: zodResolver(entitySchema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField name="name" control={form.control} render={...} />
      </form>
    </Form>
  );
}
```

### Loading States

```typescript
// Use skeleton for initial load
{isLoading && <TableSkeleton rows={5} />}

// Use overlay for data refresh
{isRefreshing && (
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

### Tailwind Config
```typescript
// tailwind.config.ts
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Custom theme extensions
    },
  },
  plugins: [],
};
```

### Path Aliases (tsconfig.json)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```
