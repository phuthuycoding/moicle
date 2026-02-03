#!/usr/bin/env python3
"""
Universal Module Generator - Generates complete modules for multiple stacks

Supported stacks:
  - go        : Go + Gin + GORM (Clean Architecture)
  - laravel   : Laravel + PHP (Domain + UseCase pattern)
  - react     : React + TypeScript + Vite (MVVM pattern)
  - flutter   : Flutter + Dart + Riverpod (Feature-based)
  - remix     : Remix + React (Routes + Prisma pattern)

Usage:
    python module-generator.py --stack go --name product --fields "name:string,price:int64" --project myapp
    python module-generator.py --stack laravel --name Product --fields "name:string,price:integer"
    python module-generator.py --stack react --name Product --fields "name:string,price:number"
    python module-generator.py --stack flutter --name product --fields "name:String,price:int"
"""

import argparse
import os
import sys
from pathlib import Path
from abc import ABC, abstractmethod
from typing import List, Tuple, Dict, Any

# =============================================================================
# BASE GENERATOR
# =============================================================================

class BaseGenerator(ABC):
    """Base class for all stack generators"""

    def __init__(self, name: str, fields: str, project: str, output_dir: str, **options):
        self.module_name = name.lower()
        self.entity_name = self.to_pascal_case(name)
        self.project = project
        self.output_dir = Path(output_dir)
        self.options = options
        self.fields = self.parse_fields(fields)

    @staticmethod
    def to_pascal_case(name: str) -> str:
        return ''.join(word.capitalize() for word in name.replace('-', '_').split('_'))

    @staticmethod
    def to_camel_case(name: str) -> str:
        words = name.replace('-', '_').split('_')
        return words[0].lower() + ''.join(word.capitalize() for word in words[1:])

    @staticmethod
    def to_snake_case(name: str) -> str:
        return name.lower().replace('-', '_')

    @staticmethod
    def to_kebab_case(name: str) -> str:
        return name.lower().replace('_', '-')

    @staticmethod
    def pluralize(name: str) -> str:
        if name.endswith('y'):
            return name[:-1] + 'ies'
        elif name.endswith(('s', 'x', 'ch', 'sh')):
            return name + 'es'
        return name + 's'

    @abstractmethod
    def parse_fields(self, fields_str: str) -> List[Tuple[str, str, bool]]:
        """Parse fields string - returns [(name, type, required)]"""
        pass

    @abstractmethod
    def generate(self) -> List[str]:
        """Generate all files - returns list of created file paths"""
        pass

    def write_file(self, path: Path, content: str) -> str:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content)
        return str(path)


# =============================================================================
# GO GENERATOR
# =============================================================================

