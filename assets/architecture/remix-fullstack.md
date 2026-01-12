# Remix Fullstack Structure

> Reference: [Clean Architecture](./clean-architecture.md)

## Project Structure

```
{project}/
├── app/
│   ├── core/
│   │   ├── domain/
│   │   │   ├── entities/           # Business entities
│   │   │   └── repositories/       # Repository interfaces
│   │   ├── application/
│   │   │   └── use_cases/          # Use cases
│   │   └── infrastructure/
│   │       ├── db/                 # Prisma client
│   │       └── repositories/       # Repository implementations
│   ├── features/
│   │   └── {feature}/
│   │       ├── components/         # Feature components
│   │       ├── actions/            # Server actions
│   │       └── loaders/            # Data loaders
│   ├── routes/
│   │   ├── _index.tsx              # Home page
│   │   ├── _layout.tsx             # Root layout
│   │   └── {feature}/
│   │       ├── _index.tsx          # List page
│   │       ├── $id.tsx             # Detail page
│   │       └── new.tsx             # Create page
│   ├── shared/
│   │   ├── components/             # Shared components
│   │   │   └── ui/                 # Base UI components
│   │   ├── hooks/                  # Shared hooks
│   │   └── utils/                  # Utilities
│   ├── styles/
│   │   └── tailwind.css
│   ├── entry.client.tsx
│   ├── entry.server.tsx
│   └── root.tsx
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
├── tests/
├── .claude/
│   └── agents/
├── CLAUDE.md
├── package.json
├── remix.config.js
├── tailwind.config.js
└── README.md
```

## Route Pattern

```
routes/
├── _index.tsx                      # /
├── _auth.tsx                       # Auth layout
├── _auth.login.tsx                 # /login
├── _auth.register.tsx              # /register
├── _app.tsx                        # App layout (protected)
├── _app.dashboard.tsx              # /dashboard
├── _app.users._index.tsx           # /users
├── _app.users.$id.tsx              # /users/:id
└── _app.users.new.tsx              # /users/new
```

## Key Files

### app/routes/_app.users._index.tsx
```tsx
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader() {
  const users = await userRepository.findAll();
  return json({ users });
}

export default function UsersPage() {
  const { users } = useLoaderData<typeof loader>();
  return <UserList users={users} />;
}
```

### app/routes/_app.users.new.tsx
```tsx
import { redirect } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  await createUserUseCase.execute(data);
  return redirect("/users");
}

export default function NewUserPage() {
  return <UserForm />;
}
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
| Component | PascalCase | `UserCard.tsx` |
| Loader | `loader` export | `export async function loader()` |
| Action | `action` export | `export async function action()` |
| Layout | _layout prefix | `_app.tsx` |

## Data Flow

```
Browser Request
     ↓
Route Loader (server)
     ↓
Use Case → Repository → Prisma → DB
     ↓
JSON Response
     ↓
React Component (client)
     ↓
Form Submit
     ↓
Route Action (server)
     ↓
Use Case → Repository → Prisma → DB
     ↓
Redirect / Response
```
