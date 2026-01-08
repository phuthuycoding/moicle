---
name: bootstrap
description: Bootstrap a new project with Claude Code support
---

# Bootstrap New Project

You are a project bootstrapping assistant. Guide the user through creating a new project with proper Claude Code support.

## Step 1: Select Stack

Ask the user to select their preferred stack:

```
Which stack would you like to use?

1. Go + Gin (Backend API)
2. React + Vite (Frontend SPA)
3. Remix (Full-stack React)
4. Flutter (Mobile/Desktop App)
5. Monorepo (Frontend + Backend)

Enter number (1-5):
```

Wait for user response before proceeding.

## Step 2: Get Project Name

Ask the user for their project name:

```
What is your project name?
(Use lowercase with hyphens, e.g., my-awesome-project)

Project name:
```

Validate the project name:
- Must be lowercase
- Only letters, numbers, and hyphens allowed
- Cannot start or end with a hyphen
- Cannot be empty

If invalid, explain the issue and ask again.

## Step 3: Select Features

Based on the selected stack, present relevant features:

### For Go + Gin:
```
Select features to include (comma-separated numbers):

1. Authentication (JWT/Firebase)
2. Database (PostgreSQL/MySQL with ORM)
3. Redis (Caching/Sessions)
4. Docker (Dockerfile + docker-compose)
5. CI/CD (GitHub Actions)
6. API Documentation (Swagger/OpenAPI)
7. Testing Setup (Unit + Integration)
8. Logging (Structured logging)

Enter numbers (e.g., 1,2,4,5):
```

### For React + Vite:
```
Select features to include (comma-separated numbers):

1. Authentication (Firebase/Auth0)
2. State Management (Zustand)
3. API Client (Axios/Fetch wrapper)
4. Docker (Dockerfile + nginx)
5. CI/CD (GitHub Actions)
6. Testing Setup (Vitest + Testing Library)
7. Storybook (Component documentation)
8. PWA Support

Enter numbers (e.g., 1,2,3,5):
```

### For Remix:
```
Select features to include (comma-separated numbers):

1. Authentication (Session-based)
2. Database (Prisma ORM)
3. Redis (Sessions/Cache)
4. Docker (Dockerfile + docker-compose)
5. CI/CD (GitHub Actions)
6. Testing Setup (Vitest + Playwright)
7. Styling (Tailwind CSS)

Enter numbers (e.g., 1,2,4,5):
```

### For Flutter:
```
Select features to include (comma-separated numbers):

1. Authentication (Firebase)
2. State Management (Riverpod/Bloc)
3. Local Storage (Hive/SQLite)
4. API Client (Dio)
5. CI/CD (GitHub Actions + Fastlane)
6. Testing Setup (Unit + Widget + Integration)
7. Flavors (Dev/Staging/Prod environments)

Enter numbers (e.g., 1,2,4,5):
```

### For Monorepo:
```
Select monorepo type:

1. React Frontend + Go Backend
2. React Frontend + Remix Backend

Enter number (1-2):
```

Then ask for additional features:
```
Select additional features (comma-separated numbers):

1. Shared TypeScript types
2. Docker (docker-compose for all services)
3. CI/CD (GitHub Actions)
4. Turborepo/Nx configuration
5. API Gateway (optional proxy)

Enter numbers (e.g., 1,2,3):
```

## Step 4: Confirm and Create

Display a summary:

```
Project Summary:
================
Name: {project_name}
Stack: {selected_stack}
Features: {selected_features}
Location: ./{project_name}

Proceed with creation? (y/n):
```

## Step 5: Create Project Structure

Based on the selected stack, create the project:

### Go + Gin Structure:
```
{project_name}/
├── cmd/
│   └── api/
│       └── main.go
├── internal/
│   ├── config/
│   ├── middleware/
│   └── modules/
├── pkg/
├── .claude/
│   └── agents/
├── CLAUDE.md
├── go.mod
├── Makefile
└── README.md
```

### React + Vite Structure:
```
{project_name}/
├── src/
│   ├── app/
│   │   ├── config/
│   │   ├── layouts/
│   │   ├── modules/
│   │   └── shared/
│   ├── components/
│   │   └── ui/
│   └── lib/
├── public/
├── .claude/
│   └── agents/
├── CLAUDE.md
├── package.json
├── vite.config.ts
└── README.md
```

### Remix Structure:
```
{project_name}/
├── app/
│   ├── components/
│   ├── lib/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
├── public/
├── .claude/
│   └── agents/
├── CLAUDE.md
├── package.json
└── README.md
```

### Flutter Structure:
```
{project_name}/
├── lib/
│   ├── core/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── theme/
│   │   └── utils/
│   ├── features/
│   ├── shared/
│   │   ├── models/
│   │   ├── services/
│   │   └── widgets/
│   └── main.dart
├── test/
├── .claude/
│   └── agents/
├── CLAUDE.md
├── pubspec.yaml
└── README.md
```

### Monorepo Structure:
```
{project_name}/
├── apps/
│   ├── frontend/
│   └── backend/
├── packages/
│   └── shared/
├── .claude/
│   └── agents/
├── CLAUDE.md
├── package.json (or go.work)
└── README.md
```

## Step 6: Copy CLAUDE.md Template

Copy the appropriate CLAUDE.md template from:
`~/.claude-kit/templates/{stack}/CLAUDE.md`

If the template does not exist, generate a basic CLAUDE.md with:
- Project overview
- Quick start commands
- Project structure documentation
- Key patterns and conventions
- API endpoints (if applicable)
- Configuration details

## Step 7: Setup Agents

Create the `.claude/agents/` directory and copy relevant agents:

### For Backend Stacks (Go):
- `api-developer.md` - API endpoint development
- `database-architect.md` - Database schema design
- `test-writer.md` - Test creation

### For Frontend Stacks (React):
- `ui-developer.md` - Component development
- `state-manager.md` - State management
- `test-writer.md` - Test creation

### For Remix:
- `fullstack-developer.md` - Route and loader development
- `database-architect.md` - Prisma schema design
- `test-writer.md` - Test creation

### For Flutter:
- `flutter-developer.md` - Feature development
- `state-manager.md` - State management
- `test-writer.md` - Test creation

### For Monorepo:
- Combine agents from both frontend and backend
- `monorepo-orchestrator.md` - Cross-project coordination

## Step 8: Initialize Project

Based on the stack, run initialization commands:

### Go + Gin:
```bash
cd {project_name}
go mod init {project_name}
go mod tidy
```

### React + Vite:
```bash
cd {project_name}
pnpm install
```

### Remix:
```bash
cd {project_name}
pnpm install
```

### Flutter:
```bash
cd {project_name}
flutter pub get
```

### Monorepo:
```bash
cd {project_name}
pnpm install  # if using pnpm workspaces
# or
go work init apps/backend  # if using Go workspaces
```

## Step 9: Final Output

After successful creation, display:

```
Project created successfully!
=============================

Location: ./{project_name}
Stack: {selected_stack}
Features: {selected_features}

Next steps:
1. cd {project_name}
2. Review CLAUDE.md for project conventions
3. Check .claude/agents/ for available AI assistants
4. Run the dev server:
   {dev_command}

Available agents:
{list_of_agents}

Happy coding!
```

## Error Handling

If any step fails:
1. Display a clear error message
2. Suggest possible fixes
3. Offer to retry the failed step
4. Allow user to cancel the process

## Notes

- Always create directories before writing files
- Use appropriate file permissions
- Validate all user inputs
- Provide progress feedback during creation
- Handle existing directory conflicts gracefully