class GoGenerator(BaseGenerator):
    """Go + Gin + GORM generator"""

    def parse_fields(self, fields_str: str) -> List[Tuple[str, str, bool]]:
        fields = []
        for field in fields_str.split(','):
            field = field.strip()
            if not field:
                continue
            required = not field.endswith('?')
            field = field.rstrip('?')
            if ':' in field:
                name, go_type = field.split(':', 1)
            else:
                name, go_type = field, 'string'
            fields.append((name.strip(), go_type.strip(), required))
        return fields

    def _gorm_type(self, go_type: str) -> str:
        type_map = {
            'string': 'varchar(255)', '*string': 'varchar(255)',
            'int': 'int', 'int32': 'int', 'int64': 'bigint',
            '*int': 'int', '*int64': 'bigint',
            'float32': 'float', 'float64': 'double',
            'bool': 'boolean', '*bool': 'boolean',
            'time.Time': 'datetime',
        }
        return type_map.get(go_type, 'varchar(255)')

    def generate(self) -> List[str]:
        files = []
        module_dir = self.output_dir / 'internal' / 'modules' / self.module_name

        # Model
        files.append(self.write_file(
            self.output_dir / 'pkg' / 'database' / f'{self.module_name}.go',
            self._model_template()
        ))

        # DTOs
        files.append(self.write_file(
            module_dir / 'dtos' / f'{self.module_name}_dto.go',
            self._dto_template()
        ))

        # Usecase
        files.append(self.write_file(
            module_dir / 'usecases' / f'{self.module_name}_usecase.go',
            self._usecase_template()
        ))

        # Controller
        files.append(self.write_file(
            module_dir / 'controllers' / f'{self.module_name}_controller.go',
            self._controller_template()
        ))

        # Init
        files.append(self.write_file(
            module_dir / 'init.go',
            self._init_template()
        ))

        # Validators (optional)
        if self.options.get('validators'):
            files.append(self.write_file(
                module_dir / 'validators' / f'{self.module_name}_validator.go',
                self._validator_template()
            ))

        return files

    def _model_template(self) -> str:
        fields_str = '\n'.join([
            f'\t{self.to_pascal_case(n)} {t if r or t.startswith("*") else "*"+t} `gorm:"type:{self._gorm_type(t)}" json:"{n}"`'
            for n, t, r in self.fields
        ])
        return f'''package database

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type {self.entity_name} struct {{
	ID        string         `gorm:"type:char(36);primaryKey" json:"id"`
{fields_str}
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}}

func (e *{self.entity_name}) BeforeCreate(tx *gorm.DB) error {{
	if e.ID == "" {{
		e.ID = uuid.New().String()
	}}
	return nil
}}
'''

    def _dto_template(self) -> str:
        create_fields = '\n'.join([
            f'\t{self.to_pascal_case(n)} {t} `json:"{n}" binding:"{"required" if r else "omitempty"}"`'
            for n, t, r in self.fields
        ])
        update_fields = '\n'.join([
            f'\t{self.to_pascal_case(n)} *{t.lstrip("*")} `json:"{n}"`'
            for n, t, _ in self.fields
        ])
        response_fields = '\n'.join([
            f'\t{self.to_pascal_case(n)} {t if r or t.startswith("*") else "*"+t} `json:"{n}"`'
            for n, t, r in self.fields
        ])
        mappings = '\n'.join([f'\t\t{self.to_pascal_case(n)}: entity.{self.to_pascal_case(n)},' for n, _, _ in self.fields])

        return f'''package dtos

import "{self.project}/pkg/database"

type Create{self.entity_name}Request struct {{
{create_fields}
}}

type Update{self.entity_name}Request struct {{
{update_fields}
}}

type List{self.entity_name}Request struct {{
	Page    int    `form:"page" binding:"omitempty,min=1"`
	PerPage int    `form:"per_page" binding:"omitempty,min=1,max=100"`
	Search  string `form:"search"`
}}

type {self.entity_name}Response struct {{
	ID        string `json:"id"`
{response_fields}
	CreatedAt string `json:"created_at"`
}}

type {self.entity_name}ListResponse struct {{
	Items      []*{self.entity_name}Response `json:"items"`
	Page       int                           `json:"page"`
	PerPage    int                           `json:"per_page"`
	Total      int64                         `json:"total"`
	TotalPages int                           `json:"total_pages"`
}}

func To{self.entity_name}Response(entity *database.{self.entity_name}) *{self.entity_name}Response {{
	return &{self.entity_name}Response{{
		ID:        entity.ID,
{mappings}
		CreatedAt: entity.CreatedAt.Format("2006-01-02T15:04:05Z"),
	}}
}}

func To{self.entity_name}ListResponse(entities []*database.{self.entity_name}, page, perPage int, total int64) *{self.entity_name}ListResponse {{
	items := make([]*{self.entity_name}Response, len(entities))
	for i, e := range entities {{
		items[i] = To{self.entity_name}Response(e)
	}}
	totalPages := int(total) / perPage
	if int(total)%perPage > 0 {{
		totalPages++
	}}
	return &{self.entity_name}ListResponse{{Items: items, Page: page, PerPage: perPage, Total: total, TotalPages: totalPages}}
}}
'''

    def _usecase_template(self) -> str:
        search_field = next((n for n, t, _ in self.fields if t == 'string' and not n.endswith('_id')), 'name')
        create_map = '\n'.join([f'\t\t{self.to_pascal_case(n)}: req.{self.to_pascal_case(n)},' for n, _, _ in self.fields])
        update_map = '\n'.join([
            f'\tif req.{self.to_pascal_case(n)} != nil {{\n\t\tupdates["{n}"] = *req.{self.to_pascal_case(n)}\n\t}}'
            for n, _, _ in self.fields
        ])

        return f'''package usecases

import (
	"context"

	"gorm.io/gorm"

	"{self.project}/internal/modules/{self.module_name}/dtos"
	"{self.project}/pkg/database"
)

type {self.entity_name}Usecase struct {{
	db *gorm.DB
}}

func New{self.entity_name}Usecase(db *gorm.DB) *{self.entity_name}Usecase {{
	return &{self.entity_name}Usecase{{db: db}}
}}

func (u *{self.entity_name}Usecase) Create(ctx context.Context, req *dtos.Create{self.entity_name}Request) (*database.{self.entity_name}, error) {{
	entity := &database.{self.entity_name}{{
{create_map}
	}}
	if err := u.db.WithContext(ctx).Create(entity).Error; err != nil {{
		return nil, err
	}}
	return entity, nil
}}

func (u *{self.entity_name}Usecase) GetByID(ctx context.Context, id string) (*database.{self.entity_name}, error) {{
	var entity database.{self.entity_name}
	if err := u.db.WithContext(ctx).First(&entity, "id = ?", id).Error; err != nil {{
		return nil, err
	}}
	return &entity, nil
}}

func (u *{self.entity_name}Usecase) Update(ctx context.Context, id string, req *dtos.Update{self.entity_name}Request) (*database.{self.entity_name}, error) {{
	var entity database.{self.entity_name}
	if err := u.db.WithContext(ctx).First(&entity, "id = ?", id).Error; err != nil {{
		return nil, err
	}}
	updates := map[string]interface{{}}{{}}
{update_map}
	if len(updates) > 0 {{
		if err := u.db.WithContext(ctx).Model(&entity).Updates(updates).Error; err != nil {{
			return nil, err
		}}
	}}
	return &entity, nil
}}

func (u *{self.entity_name}Usecase) Delete(ctx context.Context, id string) error {{
	return u.db.WithContext(ctx).Delete(&database.{self.entity_name}{{}}, "id = ?", id).Error
}}

func (u *{self.entity_name}Usecase) List(ctx context.Context, req *dtos.List{self.entity_name}Request) ([]*database.{self.entity_name}, int64, error) {{
	var entities []*database.{self.entity_name}
	var total int64
	query := u.db.WithContext(ctx).Model(&database.{self.entity_name}{{}})
	if req.Search != "" {{
		query = query.Where("{search_field} LIKE ?", "%"+req.Search+"%")
	}}
	if err := query.Count(&total).Error; err != nil {{
		return nil, 0, err
	}}
	page, perPage := req.Page, req.PerPage
	if page < 1 {{ page = 1 }}
	if perPage < 1 {{ perPage = 20 }}
	offset := (page - 1) * perPage
	if err := query.Offset(offset).Limit(perPage).Order("created_at DESC").Find(&entities).Error; err != nil {{
		return nil, 0, err
	}}
	return entities, total, nil
}}
'''

    def _controller_template(self) -> str:
        return f'''package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"{self.project}/internal/modules/{self.module_name}/dtos"
	"{self.project}/internal/modules/{self.module_name}/usecases"
	"{self.project}/pkg/response"
)

type {self.entity_name}Controller struct {{
	usecase *usecases.{self.entity_name}Usecase
}}

func New{self.entity_name}Controller(usecase *usecases.{self.entity_name}Usecase) *{self.entity_name}Controller {{
	return &{self.entity_name}Controller{{usecase: usecase}}
}}

func (c *{self.entity_name}Controller) Create(ctx *gin.Context) {{
	var req dtos.Create{self.entity_name}Request
	if err := ctx.ShouldBindJSON(&req); err != nil {{
		response.Error(ctx, http.StatusBadRequest, "Invalid request: "+err.Error())
		return
	}}
	entity, err := c.usecase.Create(ctx, &req)
	if err != nil {{
		response.Error(ctx, http.StatusInternalServerError, err.Error())
		return
	}}
	response.Created(ctx, dtos.To{self.entity_name}Response(entity))
}}

func (c *{self.entity_name}Controller) GetByID(ctx *gin.Context) {{
	id := ctx.Param("id")
	entity, err := c.usecase.GetByID(ctx, id)
	if err != nil {{
		response.Error(ctx, http.StatusNotFound, "{self.entity_name} not found")
		return
	}}
	response.Success(ctx, dtos.To{self.entity_name}Response(entity))
}}

func (c *{self.entity_name}Controller) Update(ctx *gin.Context) {{
	id := ctx.Param("id")
	var req dtos.Update{self.entity_name}Request
	if err := ctx.ShouldBindJSON(&req); err != nil {{
		response.Error(ctx, http.StatusBadRequest, "Invalid request: "+err.Error())
		return
	}}
	entity, err := c.usecase.Update(ctx, id, &req)
	if err != nil {{
		response.Error(ctx, http.StatusInternalServerError, err.Error())
		return
	}}
	response.Success(ctx, dtos.To{self.entity_name}Response(entity))
}}

func (c *{self.entity_name}Controller) Delete(ctx *gin.Context) {{
	id := ctx.Param("id")
	if err := c.usecase.Delete(ctx, id); err != nil {{
		response.Error(ctx, http.StatusInternalServerError, err.Error())
		return
	}}
	response.Success(ctx, gin.H{{"deleted": true}})
}}

func (c *{self.entity_name}Controller) List(ctx *gin.Context) {{
	var req dtos.List{self.entity_name}Request
	if err := ctx.ShouldBindQuery(&req); err != nil {{
		response.Error(ctx, http.StatusBadRequest, "Invalid request: "+err.Error())
		return
	}}
	entities, total, err := c.usecase.List(ctx, &req)
	if err != nil {{
		response.Error(ctx, http.StatusInternalServerError, err.Error())
		return
	}}
	page, perPage := req.Page, req.PerPage
	if page < 1 {{ page = 1 }}
	if perPage < 1 {{ perPage = 20 }}
	response.Success(ctx, dtos.To{self.entity_name}ListResponse(entities, page, perPage, total))
}}
'''

    def _init_template(self) -> str:
        route = self.to_kebab_case(self.pluralize(self.module_name))
        return f'''package {self.module_name}

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"{self.project}/internal/middleware"
	"{self.project}/internal/modules/{self.module_name}/controllers"
	"{self.project}/internal/modules/{self.module_name}/usecases"
)

func Init(r *gin.Engine, db *gorm.DB, authMiddleware *middleware.AuthMiddleware) {{
	usecase := usecases.New{self.entity_name}Usecase(db)
	controller := controllers.New{self.entity_name}Controller(usecase)

	group := r.Group("/{route}")
	group.Use(authMiddleware.Authenticate())
	{{
		group.POST("", controller.Create)
		group.GET("", controller.List)
		group.GET("/:id", controller.GetByID)
		group.PUT("/:id", controller.Update)
		group.DELETE("/:id", controller.Delete)
	}}
}}
'''

    def _validator_template(self) -> str:
        return f'''package validators

import (
	"context"
	"errors"

	"gorm.io/gorm"

	"{self.project}/pkg/database"
)

type Validator interface {{
	Validate(ctx context.Context, data interface{{}}) error
}}

type ValidatorChain struct {{
	validators []Validator
}}

func NewValidatorChain() *ValidatorChain {{
	return &ValidatorChain{{validators: make([]Validator, 0)}}
}}

func (c *ValidatorChain) Add(v Validator) *ValidatorChain {{
	c.validators = append(c.validators, v)
	return c
}}

func (c *ValidatorChain) Validate(ctx context.Context, data interface{{}}) error {{
	for _, v := range c.validators {{
		if err := v.Validate(ctx, data); err != nil {{
			return err
		}}
	}}
	return nil
}}

type ExistsValidator struct {{
	db *gorm.DB
}}

func NewExistsValidator(db *gorm.DB) *ExistsValidator {{
	return &ExistsValidator{{db: db}}
}}

func (v *ExistsValidator) Validate(ctx context.Context, data interface{{}}) error {{
	id := data.(string)
	var entity database.{self.entity_name}
	if err := v.db.WithContext(ctx).First(&entity, "id = ?", id).Error; err != nil {{
		return errors.New("{self.module_name} not found")
	}}
	return nil
}}
'''


