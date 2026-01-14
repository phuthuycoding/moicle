# Laravel Backend Structure

> Simple Domain + UseCase pattern for Laravel

## Project Structure

```
{project}/
├── app/
│   ├── Domain/                       # Business logic by feature
│   │   └── {Feature}/
│   │       ├── Entities/             # Value objects, DTOs
│   │       ├── Events/               # Domain events
│   │       ├── Exceptions/           # Feature-specific exceptions
│   │       ├── Listeners/            # Event listeners
│   │       └── UseCase/              # Action classes
│   │           ├── GetUserUseCase.php
│   │           ├── CreateUserUseCase.php
│   │           └── UpdateUserUseCase.php
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/                  # API controllers
│   │   │   └── Web/                  # Web controllers
│   │   ├── Middleware/
│   │   ├── Requests/                 # Form requests (validation)
│   │   └── Resources/                # API resources
│   ├── Models/                       # Eloquent models
│   ├── Services/                     # Shared services (cache, etc.)
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
├── CLAUDE.md
└── composer.json
```

## Architecture Pattern

```
Controller → UseCase → Model (Eloquent)
    ↓           ↓
Request    Services (optional: cache, external APIs)
```

**Simple flow:**
1. Controller receives request
2. Controller injects and calls UseCase
3. UseCase contains business logic
4. UseCase uses Eloquent Models directly
5. Controller returns response

## Domain Structure Example

```
app/Domain/
├── Story/
│   ├── Entities/
│   │   └── Story.php
│   ├── Events/
│   │   └── StoryCreated.php
│   ├── Exceptions/
│   │   ├── StoryNotFound.php
│   │   └── StoryContentException.php
│   ├── Listeners/
│   │   └── NotifyOnStoryCreated.php
│   └── UseCase/
│       ├── GetStoryBySlugUseCase.php
│       ├── GetAllStoriesUseCase.php
│       ├── CreateStoryUseCase.php
│       ├── UpdateStoryUseCase.php
│       └── DeleteStoryUseCase.php
├── User/
│   └── UseCase/
│       ├── GetUserUseCase.php
│       └── CreateUserUseCase.php
└── Shared/
    └── Payload/
        ├── Filter.php
        └── Sorter.php
```

## Key Files

### UseCase Example

```php
<?php
// app/Domain/Story/UseCase/GetStoryBySlugUseCase.php

namespace App\Domain\Story\UseCase;

use App\Domain\Story\Exceptions\StoryNotFound;
use App\Models\Story;
use App\Services\Cache\CacheService;

class GetStoryBySlugUseCase
{
    public function __construct(
        protected Story $story,
        protected CacheService $cacheService
    ) {}

    public function execute(string $slug): object
    {
        // Check cache first
        $cached = $this->cacheService->get("story:{$slug}");
        if ($cached) {
            return $cached;
        }

        // Query with Eloquent
        $story = $this->story->newQuery()
            ->select(['id', 'title', 'slug', 'description', 'author_id'])
            ->with(['genres:id,name,slug', 'author:id,name,slug'])
            ->where('slug', $slug)
            ->published()
            ->first();

        if (!$story) {
            throw new StoryNotFound("Story '{$slug}' not found");
        }

        // Cache result
        $this->cacheService->put("story:{$slug}", $story, 60 * 60);

        return $story;
    }
}
```

### Controller Example

```php
<?php
// app/Http/Controllers/Web/StoryController.php

namespace App\Http\Controllers\Web;

use App\Domain\Story\UseCase\GetStoryBySlugUseCase;
use App\Domain\Story\UseCase\GetAllStoriesUseCase;
use App\Domain\Story\Exceptions\StoryNotFound;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class StoryController extends Controller
{
    public function __construct(
        protected GetStoryBySlugUseCase $getStoryBySlugUseCase
    ) {}

    public function index(
        Request $request,
        GetAllStoriesUseCase $getAllStoriesUseCase
    ) {
        $filters = [
            'search' => $request->query('search'),
            'genre' => $request->query('genre'),
            'sort' => $request->query('sort', 'latest'),
        ];

        $stories = $getAllStoriesUseCase->execute($filters);

        return view('pages.story.index', compact('stories'));
    }

    public function show(string $slug)
    {
        try {
            $story = $this->getStoryBySlugUseCase->execute($slug);
            return view('pages.story.show', compact('story'));
        } catch (StoryNotFound $e) {
            abort(404);
        }
    }
}
```

