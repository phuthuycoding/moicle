# CLAUDE.md - Node.js + Express Backend Template

## Project Overview

Backend API service built with:
- **Node.js 22+** - JavaScript runtime
- **Express 5** - Web framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **Zod** - Schema validation
- **JWT** - Authentication

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

# Run tests
pnpm test
```

## Project Structure

```
{project_name}/
├── src/
│   ├── config/                  # Configuration
│   │   ├── index.ts
│   │   └── database.ts
│   ├── middleware/              # Express middlewares
│   │   ├── auth.ts
│   │   ├── error-handler.ts
│   │   └── validate.ts
│   ├── modules/                 # Feature modules
│   │   └── {module}/
│   │       ├── controller.ts
│   │       ├── service.ts
│   │       ├── repository.ts
│   │       ├── routes.ts
│   │       ├── schema.ts
│   │       └── types.ts
│   ├── shared/                  # Shared utilities
│   │   ├── errors/
│   │   ├── utils/
│   │   └── types/
│   ├── app.ts                   # Express app setup
│   └── server.ts                # Server entry point
├── prisma/
│   └── schema.prisma
├── tests/
├── .env
├── tsconfig.json
└── package.json
```

## Key Patterns and Conventions

### File Naming
- Use `kebab-case.ts` for all files
- Module files: `controller.ts`, `service.ts`, `repository.ts`, `routes.ts`

### Module Structure
Each module follows the layered architecture:
- **routes.ts**: Route definitions
- **controller.ts**: HTTP handlers
- **service.ts**: Business logic
- **repository.ts**: Data access
- **schema.ts**: Zod validation schemas
- **types.ts**: TypeScript interfaces

### Controller Pattern

```typescript
// modules/users/controller.ts
import { Request, Response, NextFunction } from 'express';
import { userService } from './service';
import { CreateUserSchema, UpdateUserSchema } from './schema';

export const userController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const result = await userService.list({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = CreateUserSchema.parse(req.body);
      const user = await userService.create(data);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  },
};
```

### Service Pattern

```typescript
// modules/users/service.ts
import { userRepository } from './repository';
import type { CreateUserDTO, UpdateUserDTO, ListParams } from './types';

export const userService = {
  async list(params: ListParams) {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      userRepository.findMany({ skip, take: limit, search }),
      userRepository.count({ search }),
    ]);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getById(id: string) {
    return userRepository.findById(id);
  },

  async create(data: CreateUserDTO) {
    // Business logic validation
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('Email already exists');
    }
    return userRepository.create(data);
  },
};
```

### Repository Pattern

```typescript
// modules/users/repository.ts
import { prisma } from '@/config/database';
import type { CreateUserDTO, UpdateUserDTO } from './types';

export const userRepository = {
  async findMany({ skip, take, search }: { skip: number; take: number; search?: string }) {
    return prisma.user.findMany({
      where: search
        ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] }
        : undefined,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async create(data: CreateUserDTO) {
    return prisma.user.create({ data });
  },
};
```

### Routes Pattern

```typescript
// modules/users/routes.ts
import { Router } from 'express';
import { userController } from './controller';
import { authenticate } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { CreateUserSchema, UpdateUserSchema } from './schema';

const router = Router();

router.get('/', authenticate, userController.list);
router.get('/:id', authenticate, userController.getById);
router.post('/', authenticate, validate(CreateUserSchema), userController.create);
router.put('/:id', authenticate, validate(UpdateUserSchema), userController.update);
router.delete('/:id', authenticate, userController.delete);

export { router as userRoutes };
```

### Validation Schema

```typescript
// modules/users/schema.ts
import { z } from 'zod';

export const CreateUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const UpdateUserSchema = CreateUserSchema.partial();

export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;
```

### Validation Middleware

```typescript
// middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
  };
}
```

## Adding New Module

1. Create module directory:
```bash
mkdir -p src/modules/{module}
```

2. Create files:
   - `types.ts` - TypeScript interfaces
   - `schema.ts` - Zod schemas
   - `repository.ts` - Data access
   - `service.ts` - Business logic
   - `controller.ts` - HTTP handlers
   - `routes.ts` - Route definitions

3. Register routes in `app.ts`:
```typescript
import { newModuleRoutes } from './modules/new-module/routes';
app.use('/api/new-module', newModuleRoutes);
```

## API Endpoints Pattern

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/{resource} | List all items |
| GET | /api/{resource}/:id | Get single item |
| POST | /api/{resource} | Create item |
| PUT | /api/{resource}/:id | Update item |
| DELETE | /api/{resource}/:id | Delete item |

## Error Handling

```typescript
// shared/errors/index.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}
```

```typescript
// middleware/error-handler.ts
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
  }

  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}
```

## Configuration

### Environment Variables (.env)
```
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/db"
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

### Prisma Schema
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
  name      String
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Authentication Middleware

```typescript
// middleware/auth.ts
import jwt from 'jsonwebtoken';
import { config } from '@/config';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```