# =============================================================================
# LARAVEL GENERATOR
# =============================================================================

class LaravelGenerator(BaseGenerator):
    """Laravel + PHP generator (Domain + UseCase pattern)"""

    def parse_fields(self, fields_str: str) -> List[Tuple[str, str, bool]]:
        fields = []
        for field in fields_str.split(','):
            field = field.strip()
            if not field:
                continue
            required = not field.endswith('?')
            field = field.rstrip('?')
            if ':' in field:
                name, php_type = field.split(':', 1)
            else:
                name, php_type = field, 'string'
            fields.append((name.strip(), php_type.strip(), required))
        return fields

    def _migration_type(self, php_type: str) -> str:
        type_map = {
            'string': 'string', 'text': 'text', 'integer': 'integer',
            'bigInteger': 'bigInteger', 'float': 'float', 'double': 'double',
            'decimal': 'decimal', 'boolean': 'boolean', 'date': 'date',
            'datetime': 'dateTime', 'timestamp': 'timestamp', 'json': 'json',
        }
        return type_map.get(php_type, 'string')

    def generate(self) -> List[str]:
        files = []

        # Model
        files.append(self.write_file(
            self.output_dir / 'app' / 'Models' / f'{self.entity_name}.php',
            self._model_template()
        ))

        # Migration
        files.append(self.write_file(
            self.output_dir / 'database' / 'migrations' / f'create_{self.pluralize(self.module_name)}_table.php',
            self._migration_template()
        ))

        # Controller
        files.append(self.write_file(
            self.output_dir / 'app' / 'Http' / 'Controllers' / f'{self.entity_name}Controller.php',
            self._controller_template()
        ))

        # Request
        files.append(self.write_file(
            self.output_dir / 'app' / 'Http' / 'Requests' / f'{self.entity_name}Request.php',
            self._request_template()
        ))

        # Resource
        files.append(self.write_file(
            self.output_dir / 'app' / 'Http' / 'Resources' / f'{self.entity_name}Resource.php',
            self._resource_template()
        ))

        # UseCase
        files.append(self.write_file(
            self.output_dir / 'app' / 'UseCases' / self.entity_name / f'Create{self.entity_name}UseCase.php',
            self._create_usecase_template()
        ))
        files.append(self.write_file(
            self.output_dir / 'app' / 'UseCases' / self.entity_name / f'Update{self.entity_name}UseCase.php',
            self._update_usecase_template()
        ))
        files.append(self.write_file(
            self.output_dir / 'app' / 'UseCases' / self.entity_name / f'Delete{self.entity_name}UseCase.php',
            self._delete_usecase_template()
        ))

        return files

    def _model_template(self) -> str:
        fillable = ', '.join([f"'{n}'" for n, _, _ in self.fields])
        casts = ', '.join([f"'{n}' => '{t}'" for n, t, _ in self.fields if t in ('boolean', 'integer', 'float', 'array', 'json')])

        return f'''<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\SoftDeletes;

class {self.entity_name} extends Model
{{
    use HasFactory, SoftDeletes;

    protected $fillable = [{fillable}];

    protected $casts = [{casts}];
}}
'''

    def _migration_template(self) -> str:
        table = self.pluralize(self.module_name)
        columns = '\n'.join([
            f"            $table->{self._migration_type(t)}('{n}'){'' if r else '->nullable()'};"
            for n, t, r in self.fields
        ])

        return f'''<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{{
    public function up(): void
    {{
        Schema::create('{table}', function (Blueprint $table) {{
            $table->uuid('id')->primary();
{columns}
            $table->timestamps();
            $table->softDeletes();
        }});
    }}

    public function down(): void
    {{
        Schema::dropIfExists('{table}');
    }}
}};
'''

    def _controller_template(self) -> str:
        return f'''<?php

namespace App\\Http\\Controllers;

use App\\Http\\Requests\\{self.entity_name}Request;
use App\\Http\\Resources\\{self.entity_name}Resource;
use App\\Models\\{self.entity_name};
use App\\UseCases\\{self.entity_name}\\Create{self.entity_name}UseCase;
use App\\UseCases\\{self.entity_name}\\Update{self.entity_name}UseCase;
use App\\UseCases\\{self.entity_name}\\Delete{self.entity_name}UseCase;
use Illuminate\\Http\\Request;
use Illuminate\\Http\\Resources\\Json\\AnonymousResourceCollection;

class {self.entity_name}Controller extends Controller
{{
    public function index(Request $request): AnonymousResourceCollection
    {{
        $query = {self.entity_name}::query();

        if ($request->has('search')) {{
            $query->where('name', 'like', '%' . $request->search . '%');
        }}

        $items = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return {self.entity_name}Resource::collection($items);
    }}

    public function show({self.entity_name} ${self.to_camel_case(self.module_name)}): {self.entity_name}Resource
    {{
        return new {self.entity_name}Resource(${self.to_camel_case(self.module_name)});
    }}

    public function store({self.entity_name}Request $request, Create{self.entity_name}UseCase $useCase): {self.entity_name}Resource
    {{
        $item = $useCase->execute($request->validated());
        return new {self.entity_name}Resource($item);
    }}

    public function update({self.entity_name}Request $request, {self.entity_name} ${self.to_camel_case(self.module_name)}, Update{self.entity_name}UseCase $useCase): {self.entity_name}Resource
    {{
        $item = $useCase->execute(${self.to_camel_case(self.module_name)}, $request->validated());
        return new {self.entity_name}Resource($item);
    }}

    public function destroy({self.entity_name} ${self.to_camel_case(self.module_name)}, Delete{self.entity_name}UseCase $useCase): \\Illuminate\\Http\\JsonResponse
    {{
        $useCase->execute(${self.to_camel_case(self.module_name)});
        return response()->json(['deleted' => true]);
    }}
}}
'''

    def _request_template(self) -> str:
        rules = '\n'.join([
            f"            '{n}' => ['{('required' if r else 'nullable')}', '{t}'],"
            for n, t, r in self.fields
        ])

        return f'''<?php

namespace App\\Http\\Requests;

use Illuminate\\Foundation\\Http\\FormRequest;

class {self.entity_name}Request extends FormRequest
{{
    public function authorize(): bool
    {{
        return true;
    }}

    public function rules(): array
    {{
        return [
{rules}
        ];
    }}
}}
'''

    def _resource_template(self) -> str:
        fields = '\n'.join([f"            '{n}' => $this->{n}," for n, _, _ in self.fields])

        return f'''<?php

namespace App\\Http\\Resources;

use Illuminate\\Http\\Request;
use Illuminate\\Http\\Resources\\Json\\JsonResource;

class {self.entity_name}Resource extends JsonResource
{{
    public function toArray(Request $request): array
    {{
        return [
            'id' => $this->id,
{fields}
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }}
}}
'''

    def _create_usecase_template(self) -> str:
        return f'''<?php

namespace App\\UseCases\\{self.entity_name};

use App\\Models\\{self.entity_name};

class Create{self.entity_name}UseCase
{{
    public function execute(array $data): {self.entity_name}
    {{
        return {self.entity_name}::create($data);
    }}
}}
'''

    def _update_usecase_template(self) -> str:
        return f'''<?php

namespace App\\UseCases\\{self.entity_name};

use App\\Models\\{self.entity_name};

class Update{self.entity_name}UseCase
{{
    public function execute({self.entity_name} $item, array $data): {self.entity_name}
    {{
        $item->update($data);
        return $item->fresh();
    }}
}}
'''

    def _delete_usecase_template(self) -> str:
        return f'''<?php

namespace App\\UseCases\\{self.entity_name};

use App\\Models\\{self.entity_name};

class Delete{self.entity_name}UseCase
{{
    public function execute({self.entity_name} $item): bool
    {{
        return $item->delete();
    }}
}}
'''


