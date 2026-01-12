# Remix Fullstack Structure

> Simple Routes + Prisma pattern

## Project Structure

```
{project}/
├── app/
│   ├── routes/
│   │   ├── _index.tsx              # / (home)
│   │   ├── _layout.tsx             # Root layout
│   │   ├── users._index.tsx        # /users (list)
│   │   ├── users.$id.tsx           # /users/:id (detail)
│   │   └── users.new.tsx           # /users/new (create)
│   ├── components/
│   │   ├── ui/                     # Base UI components
│   │   └── shared/                 # Shared components
│   ├── models/                     # Prisma queries
│   │   ├── user.server.ts
│   │   └── story.server.ts
│   ├── services/                   # External services
│   ├── utils/
│   │   ├── db.server.ts            # Prisma client
│   │   └── session.server.ts       # Session handling
│   ├── styles/
│   │   └── tailwind.css
│   ├── entry.client.tsx
│   ├── entry.server.tsx
│   └── root.tsx
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
├── .claude/
├── CLAUDE.md
├── package.json
├── remix.config.js
└── tailwind.config.js
```

## Architecture Pattern

```
Route (loader/action) → Model → Prisma → DB
         ↓
      Component
```

**Simple flow:**
1. Route defines loader (GET) and action (POST/PUT/DELETE)
2. Loader/Action calls Model functions
3. Model contains Prisma queries
4. Component renders data

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

### models/user.server.ts
```tsx
import { db } from '~/utils/db.server';

export async function getUsers() {
  return db.user.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getUserById(id: string) {
  return db.user.findUnique({ where: { id } });
}

export async function createUser(data: { name: string; email: string }) {
  return db.user.create({ data });
}

export async function updateUser(id: string, data: Partial<{ name: string; email: string }>) {
  return db.user.update({ where: { id }, data });
}

export async function deleteUser(id: string) {
  return db.user.delete({ where: { id } });
}
```

### routes/_app.users._index.tsx
```tsx
import { json } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { getUsers } from '~/models/user.server';

export async function loader() {
  const users = await getUsers();
  return json({ users });
}

export default function UsersPage() {
  const { users } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Users</h1>
      <Link to="new">Add User</Link>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <Link to={user.id}>{user.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### routes/_app.users.new.tsx
```tsx
import { redirect, type ActionFunctionArgs } from '@remix-run/node';
import { Form } from '@remix-run/react';
import { createUser } from '~/models/user.server';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  await createUser({ name, email });
  return redirect('/users');
}

export default function NewUserPage() {
  return (
    <Form method="post">
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit">Create</button>
    </Form>
  );
}
```

### utils/db.server.ts
```tsx
import { PrismaClient } from '@prisma/client';

let db: PrismaClient;

declare global {
  var __db__: PrismaClient;
}

if (process.env.NODE_ENV === 'production') {
  db = new PrismaClient();
} else {
  if (!global.__db__) {
    global.__db__ = new PrismaClient();
  }
  db = global.__db__;
  db.$connect();
}

export { db };
```

### prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Conventions

| Item | Convention | Example |
|------|------------|---------|
| Route file | lowercase.tsx | `users._index.tsx` |
| Model file | xxx.server.ts | `user.server.ts` |
| Component | PascalCase | `UserCard.tsx` |
| Loader | `loader` export | `export async function loader()` |
| Action | `action` export | `export async function action()` |

## Data Loading

```tsx
// GET data in loader
export async function loader({ params }: LoaderFunctionArgs) {
  const user = await getUserById(params.id);
  if (!user) throw new Response('Not Found', { status: 404 });
  return json({ user });
}

// Use in component
const { user } = useLoaderData<typeof loader>();
```

## Form Handling

```tsx
// Handle form in action
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'delete') {
    await deleteUser(formData.get('id') as string);
    return redirect('/users');
  }

  // Handle other intents...
}
```

## When to Add More Structure

**Current pattern is enough for:**
- Small to medium apps
- CRUD operations
- SSR focused apps

**Consider adding layers when:**
- Complex business logic
- Multiple external integrations
- Need for extensive testing
