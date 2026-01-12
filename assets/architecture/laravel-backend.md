# Laravel Backend Structure

> Reference: [Clean Architecture](./clean-architecture.md)

## Project Structure

```
{project}/
├── app/
│   ├── Console/
│   │   └── Commands/               # Artisan commands
│   ├── Exceptions/
│   │   └── Handler.php
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/                # API controllers
│   │   ├── Middleware/
│   │   ├── Requests/               # Form requests (validation)
│   │   └── Resources/              # API resources (transformers)
│   ├── Models/                     # Eloquent models
│   ├── Repositories/
│   │   ├── Contracts/              # Repository interfaces
│   │   └── Eloquent/               # Repository implementations
│   ├── Services/                   # Business logic services
│   └── Providers/
├── config/
├── database/
│   ├── factories/
│   ├── migrations/
│   └── seeders/
├── routes/
│   ├── api.php
│   └── web.php
├── tests/
│   ├── Feature/
│   └── Unit/
├── .claude/
│   └── agents/
├── CLAUDE.md
├── composer.json
├── .env.example
└── README.md
```

## Clean Architecture Mapping

```
┌─────────────────────────────────────────────────────┐
│              Presentation Layer                      │
│    Controllers, Requests, Resources, Middleware      │
├─────────────────────────────────────────────────────┤
│              Application Layer                       │
│                   Services                           │
├─────────────────────────────────────────────────────┤
│                Domain Layer                          │
│    Models (Entities), Repository Contracts           │
├─────────────────────────────────────────────────────┤
│             Infrastructure Layer                     │
│      Eloquent Repositories, External APIs            │
└─────────────────────────────────────────────────────┘
```

## Module Pattern (for large apps)

```
app/
├── Modules/
│   └── {Module}/
│       ├── Controllers/
│       ├── Models/
│       ├── Repositories/
│       │   ├── Contracts/
│       │   └── Eloquent/
│       ├── Services/
│       ├── Requests/
│       ├── Resources/
│       ├── routes.php
│       └── ModuleServiceProvider.php
```

## Key Files

### app/Http/Controllers/Api/UserController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Resources\UserResource;
use App\Services\UserService;

class UserController extends Controller
{
    public function __construct(
        private UserService $userService
    ) {}

    public function index()
    {
        $users = $this->userService->getAllPaginated();
        return UserResource::collection($users);
    }

    public function store(StoreUserRequest $request)
    {
        $user = $this->userService->create($request->validated());
        return new UserResource($user);
    }

    public function show(int $id)
    {
        $user = $this->userService->findOrFail($id);
        return new UserResource($user);
    }
}
```

### app/Services/UserService.php
```php
<?php

namespace App\Services;

use App\Repositories\Contracts\UserRepositoryInterface;

class UserService
{
    public function __construct(
        private UserRepositoryInterface $userRepository
    ) {}

    public function getAllPaginated(int $perPage = 15)
    {
        return $this->userRepository->paginate($perPage);
    }

    public function create(array $data)
    {
        return $this->userRepository->create($data);
    }

    public function findOrFail(int $id)
    {
        return $this->userRepository->findOrFail($id);
    }
}
```

### app/Repositories/Contracts/UserRepositoryInterface.php
```php
<?php

namespace App\Repositories\Contracts;

interface UserRepositoryInterface
{
    public function all();
    public function paginate(int $perPage = 15);
    public function find(int $id);
    public function findOrFail(int $id);
    public function create(array $data);
    public function update(int $id, array $data);
    public function delete(int $id);
}
```

### app/Repositories/Eloquent/UserRepository.php
```php
<?php

namespace App\Repositories\Eloquent;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;

class UserRepository implements UserRepositoryInterface
{
    public function __construct(
        private User $model
    ) {}

    public function all()
    {
        return $this->model->all();
    }

    public function paginate(int $perPage = 15)
    {
        return $this->model->paginate($perPage);
    }

    public function find(int $id)
    {
        return $this->model->find($id);
    }

    public function findOrFail(int $id)
    {
        return $this->model->findOrFail($id);
    }

    public function create(array $data)
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data)
    {
        $record = $this->findOrFail($id);
        $record->update($data);
        return $record;
    }

    public function delete(int $id)
    {
        return $this->model->destroy($id);
    }
}
```

### app/Http/Requests/User/StoreUserRequest.php
```php
<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }
}
```

### app/Http/Resources/UserResource.php
```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}
```

## Service Provider Binding

```php
// app/Providers/RepositoryServiceProvider.php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Eloquent\UserRepository;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
    }
}
```

## Conventions

| Item | Convention | Example |
|------|------------|---------|
| Controller | PascalCase + Controller | `UserController` |
| Model | Singular PascalCase | `User` |
| Migration | snake_case with timestamp | `2024_01_01_create_users_table` |
| Request | PascalCase + Request | `StoreUserRequest` |
| Resource | PascalCase + Resource | `UserResource` |
| Service | PascalCase + Service | `UserService` |
| Repository | PascalCase + Repository | `UserRepository` |

## API Response Format

```json
{
    "data": { ... },
    "message": "Success",
    "meta": {
        "current_page": 1,
        "per_page": 15,
        "total": 100
    }
}
```

## Artisan Commands

```bash
# Generate
php artisan make:controller Api/UserController --api
php artisan make:model User -mfs
php artisan make:request User/StoreUserRequest
php artisan make:resource UserResource

# Database
php artisan migrate
php artisan db:seed

# Testing
php artisan test
php artisan test --filter=UserTest
```

## Testing

```php
// tests/Feature/UserTest.php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_users(): void
    {
        User::factory()->count(3)->create();

        $response = $this->getJson('/api/users');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_can_create_user(): void
    {
        $response = $this->postJson('/api/users', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'john@example.com']);
    }
}
```