# =============================================================================
# REACT GENERATOR
# =============================================================================

class ReactGenerator(BaseGenerator):
    """React + TypeScript + Vite generator (MVVM pattern)"""

    def parse_fields(self, fields_str: str) -> List[Tuple[str, str, bool]]:
        fields = []
        for field in fields_str.split(','):
            field = field.strip()
            if not field:
                continue
            required = not field.endswith('?')
            field = field.rstrip('?')
            if ':' in field:
                name, ts_type = field.split(':', 1)
            else:
                name, ts_type = field, 'string'
            fields.append((name.strip(), ts_type.strip(), required))
        return fields

    def generate(self) -> List[str]:
        files = []
        feature_dir = self.output_dir / 'src' / 'features' / self.module_name

        # Types
        files.append(self.write_file(
            feature_dir / 'types.ts',
            self._types_template()
        ))

        # API
        files.append(self.write_file(
            feature_dir / 'api.ts',
            self._api_template()
        ))

        # Hooks
        files.append(self.write_file(
            feature_dir / 'hooks.ts',
            self._hooks_template()
        ))

        # Components
        files.append(self.write_file(
            feature_dir / 'components' / f'{self.entity_name}List.tsx',
            self._list_component_template()
        ))
        files.append(self.write_file(
            feature_dir / 'components' / f'{self.entity_name}Form.tsx',
            self._form_component_template()
        ))

        # Index
        files.append(self.write_file(
            feature_dir / 'index.ts',
            self._index_template()
        ))

        return files

    def _types_template(self) -> str:
        fields = '\n'.join([f"  {n}{'?' if not r else ''}: {t};" for n, t, r in self.fields])
        create_fields = '\n'.join([f"  {n}{'?' if not r else ''}: {t};" for n, t, r in self.fields])
        update_fields = '\n'.join([f"  {n}?: {t};" for n, t, _ in self.fields])

        return f'''export interface {self.entity_name} {{
  id: string;
{fields}
  createdAt: string;
  updatedAt: string;
}}

export interface Create{self.entity_name}Request {{
{create_fields}
}}

export interface Update{self.entity_name}Request {{
{update_fields}
}}

export interface {self.entity_name}ListParams {{
  page?: number;
  perPage?: number;
  search?: string;
}}

export interface {self.entity_name}ListResponse {{
  items: {self.entity_name}[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}}
'''

    def _api_template(self) -> str:
        route = self.to_kebab_case(self.pluralize(self.module_name))
        return f'''import {{ apiClient }} from '@/lib/api';
import type {{
  {self.entity_name},
  Create{self.entity_name}Request,
  Update{self.entity_name}Request,
  {self.entity_name}ListParams,
  {self.entity_name}ListResponse,
}} from './types';

const BASE_URL = '/{route}';

export const {self.to_camel_case(self.module_name)}Api = {{
  list: (params?: {self.entity_name}ListParams) =>
    apiClient.get<{self.entity_name}ListResponse>(BASE_URL, {{ params }}),

  get: (id: string) =>
    apiClient.get<{self.entity_name}>(`${{BASE_URL}}/${{id}}`),

  create: (data: Create{self.entity_name}Request) =>
    apiClient.post<{self.entity_name}>(BASE_URL, data),

  update: (id: string, data: Update{self.entity_name}Request) =>
    apiClient.put<{self.entity_name}>(`${{BASE_URL}}/${{id}}`, data),

  delete: (id: string) =>
    apiClient.delete(`${{BASE_URL}}/${{id}}`),
}};
'''

    def _hooks_template(self) -> str:
        return f'''import {{ useQuery, useMutation, useQueryClient }} from '@tanstack/react-query';
import {{ {self.to_camel_case(self.module_name)}Api }} from './api';
import type {{
  Create{self.entity_name}Request,
  Update{self.entity_name}Request,
  {self.entity_name}ListParams,
}} from './types';

const QUERY_KEY = '{self.pluralize(self.module_name)}';

export function use{self.entity_name}List(params?: {self.entity_name}ListParams) {{
  return useQuery({{
    queryKey: [QUERY_KEY, params],
    queryFn: () => {self.to_camel_case(self.module_name)}Api.list(params),
  }});
}}

export function use{self.entity_name}(id: string) {{
  return useQuery({{
    queryKey: [QUERY_KEY, id],
    queryFn: () => {self.to_camel_case(self.module_name)}Api.get(id),
    enabled: !!id,
  }});
}}

export function useCreate{self.entity_name}() {{
  const queryClient = useQueryClient();
  return useMutation({{
    mutationFn: (data: Create{self.entity_name}Request) => {self.to_camel_case(self.module_name)}Api.create(data),
    onSuccess: () => queryClient.invalidateQueries({{ queryKey: [QUERY_KEY] }}),
  }});
}}

export function useUpdate{self.entity_name}() {{
  const queryClient = useQueryClient();
  return useMutation({{
    mutationFn: ({{ id, data }}: {{ id: string; data: Update{self.entity_name}Request }}) =>
      {self.to_camel_case(self.module_name)}Api.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({{ queryKey: [QUERY_KEY] }}),
  }});
}}

export function useDelete{self.entity_name}() {{
  const queryClient = useQueryClient();
  return useMutation({{
    mutationFn: (id: string) => {self.to_camel_case(self.module_name)}Api.delete(id),
    onSuccess: () => queryClient.invalidateQueries({{ queryKey: [QUERY_KEY] }}),
  }});
}}
'''

    def _list_component_template(self) -> str:
        return f'''import {{ use{self.entity_name}List, useDelete{self.entity_name} }} from '../hooks';
import type {{ {self.entity_name} }} from '../types';

export function {self.entity_name}List() {{
  const {{ data, isLoading, error }} = use{self.entity_name}List();
  const deleteMutation = useDelete{self.entity_name}();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {{error.message}}</div>;

  const handleDelete = (id: string) => {{
    if (confirm('Are you sure?')) {{
      deleteMutation.mutate(id);
    }}
  }};

  return (
    <div>
      <h1>{self.entity_name} List</h1>
      <ul>
        {{data?.items.map((item: {self.entity_name}) => (
          <li key={{item.id}}>
            {{JSON.stringify(item)}}
            <button onClick={{() => handleDelete(item.id)}}>Delete</button>
          </li>
        ))}}
      </ul>
    </div>
  );
}}
'''

    def _form_component_template(self) -> str:
        fields = '\n'.join([
            f'''      <input
        name="{n}"
        placeholder="{self.to_pascal_case(n)}"
        {'required' if r else ''}
      />'''
            for n, t, r in self.fields
        ])

        return f'''import {{ useCreate{self.entity_name} }} from '../hooks';
import type {{ Create{self.entity_name}Request }} from '../types';

export function {self.entity_name}Form() {{
  const createMutation = useCreate{self.entity_name}();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {{
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData) as unknown as Create{self.entity_name}Request;
    createMutation.mutate(data);
  }};

  return (
    <form onSubmit={{handleSubmit}}>
{fields}
      <button type="submit" disabled={{createMutation.isPending}}>
        {{createMutation.isPending ? 'Creating...' : 'Create'}}
      </button>
    </form>
  );
}}
'''

    def _index_template(self) -> str:
        return f'''export * from './types';
export * from './api';
export * from './hooks';
export * from './components/{self.entity_name}List';
export * from './components/{self.entity_name}Form';
'''


