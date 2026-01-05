# CLAUDE.md - Remix Fullstack Template

## Project Overview

Fullstack application built with:
- **Remix 2** - Fullstack React framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Utility-first CSS
- **Prisma** - Database ORM
- **shadcn/ui** - UI component library

## Quick Start

```bash
# Install dependencies
pnpm install

# Setup database
pnpm db:push

# Run development server
pnpm dev

# Build for production
pnpm build

# Run production server
pnpm start
```

## Project Structure

```
{project_name}/
├── app/
│   ├── components/              # Shared components
│   │   ├── ui/                  # shadcn/ui components
│   │   └── forms/               # Form components
│   ├── lib/
│   │   ├── db.server.ts         # Prisma client
│   │   ├── session.server.ts    # Session management
│   │   └── utils.ts             # Utility functions
│   ├── models/                  # Data access layer
│   │   └── {entity}.server.ts
│   ├── routes/
│   │   ├── _index.tsx           # Home page
│   │   ├── _auth.tsx            # Auth layout
│   │   ├── _auth.login.tsx      # Login page
│   │   ├── _app.tsx             # App layout (protected)
│   │   ├── _app.{resource}.tsx  # Resource list
│   │   ├── _app.{resource}.$id.tsx
│   │   └── api.{endpoint}.ts    # API routes
│   ├── styles/
│   │   └── tailwind.css
│   ├── entry.client.tsx
│   ├── entry.server.tsx
│   └── root.tsx
├── prisma/
│   └── schema.prisma
├── public/
├── .env
├── remix.config.js
└── package.json
```

## Key Patterns and Conventions

### File Naming
- Route files use dot notation: `_app.users.$id.tsx`
- Server-only files use `.server.ts` suffix
- Client-only files use `.client.ts` suffix

### Route Conventions
- `_layout.tsx` - Layout route (underscore prefix)
- `$param.tsx` - Dynamic parameter
- `_.tsx` - Pathless layout
- `[.]sitemap.xml.tsx` - Escape special characters

### Loader Pattern (Server-side data fetching)

```typescript
// routes/_app.users.tsx
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { requireAuth } from '~/lib/session.server';
import { getUsers } from '~/models/user.server';

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth(request);

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') ?? '1');
  const search = url.searchParams.get('search') ?? '';

  const { users, total } = await getUsers({ page, search });

  return json({ users, total, page });
}

export default function UsersPage() {
  const { users, total, page } = useLoaderData<typeof loader>();

  return (
    <div>
      <UserTable users={users} />
      <Pagination total={total} currentPage={page} />
    </div>
  );
}
```

### Action Pattern (Form submissions)

```typescript
// routes/_app.users.new.tsx
import { redirect, type ActionFunctionArgs } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { createUser } from '~/models/user.server';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  const errors: Record<string, string> = {};
  if (!name) errors.name = 'Name is required';
  if (!email) errors.email = 'Email is required';

  if (Object.keys(errors).length > 0) {
    return json({ errors }, { status: 400 });
  }

  await createUser({ name, email });
  return redirect('/users');
}

export default function NewUserPage() {
  const actionData = useActionData<typeof action>();

  return (
    <Form method="post">
      <Input name="name" error={actionData?.errors?.name} />
      <Input name="email" error={actionData?.errors?.email} />
      <Button type="submit">Create</Button>
    </Form>
  );
}
```

### Model Pattern (Data access layer)

```typescript
// models/user.server.ts
import { db } from '~/lib/db.server';

export async function getUsers({ page = 1, limit = 10, search = '' }) {
  const where = search
    ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] }
    : {};

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    db.user.count({ where }),
  ]);

  return { users, total };
}

export async function getUserById(id: string) {
  return db.user.findUnique({ where: { id } });
}

export async function createUser(data: { name: string; email: string }) {
  return db.user.create({ data });
}
```

### Session Management

```typescript
// lib/session.server.ts
import { createCookieSessionStorage, redirect } from '@remix-run/node';

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    secrets: [process.env.SESSION_SECRET!],
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  },
});

export async function requireAuth(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');

  if (!userId) {
    throw redirect('/login');
  }

  return userId;
}
```

## Adding New Resource

1. Create model (`models/{resource}.server.ts`)
2. Create routes:
   - `_app.{resources}.tsx` - List page
   - `_app.{resources}.new.tsx` - Create page
   - `_app.{resources}.$id.tsx` - Detail/Edit page
3. Add Prisma model to `schema.prisma`
4. Run `pnpm db:push`

## API Routes

```typescript
// routes/api.users.ts
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ request }: LoaderFunctionArgs) {
  const users = await getUsers();
  return json(users);
}

export async function action({ request }: ActionFunctionArgs) {
  const method = request.method;

  if (method === 'POST') {
    const data = await request.json();
    const user = await createUser(data);
    return json(user, { status: 201 });
  }

  return json({ error: 'Method not allowed' }, { status: 405 });
}
```

## Configuration

### Environment Variables (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/db"
SESSION_SECRET="your-secret-key"
```

### Prisma Schema
```prisma
// prisma/schema.prisma
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
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Remix Config
```javascript
// remix.config.js
export default {
  ignoredRouteFiles: ['**/.*'],
  serverModuleFormat: 'esm',
  tailwind: true,
  postcss: true,
};
```

## Error Handling

```typescript
// routes/_app.users.$id.tsx
export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>{error.status} {error.statusText}</h1>
        <p>{error.data}</p>
      </div>
    );
  }

  return <div>An unexpected error occurred</div>;
}
```
