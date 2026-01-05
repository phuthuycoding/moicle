# CLAUDE.md - Vue 3 + Vite + TypeScript Frontend Template

## Project Overview

Frontend application built with:
- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type safety
- **Vite 6** - Build tool
- **Pinia** - State management
- **Vue Router 4** - Client-side routing
- **Tailwind CSS 4** - Utility-first CSS
- **VueUse** - Composition utilities

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
│   ├── api/                     # API client and endpoints
│   │   ├── client.ts
│   │   └── {module}.ts
│   ├── assets/                  # Static assets
│   ├── components/              # Shared components
│   │   ├── ui/                  # Base UI components
│   │   └── common/              # Common components
│   ├── composables/             # Composition functions
│   │   └── use-{name}.ts
│   ├── layouts/                 # Layout components
│   │   ├── DefaultLayout.vue
│   │   └── AuthLayout.vue
│   ├── modules/                 # Feature modules
│   │   └── {module}/
│   │       ├── components/
│   │       ├── composables/
│   │       ├── stores/
│   │       ├── types/
│   │       └── views/
│   ├── router/                  # Router configuration
│   │   └── index.ts
│   ├── stores/                  # Global Pinia stores
│   │   └── {store}.ts
│   ├── types/                   # Global TypeScript types
│   ├── utils/                   # Utility functions
│   ├── App.vue
│   └── main.ts
├── public/
├── .env
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Key Patterns and Conventions

### File Naming
- Components: `PascalCase.vue`
- Composables: `use-kebab-case.ts`
- Stores: `kebab-case.ts`
- Types: `kebab-case.ts`

### Composition API Pattern

```vue
<!-- components/UserCard.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import type { User } from '@/types/user';

interface Props {
  user: User;
  showActions?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
});

const emit = defineEmits<{
  edit: [user: User];
  delete: [id: string];
}>();

const fullName = computed(() => `${props.user.firstName} ${props.user.lastName}`);

function handleEdit() {
  emit('edit', props.user);
}
</script>

<template>
  <div class="rounded-lg border p-4">
    <h3 class="font-medium">{{ fullName }}</h3>
    <p class="text-muted-foreground">{{ user.email }}</p>
    <div v-if="showActions" class="mt-4 flex gap-2">
      <Button @click="handleEdit">Edit</Button>
      <Button variant="destructive" @click="emit('delete', user.id)">Delete</Button>
    </div>
  </div>
</template>
```

### Pinia Store Pattern

```typescript
// stores/user.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getUsers, createUser, updateUser, deleteUser } from '@/api/users';
import type { User, CreateUserDTO } from '@/types/user';

export const useUserStore = defineStore('user', () => {
  // State
  const users = ref<User[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const activeUsers = computed(() => users.value.filter((u) => u.status === 'active'));
  const userCount = computed(() => users.value.length);

  // Actions
  async function fetchUsers() {
    isLoading.value = true;
    error.value = null;
    try {
      users.value = await getUsers();
    } catch (e) {
      error.value = 'Failed to fetch users';
    } finally {
      isLoading.value = false;
    }
  }

  async function addUser(data: CreateUserDTO) {
    const user = await createUser(data);
    users.value.push(user);
    return user;
  }

  return { users, isLoading, error, activeUsers, userCount, fetchUsers, addUser };
});
```

### Composable Pattern

```typescript
// composables/use-pagination.ts
import { ref, computed } from 'vue';

export function usePagination<T>(items: Ref<T[]>, pageSize = 10) {
  const currentPage = ref(1);

  const totalPages = computed(() => Math.ceil(items.value.length / pageSize));

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    return items.value.slice(start, start + pageSize);
  });

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
    }
  }

  function nextPage() {
    goToPage(currentPage.value + 1);
  }

  function prevPage() {
    goToPage(currentPage.value - 1);
  }

  return { currentPage, totalPages, paginatedItems, goToPage, nextPage, prevPage };
}
```

### API Client

```typescript
// api/client.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
```

### View Page Pattern

```vue
<!-- modules/users/views/UsersView.vue -->
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useUserStore } from '../stores/user';
import UserTable from '../components/UserTable.vue';
import UserFormDialog from '../components/UserFormDialog.vue';

const userStore = useUserStore();
const isFormOpen = ref(false);
const editingUser = ref<User | null>(null);

onMounted(() => {
  userStore.fetchUsers();
});

function handleEdit(user: User) {
  editingUser.value = user;
  isFormOpen.value = true;
}
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold">Users</h1>
      <Button @click="isFormOpen = true">Add User</Button>
    </div>

    <UserTable
      :users="userStore.users"
      :loading="userStore.isLoading"
      @edit="handleEdit"
      @delete="userStore.removeUser"
    />

    <UserFormDialog
      v-model:open="isFormOpen"
      :user="editingUser"
      @close="editingUser = null"
    />
  </div>
</template>
```

## Adding New Module

1. Create module directory structure:
```bash
mkdir -p src/modules/{module}/{components,composables,stores,types,views}
```

2. Create types (`types/index.ts`)
3. Create API functions (`api/{module}.ts`)
4. Create store (`stores/{module}.ts`)
5. Create components and views
6. Add routes in `router/index.ts`

## Router Configuration

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('@/views/HomeView.vue') },
      { path: 'users', name: 'users', component: () => import('@/modules/users/views/UsersView.vue') },
    ],
  },
  {
    path: '/auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      { path: 'login', name: 'login', component: () => import('@/views/LoginView.vue') },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
```

## Configuration

### Environment Variables (.env)
```
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_TITLE={project_name}
```

### Vite Config
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
```

### TypeScript Config
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```
