# Laravel Backend Structure

> Domain-Driven Design (DDD) Architecture for Laravel

## Tech Stack

- PHP 8.2+, Laravel 11+
- Eloquent ORM
- PHPUnit / Pest for testing
- PHPStan for static analysis

## DDD Directory Structure

```
app/
├── Domain/
│   └── {Domain}/
│       ├── Entities/               # Business objects with behavior
│       │   └── {Entity}.php       # Static factory, state transitions
│       ├── ValueObjects/           # Immutable typed values
│       │   └── {VO}.php           # Status, Money, Email
│       ├── Ports/                  # Interfaces (contracts)
│       │   └── {StoreName}Port.php # Repository interface
│       ├── Events/                 # Domain events
│       │   └── {EventName}.php
│       ├── UseCases/               # Business logic
│       │   └── {Action}UseCase.php
│       └── Validators/             # Validation rules
│
├── Application/
│   ├── Http/
│   │   └── Controllers/
│   │       └── {Module}Controller.php
│   ├── Services/                   # Thin wrappers -> UseCases
│   │   └── {Module}Service.php
│   └── Listeners/                  # Event side-effects
│       └── On{EventName}Listener.php
│
├── Infrastructure/
│   ├── Repositories/               # Eloquent implementations
│   │   └── Eloquent{Entity}Repository.php
│   └── Adapters/                   # External services (payment, email, etc.)
│
├── Models/                         # Eloquent models (keep Laravel convention)
│
└── Providers/                      # Service providers for DI
```

### Supporting Directories

```
config/
database/
│   ├── factories/
│   ├── migrations/
│   └── seeders/
routes/
│   ├── api.php
│   └── web.php
tests/
│   ├── Unit/
│   │   └── Domain/
│   │       └── {Domain}/
│   └── Feature/
```

## Layer Rules

| Layer | Can Import | Cannot Import |
|-------|-----------|---------------|
| Domain | PHP stdlib, own domain | Eloquent, Request, Facades, Application, Infrastructure |
| Application | Domain, Laravel HTTP | Infrastructure (directly) |
| Infrastructure | Domain (Ports), Eloquent, external libs | Application |

**The Domain layer is pure PHP.** No framework dependencies allowed.

## Architecture Flow

```
Controller → Service → UseCase → Port (interface)
                                      ↑
                          Infrastructure implements Port
```

1. Controller receives HTTP request, delegates to Service
2. Service is a thin wrapper that calls UseCase
3. UseCase contains business logic, depends on Port interfaces
4. Infrastructure implements Port interfaces using Eloquent/external APIs
5. ServiceProvider wires Port interfaces to Infrastructure implementations

## Forbidden Imports in Domain Layer

These imports must NEVER appear in `app/Domain/`:

```
Illuminate\Database\*
Illuminate\Http\Request
Illuminate\Support\Facades\*
Illuminate\Cache\*
Illuminate\Queue\*
```

Domain classes depend only on:
- Other Domain classes (Entities, ValueObjects, Ports, Events)
- PHP native types and exceptions

## Domain Structure Example

```
app/Domain/
├── Story/
│   ├── Entities/
│   │   └── Story.php
│   ├── ValueObjects/
│   │   ├── StoryStatus.php
│   │   └── Slug.php
│   ├── Ports/
│   │   └── StoryStorePort.php
│   ├── Events/
│   │   └── StoryPublished.php
│   ├── UseCases/
│   │   ├── GetStoryBySlugUseCase.php
│   │   ├── GetAllStoriesUseCase.php
│   │   ├── CreateStoryUseCase.php
│   │   ├── UpdateStoryUseCase.php
│   │   ├── PublishStoryUseCase.php
│   │   └── DeleteStoryUseCase.php
│   └── Validators/
│       └── StoryValidator.php
├── User/
│   ├── Entities/
│   │   └── User.php
│   ├── Ports/
│   │   └── UserStorePort.php
│   └── UseCases/
│       ├── GetUserUseCase.php
│       └── CreateUserUseCase.php
└── Shared/
    └── ValueObjects/
        ├── Filter.php
        └── Sorter.php
```

## Key Files

### Port Interface

```php
<?php
// app/Domain/Story/Ports/StoryStorePort.php

namespace App\Domain\Story\Ports;

use App\Domain\Story\Entities\Story;

interface StoryStorePort
{
    public function findBySlug(string $slug): ?Story;
    public function findAll(array $filters = []): array;
    public function save(Story $story): Story;
    public function delete(string $id): void;
}
```

### Domain Entity

