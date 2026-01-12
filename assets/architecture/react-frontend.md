# React Frontend Structure

> MVVM (Model-View-ViewModel) architecture

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
│   │   ├── mvvm/
│   │   │   └── ViewModel.ts        # ViewModel factory
│   │   ├── context/                # Global contexts
│   │   ├── hooks/                  # Core hooks
│   │   ├── interfaces/             # Core interfaces
│   │   ├── enums/                  # Core enums
│   │   ├── errors/                 # Error handling
│   │   ├── utils/                  # Core utilities
│   │   ├── HttpClient.ts           # API client
│   │   └── bootstrap.ts            # App initialization
│   ├── modules/
│   │   └── {module}/
│   │       ├── models/             # Types, interfaces, DTOs
│   │       ├── view-models/        # Hooks (state management)
│   │       ├── services/           # API calls
│   │       ├── components/         # Module components
│   │       ├── pages/              # Page components
│   │       └── index.ts
│   ├── lib/                        # Third-party integrations
│   ├── services/                   # Shared services
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

## MVVM Pattern

```
┌─────────────────────────────────────────────────┐
│                    View                          │
│            (Pages + Components)                  │
├─────────────────────────────────────────────────┤
│                 ViewModel                        │
│          (Hooks - state & logic)                │
├─────────────────────────────────────────────────┤
│                   Model                          │
│           (Types + Services)                    │
└─────────────────────────────────────────────────┘
```

**Data flow:**
1. View renders and uses ViewModel (hook)
2. ViewModel manages state and calls Services
3. Services make API calls
4. Model defines data types

## Module Structure

```
modules/{module}/
├── models/
│   ├── {module}.model.ts          # Types & interfaces
│   ├── {module}.schema.ts         # Zod schemas (validation)
│   └── index.ts
├── view-models/
│   ├── use-{module}-list.ts       # List ViewModel
│   ├── use-{module}-form.ts       # Form ViewModel (optional)
│   └── index.ts
├── services/
│   ├── {module}.service.ts        # API functions
│   └── index.ts
├── components/
│   ├── {Module}Table.tsx
│   ├── {Module}Modal.tsx
│   └── index.ts
├── pages/
│   ├── {Module}ListPage.tsx
│   └── index.ts
└── index.ts
```

## Key Files

### models/user.model.ts
```tsx
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

export interface UserListResponse {
  data: User[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}
```

### services/user.service.ts
```tsx
import Client from '@/core/HttpClient';
import { User, CreateUserRequest } from '../models/user.model';

export const createUser = async (data: CreateUserRequest): Promise<User> => {
  return await Client.post<User>('/users', {
    body: JSON.stringify(data),
  });
};

export const deleteUser = async (id: string): Promise<void> => {
  await Client.delete(`/users/${id}`);
};
```

### view-models/use-user-list.ts
```tsx
import { User } from '../models/user.model';
import { listViewModelFactory } from '@/core/mvvm/ViewModel';

export const useUserList = () => {
  const viewModel = listViewModelFactory<User>(
    undefined,           // viewModel config
    '/users',            // API endpoint
    {},                  // default filters
    { field: 'name', order: 'asc' }  // default sorter
  );

  return { ...viewModel };
};
```

### pages/UserListPage.tsx
```tsx
import { useState } from 'react';
import { User } from '../models/user.model';
import { useUserList } from '../view-models/use-user-list';
import { UserTable } from '../components/UserTable';
import { UserModal } from '../components/UserModal';

export const UserListPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const {
    items,
    isLoading,
    pagination,
    handleTableChange,
    reload,
    handleInputSearch,
  } = useUserList();

  const handleEdit = (record: User) => {
    setSelectedUser(record);
    setModalOpen(true);
  };

  return (
    <div>
      <Button onClick={() => { setSelectedUser(null); setModalOpen(true); }}>
        Add User
      </Button>

      <UserTable
        dataSource={items}
        loading={isLoading}
        pagination={pagination}
        onChange={handleTableChange}
        onEdit={handleEdit}
        onReload={reload}
      />

      <UserModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        user={selectedUser}
        onSuccess={reload}
      />
    </div>
  );
};
```

### core/HttpClient.ts
```tsx
const BASE_URL = import.meta.env.VITE_API_URL;

const Client = {
  get: async <T>(url: string): Promise<T> => {
    const res = await fetch(`${BASE_URL}${url}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  },

  post: async <T>(url: string, options?: RequestInit): Promise<T> => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      ...options,
    });
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  },

  delete: async (url: string): Promise<void> => {
    await fetch(`${BASE_URL}${url}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` },
    });
  },
};

export default Client;
```

## Conventions

| Item | Convention | Example |
|------|------------|---------|
| Module folder | kebab-case | `spam-slug/` |
| Model file | kebab-case.model.ts | `spam-slug.model.ts` |
| Service file | kebab-case.service.ts | `spam-slug.service.ts` |
| ViewModel | use-kebab-case.ts | `use-spam-slug-list.ts` |
| Component | PascalCase.tsx | `SpamSlugTable.tsx` |
| Page | PascalCasePage.tsx | `SpamSlugListPage.tsx` |

## ViewModel Factory Returns

```tsx
listViewModelFactory<T>() returns {
  items: T[],
  isLoading: boolean,
  pagination: { current, pageSize, total },
  handleTableChange: (pagination, filters, sorter) => void,
  handleInputSearch: (field, value) => void,
  reload: () => void,
}
```