# =============================================================================
# FLUTTER GENERATOR
# =============================================================================

class FlutterGenerator(BaseGenerator):
    """Flutter + Dart + Riverpod generator (Feature-based)"""

    def parse_fields(self, fields_str: str) -> List[Tuple[str, str, bool]]:
        fields = []
        for field in fields_str.split(','):
            field = field.strip()
            if not field:
                continue
            required = not field.endswith('?')
            field = field.rstrip('?')
            if ':' in field:
                name, dart_type = field.split(':', 1)
            else:
                name, dart_type = field, 'String'
            fields.append((name.strip(), dart_type.strip(), required))
        return fields

    def generate(self) -> List[str]:
        files = []
        feature_dir = self.output_dir / 'lib' / 'features' / self.module_name

        # Model
        files.append(self.write_file(
            feature_dir / 'data' / 'models' / f'{self.module_name}_model.dart',
            self._model_template()
        ))

        # Repository
        files.append(self.write_file(
            feature_dir / 'data' / 'repositories' / f'{self.module_name}_repository.dart',
            self._repository_template()
        ))

        # Provider
        files.append(self.write_file(
            feature_dir / 'presentation' / 'providers' / f'{self.module_name}_provider.dart',
            self._provider_template()
        ))

        # Screen
        files.append(self.write_file(
            feature_dir / 'presentation' / 'screens' / f'{self.module_name}_list_screen.dart',
            self._screen_template()
        ))

        return files

    def _model_template(self) -> str:
        fields = '\n'.join([
            f"  final {t}{'?' if not r else ''} {self.to_camel_case(n)};"
            for n, t, r in self.fields
        ])
        constructor_params = ', '.join([
            f"{'required ' if r else ''}this.{self.to_camel_case(n)}"
            for n, _, r in self.fields
        ])
        from_json = '\n'.join([
            f"      {self.to_camel_case(n)}: json['{n}'] as {t}{'?' if not r else ''},"
            for n, t, r in self.fields
        ])
        to_json = '\n'.join([
            f"      '{n}': {self.to_camel_case(n)},"
            for n, _, _ in self.fields
        ])

        return f'''import 'package:freezed_annotation/freezed_annotation.dart';

part '{self.module_name}_model.freezed.dart';
part '{self.module_name}_model.g.dart';

@freezed
class {self.entity_name} with _${self.entity_name} {{
  const factory {self.entity_name}({{
    required String id,
    {constructor_params},
    required DateTime createdAt,
    required DateTime updatedAt,
  }}) = _{self.entity_name};

  factory {self.entity_name}.fromJson(Map<String, dynamic> json) => _${self.entity_name}FromJson(json);
}}

@freezed
class Create{self.entity_name}Request with _$Create{self.entity_name}Request {{
  const factory Create{self.entity_name}Request({{
    {constructor_params},
  }}) = _Create{self.entity_name}Request;

  factory Create{self.entity_name}Request.fromJson(Map<String, dynamic> json) =>
      _$Create{self.entity_name}RequestFromJson(json);
}}
'''

    def _repository_template(self) -> str:
        route = self.to_kebab_case(self.pluralize(self.module_name))
        return f'''import 'package:dio/dio.dart';
import '../models/{self.module_name}_model.dart';

class {self.entity_name}Repository {{
  final Dio _dio;

  {self.entity_name}Repository(this._dio);

  Future<List<{self.entity_name}>> getAll() async {{
    final response = await _dio.get('/{route}');
    final items = response.data['items'] as List;
    return items.map((e) => {self.entity_name}.fromJson(e)).toList();
  }}

  Future<{self.entity_name}> getById(String id) async {{
    final response = await _dio.get('/{route}/$id');
    return {self.entity_name}.fromJson(response.data);
  }}

  Future<{self.entity_name}> create(Create{self.entity_name}Request request) async {{
    final response = await _dio.post('/{route}', data: request.toJson());
    return {self.entity_name}.fromJson(response.data);
  }}

  Future<{self.entity_name}> update(String id, Map<String, dynamic> data) async {{
    final response = await _dio.put('/{route}/$id', data: data);
    return {self.entity_name}.fromJson(response.data);
  }}

  Future<void> delete(String id) async {{
    await _dio.delete('/{route}/$id');
  }}
}}
'''

    def _provider_template(self) -> str:
        return f'''import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/models/{self.module_name}_model.dart';
import '../data/repositories/{self.module_name}_repository.dart';

final {self.to_camel_case(self.module_name)}RepositoryProvider = Provider<{self.entity_name}Repository>((ref) {{
  throw UnimplementedError('Provide Dio instance');
}});

final {self.to_camel_case(self.module_name)}ListProvider = FutureProvider<List<{self.entity_name}>>((ref) async {{
  final repository = ref.watch({self.to_camel_case(self.module_name)}RepositoryProvider);
  return repository.getAll();
}});

final {self.to_camel_case(self.module_name)}Provider = FutureProvider.family<{self.entity_name}, String>((ref, id) async {{
  final repository = ref.watch({self.to_camel_case(self.module_name)}RepositoryProvider);
  return repository.getById(id);
}});
'''

    def _screen_template(self) -> str:
        return f'''import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/{self.module_name}_provider.dart';

class {self.entity_name}ListScreen extends ConsumerWidget {{
  const {self.entity_name}ListScreen({{super.key}});

  @override
  Widget build(BuildContext context, WidgetRef ref) {{
    final itemsAsync = ref.watch({self.to_camel_case(self.module_name)}ListProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('{self.entity_name} List')),
      body: itemsAsync.when(
        data: (items) => ListView.builder(
          itemCount: items.length,
          itemBuilder: (context, index) {{
            final item = items[index];
            return ListTile(
              title: Text(item.id),
              subtitle: Text(item.createdAt.toString()),
            );
          }},
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text('Error: $error')),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {{
          // Navigate to create screen
        }},
        child: const Icon(Icons.add),
      ),
    );
  }}
}}
'''