```php
<?php
// app/Domain/Story/Entities/Story.php

namespace App\Domain\Story\Entities;

use App\Domain\Story\ValueObjects\StoryStatus;
use App\Domain\Story\ValueObjects\Slug;

class Story
{
    private function __construct(
        public readonly ?string $id,
        public readonly string $title,
        public readonly Slug $slug,
        public readonly string $description,
        public readonly string $authorId,
        public StoryStatus $status,
    ) {}

    public static function create(
        string $title,
        string $description,
        string $authorId,
    ): self {
        return new self(
            id: null,
            title: $title,
            slug: Slug::fromString($title),
            description: $description,
            authorId: $authorId,
            status: StoryStatus::DRAFT,
        );
    }

    public function publish(): self
    {
        if ($this->status !== StoryStatus::DRAFT) {
            throw new \DomainException('Only draft stories can be published');
        }

        $this->status = StoryStatus::PUBLISHED;
        return $this;
    }
}
```

### Value Object

```php
<?php
// app/Domain/Story/ValueObjects/StoryStatus.php

namespace App\Domain\Story\ValueObjects;

enum StoryStatus: string
{
    case DRAFT = 'draft';
    case PUBLISHED = 'published';
    case ARCHIVED = 'archived';
}
```

### UseCase

```php
<?php
// app/Domain/Story/UseCases/GetStoryBySlugUseCase.php

namespace App\Domain\Story\UseCases;

use App\Domain\Story\Entities\Story;
use App\Domain\Story\Ports\StoryStorePort;

class GetStoryBySlugUseCase
{
    public function __construct(
        private StoryStorePort $storyStore,
    ) {}

    public function execute(string $slug): Story
    {
        $story = $this->storyStore->findBySlug($slug);

        if (!$story) {
            throw new \DomainException("Story '{$slug}' not found");
        }

        return $story;
    }
}
```

### Infrastructure Repository

```php
<?php
// app/Infrastructure/Repositories/EloquentStoryRepository.php

namespace App\Infrastructure\Repositories;

use App\Domain\Story\Entities\Story as StoryEntity;
use App\Domain\Story\Ports\StoryStorePort;
use App\Domain\Story\ValueObjects\StoryStatus;
use App\Domain\Story\ValueObjects\Slug;
use App\Models\Story;

class EloquentStoryRepository implements StoryStorePort
{
    public function findBySlug(string $slug): ?StoryEntity
    {
        $model = Story::query()
            ->where('slug', $slug)
            ->where('status', StoryStatus::PUBLISHED->value)
            ->first();

        if (!$model) {
            return null;
        }

        return $this->toEntity($model);
    }

    public function findAll(array $filters = []): array
    {
        $query = Story::query();

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->get()->map(fn ($m) => $this->toEntity($m))->all();
    }

    public function save(StoryEntity $story): StoryEntity
    {
        $model = Story::updateOrCreate(
            ['id' => $story->id],
            [
                'title' => $story->title,
                'slug' => $story->slug->value,
                'description' => $story->description,
                'author_id' => $story->authorId,
                'status' => $story->status->value,
            ]
        );

        return $this->toEntity($model);
    }

    public function delete(string $id): void
    {
        Story::destroy($id);
    }

    private function toEntity(Story $model): StoryEntity
    {
        // Map Eloquent model to domain entity
    }
}
```

### Application Controller

```php
<?php
// app/Application/Http/Controllers/StoryController.php

namespace App\Application\Http\Controllers;

use App\Domain\Story\UseCases\GetStoryBySlugUseCase;
use App\Domain\Story\UseCases\GetAllStoriesUseCase;
use Illuminate\Http\Request;

class StoryController extends Controller
{
    public function __construct(
        private GetStoryBySlugUseCase $getStoryBySlug,
        private GetAllStoriesUseCase $getAllStories,
    ) {}

    public function index(Request $request)
    {
        $filters = [
            'search' => $request->query('search'),
            'genre' => $request->query('genre'),
        ];

        $stories = $this->getAllStories->execute($filters);

        return view('pages.story.index', compact('stories'));
    }

    public function show(string $slug)
    {
        try {
            $story = $this->getStoryBySlug->execute($slug);
            return view('pages.story.show', compact('story'));
        } catch (\DomainException $e) {
            abort(404);
        }
    }
}
```

### Wiring: ServiceProvider

```php
<?php
// app/Providers/DomainServiceProvider.php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Domain\Story\Ports\StoryStorePort;
use App\Infrastructure\Repositories\EloquentStoryRepository;
use App\Domain\User\Ports\UserStorePort;
use App\Infrastructure\Repositories\EloquentUserRepository;

class DomainServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Bind port interfaces to infrastructure implementations
        $this->app->bind(StoryStorePort::class, EloquentStoryRepository::class);
        $this->app->bind(UserStorePort::class, EloquentUserRepository::class);
    }
}
```

## Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Entity | PascalCase | `Story`, `User` |
| ValueObject | PascalCase | `StoryStatus`, `Slug`, `Money` |
| Port | PascalCase + Port | `StoryStorePort` |
| UseCase | PascalCase + UseCase | `GetStoryBySlugUseCase` |
| Repository | Eloquent + Entity + Repository | `EloquentStoryRepository` |
| Controller | PascalCase + Controller | `StoryController` |
| Service | PascalCase + Service | `StoryService` |
| Listener | On + EventName + Listener | `OnStoryPublishedListener` |
| Event | PascalCase (past tense) | `StoryPublished` |
| Model | Singular PascalCase | `Story` |

## UseCase Naming

| Action | Naming Pattern | Example |
|--------|----------------|---------|
| Get single | `Get{Entity}ByXxxUseCase` | `GetStoryBySlugUseCase` |
| Get list | `GetAll{Entities}UseCase` | `GetAllStoriesUseCase` |
| Create | `Create{Entity}UseCase` | `CreateStoryUseCase` |
| Update | `Update{Entity}UseCase` | `UpdateStoryUseCase` |
| Delete | `Delete{Entity}UseCase` | `DeleteStoryUseCase` |
| Action | `{Action}{Entity}UseCase` | `PublishStoryUseCase` |
| Search | `Search{Entities}UseCase` | `SearchStoriesUseCase` |

## Hard Rules

1. Domain layer has ZERO framework imports
2. UseCases depend only on Ports, never on concrete repositories
3. Eloquent Models live in `app/Models/`, never in Domain
4. Infrastructure implements Domain Ports
5. Controllers never call repositories directly
6. Every Port must have at least one Infrastructure implementation
7. Domain Events carry only primitive data or ValueObjects
8. ValueObjects are always immutable

## Check Scripts

```bash
# Run tests
php artisan test

# Static analysis on domain layer
phpstan analyse app/Domain/ --level=max

# Verify no forbidden imports in domain
grep -rn "Illuminate\\\\Database\|Illuminate\\\\Http\\\\Request\|Illuminate\\\\Support\\\\Facades" app/Domain/
# Expected: no output (zero matches)

# Run full test suite
php artisan test --parallel
```

## Test Patterns

### Unit Test for UseCase (mock ports)

```php
<?php
// tests/Unit/Domain/Story/GetStoryBySlugUseCaseTest.php

namespace Tests\Unit\Domain\Story;

use PHPUnit\Framework\TestCase;
use App\Domain\Story\UseCases\GetStoryBySlugUseCase;
use App\Domain\Story\Ports\StoryStorePort;
use App\Domain\Story\Entities\Story;
use Mockery;

class GetStoryBySlugUseCaseTest extends TestCase
{
    public function test_returns_story_when_found(): void
    {
        $story = Story::create('Test Story', 'Description', 'author-1');

        $store = Mockery::mock(StoryStorePort::class);
        $store->shouldReceive('findBySlug')
            ->with('test-story')
            ->andReturn($story);

        $useCase = new GetStoryBySlugUseCase($store);
        $result = $useCase->execute('test-story');

        $this->assertEquals($story, $result);
    }

    public function test_throws_exception_when_not_found(): void
    {
        $this->expectException(\DomainException::class);

        $store = Mockery::mock(StoryStorePort::class);
        $store->shouldReceive('findBySlug')
            ->with('non-existent')
            ->andReturn(null);

        $useCase = new GetStoryBySlugUseCase($store);
        $useCase->execute('non-existent');
    }

    protected function tearDown(): void
    {
        Mockery::close();
    }
}
```

### Pest Alternative

```php
<?php
// tests/Unit/Domain/Story/PublishStoryUseCaseTest.php

use App\Domain\Story\Entities\Story;
use App\Domain\Story\ValueObjects\StoryStatus;

it('publishes a draft story', function () {
    $story = Story::create('Test', 'Desc', 'author-1');

    $story->publish();

    expect($story->status)->toBe(StoryStatus::PUBLISHED);
});

it('rejects publishing a non-draft story', function () {
    $story = Story::create('Test', 'Desc', 'author-1');
    $story->publish();

    $story->publish();
})->throws(\DomainException::class);
```

## Documentation

When creating a new UseCase, document it in `docs/{domain}/{usecase}.md` with:
- Purpose and business rule description
- Input/output specification
- UML sequence diagram or Cockburn use case format
