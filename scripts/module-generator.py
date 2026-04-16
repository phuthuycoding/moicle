#!/usr/bin/env python3
"""
Universal Module Generator - Generates complete modules for multiple stacks

Backend stacks (DDD architecture):
  - go        : Go + Gin + GORM (DDD: domain/application/infrastructure)
  - laravel   : Laravel + PHP (DDD: Domain/Application/Infrastructure)

Frontend stacks (feature-based):
  - react     : React + TypeScript + Vite
  - flutter   : Flutter + Dart + Riverpod

Usage:
    # Backend DDD (requires --domain)
    python module-generator.py --stack go --domain wallet --name transaction --fields "amount:float64,status:string,user_id:string" --project github.com/user/app
    python module-generator.py --stack laravel --domain Wallet --name Transaction --fields "amount:decimal,status:string,user_id:string"

    # Frontend (simple feature-based)
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

    def __init__(self, name: str, fields: str, project: str, output_dir: str, domain: str = '', **options):
        self.module_name = name.lower()
        self.entity_name = self.to_pascal_case(name)
        self.project = project
        self.output_dir = Path(output_dir)
        self.domain_name = domain.lower() if domain else self.module_name
        self.domain_pascal = self.to_pascal_case(domain) if domain else self.entity_name
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
        pass

    @abstractmethod
    def generate(self) -> List[str]:
        pass

    def write_file(self, path: Path, content: str) -> str:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content)
        return str(path)


# =============================================================================
# GO DDD GENERATOR
# =============================================================================

class GoGenerator(BaseGenerator):
    """Go + Gin + GORM DDD generator"""

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
        base = self.output_dir / 'internal'
        domain_dir = base / 'domain' / self.domain_name

        # --- Domain Layer ---

        # Entity
        files.append(self.write_file(
            domain_dir / 'entities' / f'{self.module_name}.go',
            self._entity_template()
        ))

        # Value Objects (status)
        if any(n == 'status' or n.endswith('_status') for n, _, _ in self.fields):
            files.append(self.write_file(
                domain_dir / 'valueobjects' / f'{self.module_name}_status.go',
                self._value_object_template()
            ))

        # Port (store interface)
        files.append(self.write_file(
            domain_dir / 'ports' / f'{self.module_name}_store.go',
            self._port_template()
        ))

        # Event
        files.append(self.write_file(
            domain_dir / 'events' / f'{self.module_name}_created.go',
            self._event_template()
        ))

        # UseCase
        files.append(self.write_file(
            domain_dir / 'usecases' / f'{self.module_name}_usecases.go',
            self._usecase_constructor_template()
        ))
        files.append(self.write_file(
            domain_dir / 'usecases' / f'{self.module_name}_create.go',
            self._usecase_create_template()
        ))
        files.append(self.write_file(
            domain_dir / 'usecases' / f'{self.module_name}_query.go',
            self._usecase_query_template()
        ))

        # --- Infrastructure Layer ---

        # GORM Model
        files.append(self.write_file(
            base / 'models' / f'{self.module_name}.go',
            self._model_template()
        ))

        # Store implementation
        files.append(self.write_file(
            base / 'infrastructure' / 'database' / f'{self.domain_name}_{self.module_name}_store.go',
            self._store_template()
        ))

        # --- Application Layer ---

        # Handler
        files.append(self.write_file(
            base / 'application' / 'ports' / 'http' / f'{self.module_name}_handler.go',
            self._handler_template()
        ))

        # DTOs
        files.append(self.write_file(
            base / 'application' / 'ports' / 'http' / f'{self.module_name}_dtos.go',
            self._dtos_template()
        ))

        # Service
        files.append(self.write_file(
            base / 'application' / 'services' / f'{self.module_name}_service.go',
            self._service_template()
        ))

        return files

    # --- Domain Layer Templates ---

    def _entity_template(self) -> str:
        fields_str = '\n'.join([
            f'\t{self.to_pascal_case(n)} {t} `json:"{n}"`'
            for n, t, r in self.fields
        ])
        return f'''package entities

import (
	"time"

	"github.com/google/uuid"
)

type {self.entity_name} struct {{
	ID        string    `json:"id"`
{fields_str}
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}}

func New{self.entity_name}({', '.join([f'{self.to_camel_case(n)} {t}' for n, t, r in self.fields if r])}) *{self.entity_name} {{
	return &{self.entity_name}{{
		ID:        uuid.New().String(),
{chr(10).join([f'		{self.to_pascal_case(n)}: {self.to_camel_case(n)},' for n, _, r in self.fields if r])}
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}}
}}

func (e *{self.entity_name}) IsValid() bool {{
	return e.ID != ""
}}
'''

    def _value_object_template(self) -> str:
        status_field = next((n for n, _, _ in self.fields if n == 'status' or n.endswith('_status')), 'status')
        pascal = self.to_pascal_case(self.module_name)
        return f'''package valueobjects

type {pascal}Status string

const (
	{pascal}StatusPending   {pascal}Status = "pending"
	{pascal}StatusActive    {pascal}Status = "active"
	{pascal}StatusCompleted {pascal}Status = "completed"
	{pascal}StatusCancelled {pascal}Status = "cancelled"
)

func (s {pascal}Status) String() string {{
	return string(s)
}}

func (s {pascal}Status) IsTerminal() bool {{
	return s == {pascal}StatusCompleted || s == {pascal}StatusCancelled
}}

func (s {pascal}Status) CanTransitionTo(target {pascal}Status) bool {{
	if s.IsTerminal() {{
		return false
	}}
	switch s {{
	case {pascal}StatusPending:
		return target == {pascal}StatusActive || target == {pascal}StatusCancelled
	case {pascal}StatusActive:
		return target == {pascal}StatusCompleted || target == {pascal}StatusCancelled
	}}
	return false
}}
'''

    def _port_template(self) -> str:
        return f'''package ports

import (
	"context"

	"{self.project}/internal/domain/{self.domain_name}/entities"
)

type {self.entity_name}Store interface {{
	Create(ctx context.Context, entity *entities.{self.entity_name}) error
	GetByID(ctx context.Context, id string) (*entities.{self.entity_name}, error)
	Update(ctx context.Context, entity *entities.{self.entity_name}) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, params *{self.entity_name}ListParams) ([]*entities.{self.entity_name}, int64, error)
}}

type {self.entity_name}ListParams struct {{
	Page    int
	PerPage int
	Search  string
}}
'''

    def _event_template(self) -> str:
        return f'''package events

type {self.entity_name}Created struct {{
	ID     string
	UserID string
}}

func New{self.entity_name}Created(id, userID string) *{self.entity_name}Created {{
	return &{self.entity_name}Created{{
		ID:     id,
		UserID: userID,
	}}
}}

func (e *{self.entity_name}Created) EventName() string {{
	return "{self.domain_name}.{self.module_name}.created"
}}
'''

    def _usecase_constructor_template(self) -> str:
        return f'''package usecases

import (
	"{self.project}/internal/domain/{self.domain_name}/ports"
)

type {self.entity_name}Usecases struct {{
	store ports.{self.entity_name}Store
}}

func New{self.entity_name}Usecases(store ports.{self.entity_name}Store) *{self.entity_name}Usecases {{
	return &{self.entity_name}Usecases{{store: store}}
}}
'''

    def _usecase_create_template(self) -> str:
        params = ', '.join([f'{self.to_camel_case(n)} {t}' for n, t, r in self.fields if r])
        args = ', '.join([self.to_camel_case(n) for n, _, r in self.fields if r])
        return f'''package usecases

import (
	"context"

	"{self.project}/internal/domain/{self.domain_name}/entities"
)

func (u *{self.entity_name}Usecases) Create(ctx context.Context, {params}) (*entities.{self.entity_name}, error) {{
	entity := entities.New{self.entity_name}({args})
	if err := u.store.Create(ctx, entity); err != nil {{
		return nil, err
	}}
	return entity, nil
}}
'''

    def _usecase_query_template(self) -> str:
        return f'''package usecases

import (
	"context"

	"{self.project}/internal/domain/{self.domain_name}/entities"
	"{self.project}/internal/domain/{self.domain_name}/ports"
)

func (u *{self.entity_name}Usecases) GetByID(ctx context.Context, id string) (*entities.{self.entity_name}, error) {{
	return u.store.GetByID(ctx, id)
}}

func (u *{self.entity_name}Usecases) List(ctx context.Context, params *ports.{self.entity_name}ListParams) ([]*entities.{self.entity_name}, int64, error) {{
	return u.store.List(ctx, params)
}}

func (u *{self.entity_name}Usecases) Delete(ctx context.Context, id string) error {{
	return u.store.Delete(ctx, id)
}}
'''

    # --- Infrastructure Layer Templates ---

    def _model_template(self) -> str:
        fields_str = '\n'.join([
            f'\t{self.to_pascal_case(n)} {t if r or t.startswith("*") else "*"+t} `gorm:"type:{self._gorm_type(t)}" json:"{n}"`'
            for n, t, r in self.fields
        ])
        return f'''package models

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

    def _store_template(self) -> str:
        search_field = next((n for n, t, _ in self.fields if t == 'string' and not n.endswith('_id')), 'name')
        entity_mappings = '\n'.join([f'\t\t{self.to_pascal_case(n)}: entity.{self.to_pascal_case(n)},' for n, _, _ in self.fields])
        model_mappings = '\n'.join([f'\t\t{self.to_pascal_case(n)}: m.{self.to_pascal_case(n)},' for n, _, _ in self.fields])
        return f'''package database

import (
	"context"

	"gorm.io/gorm"

	"{self.project}/internal/domain/{self.domain_name}/entities"
	"{self.project}/internal/domain/{self.domain_name}/ports"
	"{self.project}/internal/models"
)

var _ ports.{self.entity_name}Store = (*{self.entity_name}Store)(nil)

type {self.entity_name}Store struct {{
	db *gorm.DB
}}

func New{self.entity_name}Store(db *gorm.DB) *{self.entity_name}Store {{
	return &{self.entity_name}Store{{db: db}}
}}

func (s *{self.entity_name}Store) Create(ctx context.Context, entity *entities.{self.entity_name}) error {{
	m := s.toModel(entity)
	return s.db.WithContext(ctx).Create(m).Error
}}

func (s *{self.entity_name}Store) GetByID(ctx context.Context, id string) (*entities.{self.entity_name}, error) {{
	var m models.{self.entity_name}
	if err := s.db.WithContext(ctx).First(&m, "id = ?", id).Error; err != nil {{
		return nil, err
	}}
	return s.toEntity(&m), nil
}}

func (s *{self.entity_name}Store) Update(ctx context.Context, entity *entities.{self.entity_name}) error {{
	m := s.toModel(entity)
	return s.db.WithContext(ctx).Save(m).Error
}}

func (s *{self.entity_name}Store) Delete(ctx context.Context, id string) error {{
	return s.db.WithContext(ctx).Delete(&models.{self.entity_name}{{}}, "id = ?", id).Error
}}

func (s *{self.entity_name}Store) List(ctx context.Context, params *ports.{self.entity_name}ListParams) ([]*entities.{self.entity_name}, int64, error) {{
	var items []models.{self.entity_name}
	var total int64
	query := s.db.WithContext(ctx).Model(&models.{self.entity_name}{{}})
	if params.Search != "" {{
		query = query.Where("{search_field} LIKE ?", "%"+params.Search+"%")
	}}
	if err := query.Count(&total).Error; err != nil {{
		return nil, 0, err
	}}
	page, perPage := params.Page, params.PerPage
	if page < 1 {{ page = 1 }}
	if perPage < 1 {{ perPage = 20 }}
	offset := (page - 1) * perPage
	if err := query.Offset(offset).Limit(perPage).Order("created_at DESC").Find(&items).Error; err != nil {{
		return nil, 0, err
	}}
	result := make([]*entities.{self.entity_name}, len(items))
	for i := range items {{
		result[i] = s.toEntity(&items[i])
	}}
	return result, total, nil
}}

func (s *{self.entity_name}Store) toModel(entity *entities.{self.entity_name}) *models.{self.entity_name} {{
	return &models.{self.entity_name}{{
		ID:        entity.ID,
{entity_mappings}
		CreatedAt: entity.CreatedAt,
		UpdatedAt: entity.UpdatedAt,
	}}
}}

func (s *{self.entity_name}Store) toEntity(m *models.{self.entity_name}) *entities.{self.entity_name} {{
	return &entities.{self.entity_name}{{
		ID:        m.ID,
{model_mappings}
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
	}}
}}
'''

    # --- Application Layer Templates ---

    def _handler_template(self) -> str:
        route = self.to_kebab_case(self.pluralize(self.module_name))
        return f'''package http

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"{self.project}/internal/application/services"
	"{self.project}/internal/bootstrap"
	"{self.project}/internal/domain/{self.domain_name}/usecases"
	"{self.project}/internal/infrastructure/database"
	infrahttp "{self.project}/internal/infrastructure/http"
)

type {self.entity_name}Handler struct {{
	service *services.{self.entity_name}Service
}}

func Register{self.entity_name}Routes(r gin.IRouter, app *bootstrap.App) {{
	store := database.New{self.entity_name}Store(app.DB)
	uc := usecases.New{self.entity_name}Usecases(store)
	svc := services.New{self.entity_name}Service(uc)
	h := &{self.entity_name}Handler{{service: svc}}

	group := r.Group("/{route}")
	{{
		group.POST("", h.Create)
		group.GET("", h.List)
		group.GET("/:id", h.GetByID)
		group.PUT("/:id", h.Update)
		group.DELETE("/:id", h.Delete)
	}}
}}

func (h *{self.entity_name}Handler) Create(c *gin.Context) {{
	var req Create{self.entity_name}Request
	if err := c.ShouldBindJSON(&req); err != nil {{
		infrahttp.Error(c, http.StatusBadRequest, "Invalid request: "+err.Error())
		return
	}}
	entity, err := h.service.Create(c, &req)
	if err != nil {{
		infrahttp.HandleError(c, err)
		return
	}}
	infrahttp.Success(c, entity)
}}

func (h *{self.entity_name}Handler) GetByID(c *gin.Context) {{
	entity, err := h.service.GetByID(c, c.Param("id"))
	if err != nil {{
		infrahttp.Error(c, http.StatusNotFound, "{self.entity_name} not found")
		return
	}}
	infrahttp.Success(c, entity)
}}

func (h *{self.entity_name}Handler) Update(c *gin.Context) {{
	var req Update{self.entity_name}Request
	if err := c.ShouldBindJSON(&req); err != nil {{
		infrahttp.Error(c, http.StatusBadRequest, "Invalid request: "+err.Error())
		return
	}}
	entity, err := h.service.Update(c, c.Param("id"), &req)
	if err != nil {{
		infrahttp.HandleError(c, err)
		return
	}}
	infrahttp.Success(c, entity)
}}

func (h *{self.entity_name}Handler) Delete(c *gin.Context) {{
	if err := h.service.Delete(c, c.Param("id")); err != nil {{
		infrahttp.HandleError(c, err)
		return
	}}
	infrahttp.Success(c, gin.H{{"deleted": true}})
}}

func (h *{self.entity_name}Handler) List(c *gin.Context) {{
	var req List{self.entity_name}Request
	if err := c.ShouldBindQuery(&req); err != nil {{
		infrahttp.Error(c, http.StatusBadRequest, "Invalid request: "+err.Error())
		return
	}}
	result, err := h.service.List(c, &req)
	if err != nil {{
		infrahttp.HandleError(c, err)
		return
	}}
	infrahttp.Success(c, result)
}}
'''

    def _dtos_template(self) -> str:
        create_fields = '\n'.join([
            f'\t{self.to_pascal_case(n)} {t} `json:"{n}" binding:"{"required" if r else "omitempty"}"`'
            for n, t, r in self.fields
        ])
        update_fields = '\n'.join([
            f'\t{self.to_pascal_case(n)} *{t.lstrip("*")} `json:"{n}"`'
            for n, t, _ in self.fields
        ])
        return f'''package http

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
'''

    def _service_template(self) -> str:
        create_args = ', '.join([f'req.{self.to_pascal_case(n)}' for n, _, r in self.fields if r])
        return f'''package services

import (
	"context"

	"{self.project}/internal/domain/{self.domain_name}/entities"
	"{self.project}/internal/domain/{self.domain_name}/ports"
	"{self.project}/internal/domain/{self.domain_name}/usecases"
	apphttp "{self.project}/internal/application/ports/http"
)

type {self.entity_name}Service struct {{
	usecases *usecases.{self.entity_name}Usecases
}}

func New{self.entity_name}Service(uc *usecases.{self.entity_name}Usecases) *{self.entity_name}Service {{
	return &{self.entity_name}Service{{usecases: uc}}
}}

func (s *{self.entity_name}Service) Create(ctx context.Context, req *apphttp.Create{self.entity_name}Request) (*entities.{self.entity_name}, error) {{
	return s.usecases.Create(ctx, {create_args})
}}

func (s *{self.entity_name}Service) GetByID(ctx context.Context, id string) (*entities.{self.entity_name}, error) {{
	return s.usecases.GetByID(ctx, id)
}}

func (s *{self.entity_name}Service) Update(ctx context.Context, id string, req *apphttp.Update{self.entity_name}Request) (*entities.{self.entity_name}, error) {{
	entity, err := s.usecases.GetByID(ctx, id)
	if err != nil {{
		return nil, err
	}}
	// TODO: Apply updates from req to entity
	_ = entity
	return entity, nil
}}

func (s *{self.entity_name}Service) Delete(ctx context.Context, id string) error {{
	return s.usecases.Delete(ctx, id)
}}

func (s *{self.entity_name}Service) List(ctx context.Context, req *apphttp.List{self.entity_name}Request) ([]*entities.{self.entity_name}, error) {{
	params := &ports.{self.entity_name}ListParams{{
		Page:    req.Page,
		PerPage: req.PerPage,
		Search:  req.Search,
	}}
	items, _, err := s.usecases.List(ctx, params)
	return items, err
}}
'''


# =============================================================================
# LARAVEL DDD GENERATOR
# =============================================================================

class LaravelGenerator(BaseGenerator):
    """Laravel + PHP DDD generator"""

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
        base = self.output_dir / 'app'

        # --- Domain Layer ---
        domain_dir = base / 'Domain' / self.domain_pascal

        # Entity
        files.append(self.write_file(
            domain_dir / 'Entities' / f'{self.entity_name}.php',
            self._entity_template()
        ))

        # Port
        files.append(self.write_file(
            domain_dir / 'Ports' / f'{self.entity_name}StorePort.php',
            self._port_template()
        ))

        # UseCase - Create
        files.append(self.write_file(
            domain_dir / 'UseCases' / f'Create{self.entity_name}UseCase.php',
            self._create_usecase_template()
        ))

        # UseCase - Update
        files.append(self.write_file(
            domain_dir / 'UseCases' / f'Update{self.entity_name}UseCase.php',
            self._update_usecase_template()
        ))

        # UseCase - Delete
        files.append(self.write_file(
            domain_dir / 'UseCases' / f'Delete{self.entity_name}UseCase.php',
            self._delete_usecase_template()
        ))

        # --- Infrastructure Layer ---

        # Eloquent Model
        files.append(self.write_file(
            base / 'Models' / f'{self.entity_name}.php',
            self._model_template()
        ))

        # Repository implementation
        files.append(self.write_file(
            base / 'Infrastructure' / 'Repositories' / f'Eloquent{self.entity_name}Repository.php',
            self._repository_template()
        ))

        # Migration
        files.append(self.write_file(
            self.output_dir / 'database' / 'migrations' / f'create_{self.pluralize(self.module_name)}_table.php',
            self._migration_template()
        ))

        # --- Application Layer ---

        # Controller
        files.append(self.write_file(
            base / 'Application' / 'Http' / 'Controllers' / f'{self.entity_name}Controller.php',
            self._controller_template()
        ))

        # Service
        files.append(self.write_file(
            base / 'Application' / 'Services' / f'{self.entity_name}Service.php',
            self._service_template()
        ))

        # Service Provider
        files.append(self.write_file(
            base / 'Providers' / f'{self.domain_pascal}ServiceProvider.php',
            self._provider_template()
        ))

        # Request
        files.append(self.write_file(
            base / 'Application' / 'Http' / 'Requests' / f'{self.entity_name}Request.php',
            self._request_template()
        ))

        return files

    # --- Domain Layer Templates ---

    def _entity_template(self) -> str:
        props = '\n'.join([
            f"    public readonly {'?' if not r else ''}{self._php_type(t)} ${n},"
            for n, t, r in self.fields
        ])
        return f'''<?php

namespace App\\Domain\\{self.domain_pascal}\\Entities;

class {self.entity_name}
{{
    public function __construct(
        public readonly string $id,
{props}
        public readonly ?string $createdAt = null,
        public readonly ?string $updatedAt = null,
    ) {{}}

    public static function create(array $data): self
    {{
        return new self(
            id: (string) \\Illuminate\\Support\\Str::uuid(),
            ...array_intersect_key($data, array_flip([{', '.join([f"'{n}'" for n, _, _ in self.fields])}])),
        );
    }}

    public function isValid(): bool
    {{
        return !empty($this->id);
    }}
}}
'''

    def _php_type(self, field_type: str) -> str:
        type_map = {
            'string': 'string', 'text': 'string', 'integer': 'int',
            'bigInteger': 'int', 'float': 'float', 'double': 'float',
            'decimal': 'float', 'boolean': 'bool', 'date': 'string',
            'datetime': 'string', 'json': 'array',
        }
        return type_map.get(field_type, 'string')

    def _port_template(self) -> str:
        return f'''<?php

namespace App\\Domain\\{self.domain_pascal}\\Ports;

use App\\Domain\\{self.domain_pascal}\\Entities\\{self.entity_name};

interface {self.entity_name}StorePort
{{
    public function create({self.entity_name} $entity): {self.entity_name};
    public function findById(string $id): ?{self.entity_name};
    public function update({self.entity_name} $entity): {self.entity_name};
    public function delete(string $id): bool;
    public function list(array $params = []): array;
}}
'''

    def _create_usecase_template(self) -> str:
        return f'''<?php

namespace App\\Domain\\{self.domain_pascal}\\UseCases;

use App\\Domain\\{self.domain_pascal}\\Entities\\{self.entity_name};
use App\\Domain\\{self.domain_pascal}\\Ports\\{self.entity_name}StorePort;

class Create{self.entity_name}UseCase
{{
    public function __construct(
        private readonly {self.entity_name}StorePort $store,
    ) {{}}

    public function execute(array $data): {self.entity_name}
    {{
        $entity = {self.entity_name}::create($data);
        return $this->store->create($entity);
    }}
}}
'''

    def _update_usecase_template(self) -> str:
        return f'''<?php

namespace App\\Domain\\{self.domain_pascal}\\UseCases;

use App\\Domain\\{self.domain_pascal}\\Entities\\{self.entity_name};
use App\\Domain\\{self.domain_pascal}\\Ports\\{self.entity_name}StorePort;

class Update{self.entity_name}UseCase
{{
    public function __construct(
        private readonly {self.entity_name}StorePort $store,
    ) {{}}

    public function execute(string $id, array $data): {self.entity_name}
    {{
        $entity = $this->store->findById($id);
        if (!$entity) {{
            throw new \\RuntimeException("{self.entity_name} not found");
        }}
        $updated = new {self.entity_name}(
            id: $entity->id,
            ...array_merge(
                array_intersect_key((array) $entity, array_flip([{', '.join([f"'{n}'" for n, _, _ in self.fields])}])),
                $data,
            ),
            createdAt: $entity->createdAt,
        );
        return $this->store->update($updated);
    }}
}}
'''

    def _delete_usecase_template(self) -> str:
        return f'''<?php

namespace App\\Domain\\{self.domain_pascal}\\UseCases;

use App\\Domain\\{self.domain_pascal}\\Ports\\{self.entity_name}StorePort;

class Delete{self.entity_name}UseCase
{{
    public function __construct(
        private readonly {self.entity_name}StorePort $store,
    ) {{}}

    public function execute(string $id): bool
    {{
        return $this->store->delete($id);
    }}
}}
'''

    # --- Infrastructure Layer Templates ---

    def _model_template(self) -> str:
        fillable = ', '.join([f"'{n}'" for n, _, _ in self.fields])
        casts = ', '.join([f"'{n}' => '{t}'" for n, t, _ in self.fields if t in ('boolean', 'integer', 'float', 'array', 'json')])
        return f'''<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\SoftDeletes;
use Illuminate\\Database\\Eloquent\\Concerns\\HasUuids;

class {self.entity_name} extends Model
{{
    use HasFactory, SoftDeletes, HasUuids;

    protected $fillable = [{fillable}];

    protected $casts = [{casts}];
}}
'''

    def _repository_template(self) -> str:
        entity_mappings = '\n'.join([f"            '{n}' => $model->{n}," for n, _, _ in self.fields])
        return f'''<?php

namespace App\\Infrastructure\\Repositories;

use App\\Domain\\{self.domain_pascal}\\Entities\\{self.entity_name} as {self.entity_name}Entity;
use App\\Domain\\{self.domain_pascal}\\Ports\\{self.entity_name}StorePort;
use App\\Models\\{self.entity_name};

class Eloquent{self.entity_name}Repository implements {self.entity_name}StorePort
{{
    public function create({self.entity_name}Entity $entity): {self.entity_name}Entity
    {{
        $model = {self.entity_name}::create([
{chr(10).join([f"            '{n}' => $entity->{n}," for n, _, _ in self.fields])}
        ]);
        return $this->toEntity($model);
    }}

    public function findById(string $id): ?{self.entity_name}Entity
    {{
        $model = {self.entity_name}::find($id);
        return $model ? $this->toEntity($model) : null;
    }}

    public function update({self.entity_name}Entity $entity): {self.entity_name}Entity
    {{
        $model = {self.entity_name}::findOrFail($entity->id);
        $model->update([
{chr(10).join([f"            '{n}' => $entity->{n}," for n, _, _ in self.fields])}
        ]);
        return $this->toEntity($model->fresh());
    }}

    public function delete(string $id): bool
    {{
        return (bool) {self.entity_name}::destroy($id);
    }}

    public function list(array $params = []): array
    {{
        $query = {self.entity_name}::query();
        if (!empty($params['search'])) {{
            $query->where('name', 'like', '%' . $params['search'] . '%');
        }}
        $items = $query->orderBy('created_at', 'desc')
            ->paginate($params['per_page'] ?? 20);

        return [
            'items' => collect($items->items())->map(fn($m) => $this->toEntity($m))->all(),
            'total' => $items->total(),
            'page' => $items->currentPage(),
            'per_page' => $items->perPage(),
        ];
    }}

    private function toEntity({self.entity_name} $model): {self.entity_name}Entity
    {{
        return new {self.entity_name}Entity(
            id: $model->id,
{entity_mappings}
            createdAt: $model->created_at?->toISOString(),
            updatedAt: $model->updated_at?->toISOString(),
        );
    }}
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

    # --- Application Layer Templates ---

    def _controller_template(self) -> str:
        return f'''<?php

namespace App\\Application\\Http\\Controllers;

use App\\Application\\Http\\Requests\\{self.entity_name}Request;
use App\\Application\\Services\\{self.entity_name}Service;
use Illuminate\\Http\\JsonResponse;
use Illuminate\\Http\\Request;

class {self.entity_name}Controller
{{
    public function __construct(
        private readonly {self.entity_name}Service $service,
    ) {{}}

    public function index(Request $request): JsonResponse
    {{
        $result = $this->service->list($request->all());
        return response()->json($result);
    }}

    public function show(string $id): JsonResponse
    {{
        $entity = $this->service->getById($id);
        if (!$entity) {{
            return response()->json(['error' => '{self.entity_name} not found'], 404);
        }}
        return response()->json($entity);
    }}

    public function store({self.entity_name}Request $request): JsonResponse
    {{
        $entity = $this->service->create($request->validated());
        return response()->json($entity, 201);
    }}

    public function update({self.entity_name}Request $request, string $id): JsonResponse
    {{
        $entity = $this->service->update($id, $request->validated());
        return response()->json($entity);
    }}

    public function destroy(string $id): JsonResponse
    {{
        $this->service->delete($id);
        return response()->json(['deleted' => true]);
    }}
}}
'''

    def _service_template(self) -> str:
        return f'''<?php

namespace App\\Application\\Services;

use App\\Domain\\{self.domain_pascal}\\Entities\\{self.entity_name};
use App\\Domain\\{self.domain_pascal}\\UseCases\\Create{self.entity_name}UseCase;
use App\\Domain\\{self.domain_pascal}\\UseCases\\Update{self.entity_name}UseCase;
use App\\Domain\\{self.domain_pascal}\\UseCases\\Delete{self.entity_name}UseCase;
use App\\Domain\\{self.domain_pascal}\\Ports\\{self.entity_name}StorePort;

class {self.entity_name}Service
{{
    public function __construct(
        private readonly Create{self.entity_name}UseCase $createUseCase,
        private readonly Update{self.entity_name}UseCase $updateUseCase,
        private readonly Delete{self.entity_name}UseCase $deleteUseCase,
        private readonly {self.entity_name}StorePort $store,
    ) {{}}

    public function create(array $data): {self.entity_name}
    {{
        return $this->createUseCase->execute($data);
    }}

    public function getById(string $id): ?{self.entity_name}
    {{
        return $this->store->findById($id);
    }}

    public function update(string $id, array $data): {self.entity_name}
    {{
        return $this->updateUseCase->execute($id, $data);
    }}

    public function delete(string $id): bool
    {{
        return $this->deleteUseCase->execute($id);
    }}

    public function list(array $params = []): array
    {{
        return $this->store->list($params);
    }}
}}
'''

    def _provider_template(self) -> str:
        return f'''<?php

namespace App\\Providers;

use Illuminate\\Support\\ServiceProvider;
use App\\Domain\\{self.domain_pascal}\\Ports\\{self.entity_name}StorePort;
use App\\Infrastructure\\Repositories\\Eloquent{self.entity_name}Repository;

class {self.domain_pascal}ServiceProvider extends ServiceProvider
{{
    public function register(): void
    {{
        $this->app->bind(
            {self.entity_name}StorePort::class,
            Eloquent{self.entity_name}Repository::class,
        );
    }}
}}
'''

    def _request_template(self) -> str:
        rules = '\n'.join([
            f"            '{n}' => ['{('required' if r else 'nullable')}', '{t}'],"
            for n, t, r in self.fields
        ])
        return f'''<?php

namespace App\\Application\\Http\\Requests;

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


# =============================================================================
# REACT GENERATOR (Frontend - simple feature-based)
# =============================================================================

class ReactGenerator(BaseGenerator):
    """React + TypeScript + Vite generator"""

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

        files.append(self.write_file(feature_dir / 'types.ts', self._types_template()))
        files.append(self.write_file(feature_dir / 'api.ts', self._api_template()))
        files.append(self.write_file(feature_dir / 'hooks.ts', self._hooks_template()))
        files.append(self.write_file(feature_dir / 'components' / f'{self.entity_name}List.tsx', self._list_component_template()))
        files.append(self.write_file(feature_dir / 'components' / f'{self.entity_name}Form.tsx', self._form_component_template()))
        files.append(self.write_file(feature_dir / 'index.ts', self._index_template()))

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
import type {{ Create{self.entity_name}Request, Update{self.entity_name}Request, {self.entity_name}ListParams }} from './types';

const QUERY_KEY = '{self.pluralize(self.module_name)}';

export function use{self.entity_name}List(params?: {self.entity_name}ListParams) {{
  return useQuery({{ queryKey: [QUERY_KEY, params], queryFn: () => {self.to_camel_case(self.module_name)}Api.list(params) }});
}}

export function use{self.entity_name}(id: string) {{
  return useQuery({{ queryKey: [QUERY_KEY, id], queryFn: () => {self.to_camel_case(self.module_name)}Api.get(id), enabled: !!id }});
}}

export function useCreate{self.entity_name}() {{
  const qc = useQueryClient();
  return useMutation({{ mutationFn: (data: Create{self.entity_name}Request) => {self.to_camel_case(self.module_name)}Api.create(data), onSuccess: () => qc.invalidateQueries({{ queryKey: [QUERY_KEY] }}) }});
}}

export function useUpdate{self.entity_name}() {{
  const qc = useQueryClient();
  return useMutation({{ mutationFn: ({{ id, data }}: {{ id: string; data: Update{self.entity_name}Request }}) => {self.to_camel_case(self.module_name)}Api.update(id, data), onSuccess: () => qc.invalidateQueries({{ queryKey: [QUERY_KEY] }}) }});
}}

export function useDelete{self.entity_name}() {{
  const qc = useQueryClient();
  return useMutation({{ mutationFn: (id: string) => {self.to_camel_case(self.module_name)}Api.delete(id), onSuccess: () => qc.invalidateQueries({{ queryKey: [QUERY_KEY] }}) }});
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

  return (
    <div>
      <h1>{self.entity_name} List</h1>
      <ul>
        {{data?.items.map((item: {self.entity_name}) => (
          <li key={{item.id}}>
            {{JSON.stringify(item)}}
            <button onClick={{() => deleteMutation.mutate(item.id)}}>Delete</button>
          </li>
        ))}}
      </ul>
    </div>
  );
}}
'''

    def _form_component_template(self) -> str:
        fields = '\n'.join([
            f'      <input name="{n}" placeholder="{self.to_pascal_case(n)}" {"required" if r else ""} />'
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
# FLUTTER GENERATOR (Frontend - simple feature-based)
# =============================================================================

class FlutterGenerator(BaseGenerator):
    """Flutter + Dart + Riverpod generator"""

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

        files.append(self.write_file(feature_dir / 'data' / 'models' / f'{self.module_name}_model.dart', self._model_template()))
        files.append(self.write_file(feature_dir / 'data' / 'repositories' / f'{self.module_name}_repository.dart', self._repository_template()))
        files.append(self.write_file(feature_dir / 'presentation' / 'providers' / f'{self.module_name}_provider.dart', self._provider_template()))
        files.append(self.write_file(feature_dir / 'presentation' / 'screens' / f'{self.module_name}_list_screen.dart', self._screen_template()))

        return files

    def _model_template(self) -> str:
        constructor_params = ', '.join([
            f"{'required ' if r else ''}this.{self.to_camel_case(n)}"
            for n, _, r in self.fields
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

  Future<{self.entity_name}> create(Map<String, dynamic> data) async {{
    final response = await _dio.post('/{route}', data: data);
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
        onPressed: () {{}},
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

BACKEND_STACKS = {'go', 'laravel'}

def main():
    parser = argparse.ArgumentParser(
        description='Universal Module Generator (DDD for backend, feature-based for frontend)',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Backend DDD examples:
  Go:      python module-generator.py --stack go --domain wallet --name transaction --fields "amount:float64,status:string,user_id:string" --project github.com/user/app
  Laravel: python module-generator.py --stack laravel --domain Wallet --name Transaction --fields "amount:decimal,status:string,user_id:string"

Frontend examples:
  React:   python module-generator.py --stack react --name product --fields "name:string,price:number"
  Flutter: python module-generator.py --stack flutter --name product --fields "name:String,price:int"
        '''
    )
    parser.add_argument('--stack', '-s', required=True, choices=GENERATORS.keys(), help='Target stack')
    parser.add_argument('--name', '-n', required=True, help='Entity name')
    parser.add_argument('--fields', '-f', required=True, help='Fields (name:type,name:type?)')
    parser.add_argument('--domain', '-d', default='', help='Domain name (required for backend DDD stacks)')
    parser.add_argument('--project', '-p', default='', help='Project path (Go module path, etc.)')
    parser.add_argument('--output', '-o', default='.', help='Output directory')

    args = parser.parse_args()

    if args.stack in BACKEND_STACKS and not args.domain:
        print(f"Error: --domain is required for backend stack '{args.stack}'")
        print(f"Example: --domain wallet")
        sys.exit(1)

    generator_class = GENERATORS[args.stack]
    generator = generator_class(
        name=args.name,
        fields=args.fields,
        project=args.project,
        output_dir=args.output,
        domain=args.domain,
    )

    files = generator.generate()

    stack_type = "DDD" if args.stack in BACKEND_STACKS else "feature-based"
    domain_info = f" (domain: {args.domain})" if args.domain else ""
    print(f"\n  Generated {len(files)} files for {args.stack}/{args.name} [{stack_type}]{domain_info}:\n")
    for f in files:
        print(f"   {f}")
    print()

if __name__ == '__main__':
    main()