### Exception Example

```php
<?php
// app/Domain/Story/Exceptions/StoryNotFound.php

namespace App\Domain\Story\Exceptions;

use Exception;

class StoryNotFound extends Exception
{
    //
}
```

### Shared Payload Example

```php
<?php
// app/Domain/Shared/Payload/Filter.php

namespace App\Domain\Shared\Payload;

class Filter
{
    public function __construct(
        public string $field,
        public string $operator,
        public mixed $value
    ) {}
}
```

## Conventions

| Item | Convention | Example |
|------|------------|---------|
| UseCase | PascalCase + UseCase | `GetStoryBySlugUseCase` |
| Controller | PascalCase + Controller | `StoryController` |
| Model | Singular PascalCase | `Story` |
| Exception | PascalCase | `StoryNotFound` |
| Event | PascalCase | `StoryCreated` |
| Request | PascalCase + Request | `StoreStoryRequest` |
| Resource | PascalCase + Resource | `StoryResource` |

## UseCase Naming

| Action | Naming Pattern | Example |
|--------|----------------|---------|
| Get single | `Get{Entity}ByXxxUseCase` | `GetStoryBySlugUseCase` |
| Get list | `Get{Entities}UseCase` | `GetAllStoriesUseCase` |
| Get filtered | `GetXxxUseCase` | `GetLatestStoriesUseCase` |
| Create | `Create{Entity}UseCase` | `CreateStoryUseCase` |
| Update | `Update{Entity}UseCase` | `UpdateStoryUseCase` |
| Delete | `Delete{Entity}UseCase` | `DeleteStoryUseCase` |
| Search | `Search{Entities}UseCase` | `SearchStoriesUseCase` |
| Action | `{Action}{Entity}UseCase` | `PublishStoryUseCase` |

## When to Create UseCase

**Create UseCase when:**
- Business logic is reusable across controllers
- Logic is complex (multiple model interactions)
- Logic needs caching, events, or validation
- Action is a distinct business operation

**Skip UseCase when:**
- Simple CRUD with no business logic
- Direct model query in controller is clearer

## Testing

```php
<?php
// tests/Unit/Domain/Story/GetStoryBySlugUseCaseTest.php

namespace Tests\Unit\Domain\Story;

use Tests\TestCase;
use App\Domain\Story\UseCase\GetStoryBySlugUseCase;
use App\Domain\Story\Exceptions\StoryNotFound;
use App\Models\Story;
use App\Services\Cache\CacheService;
use Mockery;

class GetStoryBySlugUseCaseTest extends TestCase
{
    public function test_returns_story_when_found(): void
    {
        $story = Story::factory()->create(['slug' => 'test-story']);
        $cacheService = Mockery::mock(CacheService::class);
        $cacheService->shouldReceive('get')->andReturn(null);
        $cacheService->shouldReceive('put');

        $useCase = new GetStoryBySlugUseCase(new Story(), $cacheService);
        $result = $useCase->execute('test-story');

        $this->assertEquals($story->id, $result->id);
    }

    public function test_throws_exception_when_not_found(): void
    {
        $this->expectException(StoryNotFound::class);

        $cacheService = Mockery::mock(CacheService::class);
        $cacheService->shouldReceive('get')->andReturn(null);

        $useCase = new GetStoryBySlugUseCase(new Story(), $cacheService);
        $useCase->execute('non-existent-slug');
    }
}
```
# Documentation

- When you create a new UseCase, make sure to document it in the project dir `docs/{domain}/{usecase}.md` file.
- The usecase spectation documentation flow UML or Cockburn