# =============================================================================
# MAIN
# =============================================================================

GENERATORS = {
    'go': GoGenerator,
    'laravel': LaravelGenerator,
    'react': ReactGenerator,
    'flutter': FlutterGenerator,
}

def main():
    parser = argparse.ArgumentParser(
        description='Universal Module Generator',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  Go:      python module-generator.py --stack go --name product --fields "name:string,price:int64" --project github.com/user/app
  Laravel: python module-generator.py --stack laravel --name Product --fields "name:string,price:integer"
  React:   python module-generator.py --stack react --name product --fields "name:string,price:number"
  Flutter: python module-generator.py --stack flutter --name product --fields "name:String,price:int"
        '''
    )
    parser.add_argument('--stack', '-s', required=True, choices=GENERATORS.keys(), help='Target stack')
    parser.add_argument('--name', '-n', required=True, help='Module/entity name')
    parser.add_argument('--fields', '-f', required=True, help='Fields (name:type,name:type?)')
    parser.add_argument('--project', '-p', default='', help='Project path (Go module path, etc.)')
    parser.add_argument('--output', '-o', default='.', help='Output directory')
    parser.add_argument('--validators', '-v', action='store_true', help='Generate validators (Go only)')

    args = parser.parse_args()

    generator_class = GENERATORS[args.stack]
    generator = generator_class(
        name=args.name,
        fields=args.fields,
        project=args.project,
        output_dir=args.output,
        validators=args.validators,
    )

    files = generator.generate()

    print(f"✅ Generated {len(files)} files for {args.stack}/{args.name}:")
    for f in files:
        print(f"   - {f}")

if __name__ == '__main__':
    main()
