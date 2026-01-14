# Remix Fullstack Structure

> Module-based Architecture

## Project Structure

Research the latest doc of version Remix before writing this structure.

```
{project}/
├── app/
│   ├── modules/                    # Feature modules
│   │   ├── auth/
│   │   │   ├── components/         # Module-specific components
│   │   │   │   └── LoginForm.tsx
│   │   │   ├── services/           # Business logic & DB access
│   │   │   │   └── auth.server.ts
│   │   │   └── types.ts
│   │   └── users/
│   │       ├── components/
│   │       │   └── UserList.tsx
│   │       ├── services/
│   │       │   └── user.server.ts
│   │       └── types.ts
│   ├── routes/                     # Remix routes (Thin layer)
│   │   ├── _index.tsx              # / (home)
│   │   ├── _auth.tsx               # Auth layout
│   │   ├── _auth.login.tsx         # /login
│   │   ├── _app.tsx                # App layout
│   │   ├── _app.users._index.tsx   # /users (list)
│   │   └── _app.users.$id.tsx      # /users/:id (detail)
│   ├── components/                 # Shared/Global components
│   │   ├── ui/                     # Base UI (Button, Input, etc.)
│   │   └── shared/                 # Shared app components (Layouts, etc.)
│   ├── utils/                      # Shared utilities
│   │   ├── db.server.ts            # Database client
│   │   └── session.server.ts       # Session handling
│   ├── styles/
│   │   └── tailwind.css
│   ├── entry.client.tsx
│   ├── entry.server.tsx
│   └── root.tsx
├── public/
├── .claude/
├── CLAUDE.md
├── package.json
├── remix.config.js
└── tailwind.config.js
```

## Architecture Pattern

```
Route (Loader/Action)
    ↓
Module Service (Business Logic + DB)
    ↓
Database Client
    ↓
Database
```

**Flow:**
1.  **Route**: Handles HTTP request, validation, and response. Calls Module Service.
2.  **Module Service**: Contains business logic, calls Database.
3.  **Module Component**: UI specific to the feature.
4.  **Shared Component**: Generic UI used across modules.

## Route Naming

```
routes/
├── _index.tsx                      # /
├── _auth.tsx                       # Auth layout wrapper
├── _auth.login.tsx                 # /login
├── _auth.register.tsx              # /register
├── _app.tsx                        # App layout wrapper (protected)
├── _app.dashboard.tsx              # /dashboard
├── _app.users._index.tsx           # /users
├── _app.users.$id.tsx              # /users/:id
└── _app.users.new.tsx              # /users/new
```

## Key Files

### modules/users/services/user.server.ts
```tsx
import { db } from '~/utils/db.server';
import type { CreateUserDTO, UpdateUserDTO } from '../types';

export async function getUsers() {
  // Example using a generic query builder or ORM
  return db.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true },
  });
}

export async function getUserById(id: string) {
  return db.user.findUnique({ where: { id } });
}

export async function createUser(data: CreateUserDTO) {
  return db.user.create({ data });
}

export async function updateUser(id: string, data: UpdateUserDTO) {
  return db.user.update({ where: { id }, data });
}

export async function deleteUser(id: string) {
  return db.user.delete({ where: { id } });
}
```

### modules/users/components/UserList.tsx
```tsx
import { Link } from '@remix-run/react';
import type { User } from '../types';

interface UserListProps {
  users: Pick<User, 'id' | 'name'>[];
}

export function UserList({ users }: UserListProps) {
  return (
    <ul className="space-y-2">
      {users.map((user) => (
        <li key={user.id} className="p-4 border rounded hover:bg-gray-50">
          <Link to={user.id} className="text-blue-600 hover:underline">
            {user.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
```

### routes/_app.users._index.tsx
```tsx
import { json } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { getUsers } from '~/modules/users/services/user.server';
import { UserList } from '~/modules/users/components/UserList';

export async function loader() {
  const users = await getUsers();
  return json({ users });
}

export default function UsersPage() {
  const { users } = useLoaderData<typeof loader>();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <Link 
          to="new" 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add User
        </Link>
      </div>
      <UserList users={users} />
    </div>
  );
}
```

### routes/_app.users.new.tsx
```tsx
import { redirect, type ActionFunctionArgs } from '@remix-run/node';
import { Form } from '@remix-run/react';
import { createUser } from '~/modules/users/services/user.server';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  // Basic validation could go here or in service
  if (!email || !name) {
    return json({ error: 'Missing fields' }, { status: 400 });
  }

  await createUser({ name, email });
  return redirect('/users');
}

export default function NewUserPage() {
  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-xl font-bold mb-4">Create User</h1>
      <Form method="post" className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input 
            name="name" 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input 
            name="email" 
            type="email" 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
            required 
          />
        </div>
        <button 
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Create
        </button>
      </Form>
    </div>
  );
}
```

### utils/db.server.ts
```tsx
// Database client setup (e.g., Prisma, Drizzle, Kysely)
// This file should export the shared database instance

let db: any;

declare global {
  var __db__: any;
}

if (process.env.NODE_ENV === 'production') {
  // db = new DatabaseClient();
} else {
  if (!global.__db__) {
    // global.__db__ = new DatabaseClient();
  }
  db = global.__db__;
}

export { db };
```

## Conventions

| Item | Convention | Example |
|------|------------|---------|
| Module Directory | `app/modules/{feature}` | `app/modules/users` |
| Service File | `xxx.server.ts` | `user.server.ts` |
| Component | PascalCase | `UserList.tsx` |
| Route File | lowercase.tsx | `_app.users.tsx` |
| Loader | `loader` export | `export async function loader()` |
| Action | `action` export | `export async function action()` |

## When to use this structure

**Recommended for:**
- Medium to Large applications
- Teams working on different features
- Applications with complex business logic
- When you want to keep related code (UI + Logic) together

**Benefits:**
- **Co-location**: Everything related to a feature is in one place.
- **Scalability**: Easy to add new features without cluttering global folders.
- **Maintainability**: Clear boundaries between features.

