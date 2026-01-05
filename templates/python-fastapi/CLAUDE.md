# CLAUDE.md - Python + FastAPI Backend Template

## Project Overview

Backend API service built with:
- **Python 3.12+** - Programming language
- **FastAPI** - Modern web framework
- **SQLAlchemy 2** - ORM
- **Pydantic 2** - Data validation
- **Alembic** - Database migrations
- **Poetry** - Dependency management

## Quick Start

```bash
# Install dependencies
poetry install

# Setup database
poetry run alembic upgrade head

# Run development server
poetry run uvicorn app.main:app --reload --port 8000

# Run tests
poetry run pytest

# Generate migration
poetry run alembic revision --autogenerate -m "description"
```

## Project Structure

```
{project_name}/
├── app/
│   ├── api/                     # API routes
│   │   ├── deps.py              # Dependencies (auth, db session)
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   └── {module}.py
│   │       └── router.py
│   ├── core/                    # Core configuration
│   │   ├── config.py
│   │   ├── security.py
│   │   └── database.py
│   ├── models/                  # SQLAlchemy models
│   │   └── {entity}.py
│   ├── schemas/                 # Pydantic schemas
│   │   └── {entity}.py
│   ├── services/                # Business logic
│   │   └── {entity}.py
│   ├── repositories/            # Data access
│   │   └── {entity}.py
│   └── main.py                  # FastAPI app
├── alembic/
│   ├── versions/
│   └── env.py
├── tests/
├── .env
├── alembic.ini
├── pyproject.toml
└── poetry.lock
```

## Key Patterns and Conventions

### File Naming
- Use `snake_case.py` for all Python files
- One model/schema per file when possible

### Pydantic Schema Pattern

```python
# schemas/user.py
from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None

class UserResponse(UserBase):
    id: str
    created_at: datetime

    model_config = {"from_attributes": True}

class UserListResponse(BaseModel):
    data: list[UserResponse]
    total: int
    page: int
    limit: int
    total_pages: int
```

### SQLAlchemy Model Pattern

```python
# models/user.py
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
import uuid

from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### Repository Pattern

```python
# repositories/user.py
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate

class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_many(
        self,
        skip: int = 0,
        limit: int = 10,
        search: str | None = None
    ) -> tuple[list[User], int]:
        query = select(User)
        count_query = select(func.count(User.id))

        if search:
            query = query.where(User.name.ilike(f"%{search}%"))
            count_query = count_query.where(User.name.ilike(f"%{search}%"))

        query = query.offset(skip).limit(limit).order_by(User.created_at.desc())

        result = await self.db.execute(query)
        count_result = await self.db.execute(count_query)

        return result.scalars().all(), count_result.scalar_one()

    async def get_by_id(self, id: str) -> User | None:
        result = await self.db.execute(select(User).where(User.id == id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def create(self, data: UserCreate, password_hash: str) -> User:
        user = User(name=data.name, email=data.email, password_hash=password_hash)
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user
```

### Service Pattern

```python
# services/user.py
from fastapi import HTTPException, status
from app.repositories.user import UserRepository
from app.schemas.user import UserCreate, UserUpdate, UserListResponse
from app.core.security import get_password_hash

class UserService:
    def __init__(self, repository: UserRepository):
        self.repository = repository

    async def list_users(
        self,
        page: int = 1,
        limit: int = 10,
        search: str | None = None
    ) -> UserListResponse:
        skip = (page - 1) * limit
        users, total = await self.repository.get_many(skip, limit, search)

        return UserListResponse(
            data=users,
            total=total,
            page=page,
            limit=limit,
            total_pages=(total + limit - 1) // limit,
        )

    async def create_user(self, data: UserCreate):
        existing = await self.repository.get_by_email(data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already exists",
            )

        password_hash = get_password_hash(data.password)
        return await self.repository.create(data, password_hash)
```

### API Endpoint Pattern

```python
# api/v1/endpoints/users.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.schemas.user import UserCreate, UserResponse, UserListResponse
from app.services.user import UserService
from app.repositories.user import UserRepository

router = APIRouter()

def get_user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    return UserService(UserRepository(db))

@router.get("/", response_model=UserListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: str | None = None,
    service: UserService = Depends(get_user_service),
    current_user = Depends(get_current_user),
):
    return await service.list_users(page, limit, search)

@router.post("/", response_model=UserResponse, status_code=201)
async def create_user(
    data: UserCreate,
    service: UserService = Depends(get_user_service),
    current_user = Depends(get_current_user),
):
    return await service.create_user(data)

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    service: UserService = Depends(get_user_service),
    current_user = Depends(get_current_user),
):
    user = await service.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

### Dependencies

```python
# api/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session_maker
from app.core.security import verify_token

security = HTTPBearer()

async def get_db():
    async with async_session_maker() as session:
        yield session

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    token = credentials.credentials
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    # Fetch user from DB if needed
    return payload
```

## Adding New Module

1. Create model (`models/{entity}.py`)
2. Create schemas (`schemas/{entity}.py`)
3. Create repository (`repositories/{entity}.py`)
4. Create service (`services/{entity}.py`)
5. Create endpoint (`api/v1/endpoints/{entity}.py`)
6. Register router in `api/v1/router.py`:
```python
from app.api.v1.endpoints import users, new_module

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(new_module.router, prefix="/new-module", tags=["new-module"])
```
7. Generate migration: `poetry run alembic revision --autogenerate -m "add new_module"`

## API Endpoints Pattern

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/{resource}/ | List all items |
| GET | /api/v1/{resource}/{id} | Get single item |
| POST | /api/v1/{resource}/ | Create item |
| PUT | /api/v1/{resource}/{id} | Update item |
| DELETE | /api/v1/{resource}/{id} | Delete item |

## Configuration

### Environment Variables (.env)
```
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/db
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### Config Class
```python
# core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    access_token_expire_minutes: int = 60

    model_config = {"env_file": ".env"}

settings = Settings()
```

### Database Setup
```python
# core/database.py
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

engine = create_async_engine(settings.database_url)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass
```
