---
name: go-module
description: Generate complete Go module with Clean Architecture. Triggers: "generate go module", "scaffold go", "new go module"
---

# Go Module Generator

Generate complete Go module following Clean Architecture pattern.

## Usage

```bash
python scripts/module-generator.py --stack go --name <module_name> --fields "<fields>" --project <go_module_path> [--validators]
```

## Examples

```bash
# Basic CRUD
python scripts/module-generator.py \
  --stack go \
  --name product \
  --fields "name:string,description:*string,price:int64,status:string" \
  --project github.com/user/myapp

# With validators
python scripts/module-generator.py \
  --stack go \
  --name bank_account \
  --fields "user_id:string,bank_name:string,account_number:string,is_verified:bool" \
  --project github.com/user/myapp \
  --validators

# Optional fields (use ?)
python scripts/module-generator.py \
  --stack go \
  --name order \
  --fields "user_id:string,total:int64,status:string,note:string?" \
  --project github.com/user/myapp
```

## Field Types

| Type | Example |
|------|---------|
| `string` | `name:string` |
| `*string` | `description:*string` (nullable) |
| `int64` | `price:int64` |
| `int` | `count:int` |
| `bool` | `is_active:bool` |
| `float64` | `rate:float64` |

## Generated Structure

```
internal/modules/{module}/
├── controllers/{module}_controller.go
├── usecases/{module}_usecase.go
├── dtos/{module}_dto.go
├── validators/{module}_validator.go  # if --validators
└── init.go

pkg/database/{module}.go
```

## After Generation

1. Register in `cmd/api/router.go`:
```go
import "project/internal/modules/{module}"
{module}.Init(r, db, authMiddleware)
```

2. Add to `pkg/database/database.go`:
```go
db.AutoMigrate(&{Entity}{})
```
