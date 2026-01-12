# React Frontend Structure

> Reference: [Clean Architecture](./clean-architecture.md)

## Project Structure

```
{project}/
├── src/
│   ├── app/
│   │   ├── config/                 # App configuration
│   │   ├── providers/              # Context providers
│   │   ├── routes/                 # Route definitions
│   │   └── App.tsx                 # Root component
│   ├── core/
│   │   ├── domain/
│   │   │   ├── entities/           # Business entities/types
│   │   │   └── repositories/       # Repository interfaces
│   │   ├── application/
│   │   │   ├── use_cases/          # Use cases (hooks)
│   │   │   └── dto/                # DTOs
│   │   └── infrastructure/
│   │       ├── api/                # API client
│   │       ├── repositories/       # Repository implementations
│   │       └── storage/            # LocalStorage, etc.
│   ├── features/
│   │   └── {feature}/
│   │       ├── components/         # Feature components
│   │       ├── hooks/              # Feature hooks
│   │       ├── pages/              # Page components
│   │       └── index.ts            # Public exports
│   ├── shared/
│   │   ├── components/             # Shared UI components
│   │   │   └── ui/                 # Base UI (Button, Input...)
│   │   ├── hooks/                  # Shared hooks
│   │   ├── utils/                  # Utility functions
│   │   └── types/                  # Shared types
│   └── main.tsx                    # Entry point
├── public/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .claude/
│   └── agents/
├── CLAUDE.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## Feature Module Pattern

```
features/{feature}/
├── components/
│   ├── FeatureList.tsx
│   ├── FeatureItem.tsx
│   └── FeatureForm.tsx
├── hooks/
│   ├── useFeature.ts              # Main feature hook
│   ├── useFeatureList.ts
│   └── useFeatureForm.ts
├── pages/
│   ├── FeatureListPage.tsx
│   └── FeatureDetailPage.tsx
├── types.ts                        # Feature-specific types
└── index.ts                        # Public exports
```

## Key Files

### src/app/App.tsx
```tsx
export function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}
```

### src/core/infrastructure/api/client.ts
```tsx
const apiClient = {
  get: <T>(url: string) => fetch(url).then(r => r.json() as T),
  post: <T>(url: string, data: unknown) =>
    fetch(url, {
      method: 'POST',
      body: JSON.stringify(data)
    }).then(r => r.json() as T),
};
```

### Feature Hook Pattern
```tsx
// features/users/hooks/useUsers.ts
export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const data = await userRepository.getAll();
    setUsers(data);
    setLoading(false);
  };

  return { users, loading, fetchUsers };
}
```

## Conventions

| Item | Convention | Example |
|------|------------|---------|
| Component | PascalCase | `UserCard.tsx` |
| Hook | useXxx | `useAuth.ts` |
| Utility | camelCase | `formatDate.ts` |
| Type/Interface | PascalCase | `User`, `ApiResponse` |
| Constant | SCREAMING_SNAKE | `API_BASE_URL` |

## State Management

```
Zustand Store Structure:
├── stores/
│   ├── authStore.ts
│   ├── userStore.ts
│   └── uiStore.ts
```

```tsx
// stores/authStore.ts
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```
