# Node.js NestJS Backend Architecture

> Production-grade DDD with Hexagonal Architecture for Node.js + NestJS + TypeORM

**Prerequisite:** Read `clean-architecture.md` first. This doc shows how DDD maps to NestJS.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js 20+ |
| Language | TypeScript 5+ |
| Framework | NestJS 10+ |
| ORM | TypeORM (@nestjs/typeorm) |
| Database | PostgreSQL / MySQL |
| Cache | Redis (ioredis) |
| Queue | BullMQ |
| Auth | Passport + JWT / Firebase Admin |
| Validation | class-validator + class-transformer (or Zod) |
| Logging | Pino (nestjs-pino) |
| Config | @nestjs/config |
| Testing | Jest + Supertest |
| Storage | AWS S3 / Cloudflare R2 |
| Real-time | Socket.IO / SSE |

---

## DDD Directory Structure

```
src/
├── domain/{domain}/
│   ├── entities/                    # Aggregates + entities with behavior
│   │   └── {entity}.ts              # Pure class — no decorators, no framework
│   ├── value-objects/               # Immutable typed values with behavior
│   │   └── {vo}.ts
│   ├── ports/                       # Hexagonal ports (interfaces) — 1 per file
│   │   └── {repo-name}.port.ts      # Token + interface
│   ├── events/                      # 1 file per domain event
│   │   └── {event-name}.event.ts    # Extends shared BaseEvent
│   ├── use-cases/                   # Business orchestration (pure, no infra)
│   │   └── {action}.use-case.ts
│   ├── errors/                      # Domain-specific error classes
│   └── validators/                  # (optional) Pure validation rules
│
├── domain/shared/
│   ├── base-event.ts                # BaseEvent class
│   └── event-collector.ts           # EventCollector mixin for entities
│
├── application/
│   ├── {domain}/
│   │   ├── {domain}.module.ts       # NestJS module wiring
│   │   ├── controllers/
│   │   │   └── {domain}.controller.ts
│   │   ├── services/
│   │   │   └── {domain}.service.ts  # Thin wrapper → domain use-cases
│   │   ├── dtos/
│   │   │   ├── create-{entity}.dto.ts
│   │   │   ├── update-{entity}.dto.ts
│   │   │   └── {entity}-response.dto.ts
│   │   ├── mappers/
│   │   │   └── {entity}.mapper.ts   # Entity ↔ DTO
│   │   └── listeners/
│   │       └── on-{event-name}.listener.ts
│   └── event-bus/
│       ├── event-bus.module.ts
│       └── event-bus.service.ts
│
├── infrastructure/
│   ├── persistence/
│   │   ├── typeorm/
│   │   │   ├── typeorm.module.ts          # TypeOrmModule.forRootAsync
│   │   │   └── data-source.ts             # DataSource for migrations/CLI
│   │   ├── entities/                      # TypeORM @Entity classes (persistence models)
│   │   │   └── {entity}.orm-entity.ts
│   │   ├── repositories/
│   │   │   └── {entity}.repository.ts     # Implements domain port
│   │   └── migrations/
│   │       └── {timestamp}-{name}.ts
│   ├── cache/
│   │   └── redis.service.ts
│   ├── queue/
│   │   ├── queue.module.ts
│   │   └── processors/
│   │       └── {task}.processor.ts
│   ├── auth/
│   │   ├── jwt.strategy.ts
│   │   └── firebase.service.ts
│   ├── storage/
│   │   └── s3.service.ts
│   ├── http/
│   │   ├── response.util.ts
│   │   └── filters/
│   │       └── all-exceptions.filter.ts
│   └── logger/
│       └── logger.module.ts
│
├── common/
│   ├── decorators/                  # @CurrentUser, @Roles...
│   ├── guards/                      # AuthGuard, RolesGuard
│   ├── interceptors/                # Logging, transform
│   ├── pipes/                       # Validation pipes
│   └── middleware/
│
├── config/
│   ├── configuration.ts
│   └── validation.schema.ts
│
├── app.module.ts
└── main.ts
```

---

## Layer Rules (Import Rules)

```
domain/value-objects/   → only stdlib / pure TS
domain/entities/        → only stdlib + domain/shared + domain/value-objects
domain/ports/           → only stdlib + domain/entities + domain/value-objects
domain/events/          → only stdlib + domain/shared
domain/use-cases/       → domain/entities + ports + events + value-objects  (NO infra, NO @nestjs/*)
application/services/   → domain/use-cases (thin wrapper) + @nestjs/common
application/controllers → application/services + DTOs + @nestjs/common
application/listeners/  → domain/events + @nestjs/common
infrastructure/persist. → domain/ports + typeorm
```

---

## Hard Rules

- `domain/` MUST NOT import `@nestjs/*`, `typeorm`, `ioredis`, `bullmq`, or any framework package
- `domain/` MUST NOT use decorators (`@Injectable`, `@Entity`, `@Column`...) — pure TypeScript only
- Domain entities are plain classes; TypeORM `@Entity` classes live in `infrastructure/persistence/entities/` and are separate from domain entities
- Domain A MUST NOT import Domain B
- NO circular imports
- Controllers return DTOs (never domain entities directly); use mappers
- Ports are interfaces + an `InjectionToken` constant for DI
- Use cases take primitives/value objects in, return entities out
- Repository implementations live in `infrastructure/persistence/repositories/` and are bound to ports via DI providers
- Entities raise events on state changes; listeners handle side-effects
- All external input validated with `class-validator` / Zod at the controller boundary

---

## Forbidden Imports in Domain

```
@nestjs/*
typeorm
@nestjs/typeorm
ioredis
bullmq
passport*
firebase-admin
```

---

## Domain Layer Examples

### Value Object

```typescript
// src/domain/wallet/value-objects/money.ts
export class Money {
  private constructor(
    private readonly _amount: bigint,
    private readonly _currency: string,
  ) {}

  static of(amount: bigint | number, currency = 'VND'): Money {
    return new Money(typeof amount === 'number' ? BigInt(amount) : amount, currency);
  }

  static zero(currency = 'VND'): Money {
    return new Money(0n, currency);
  }

  get amount(): bigint   { return this._amount; }
  get currency(): string { return this._currency; }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this._amount + other._amount, this._currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this._amount - other._amount, this._currency);
  }

  greaterOrEqual(other: Money): boolean {
    this.assertSameCurrency(other);
    return this._amount >= other._amount;
  }

  private assertSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new Error(`Currency mismatch: ${this._currency} vs ${other._currency}`);
    }
  }
}

export type WalletStatus = 'active' | 'frozen' | 'closed';
```

### Entity with Behavior

```typescript
// src/domain/wallet/entities/wallet.ts
import { randomUUID } from 'crypto';
import { EventCollector } from '@/domain/shared/event-collector';
import { Money } from '../value-objects/money';
import { WalletStatus } from '../value-objects/money';
import { WalletCreatedEvent } from '../events/wallet-created.event';
import { WalletWithdrawalCreatedEvent } from '../events/wallet-withdrawal-created.event';
import { InsufficientBalanceError, WalletInactiveError } from '../errors';

export class Wallet extends EventCollector {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    private _balance: Money,
    private _status: WalletStatus,
    public readonly createdAt: Date,
    private _updatedAt: Date,
  ) {
    super();
  }

  static create(userId: string): Wallet {
    const now = new Date();
    const wallet = new Wallet(randomUUID(), userId, Money.zero(), 'active', now, now);
    wallet.raise(new WalletCreatedEvent(wallet.id, userId));
    return wallet;
  }

  static restore(props: {
    id: string; userId: string; balance: Money; status: WalletStatus;
    createdAt: Date; updatedAt: Date;
  }): Wallet {
    return new Wallet(props.id, props.userId, props.balance, props.status, props.createdAt, props.updatedAt);
  }

  get balance(): Money        { return this._balance; }
  get status(): WalletStatus  { return this._status; }
  get updatedAt(): Date       { return this._updatedAt; }

  isActive(): boolean {
    return this._status === 'active';
  }

  withdraw(amount: Money): void {
    if (!this.isActive()) throw new WalletInactiveError(this.id);
    if (!this._balance.greaterOrEqual(amount)) throw new InsufficientBalanceError(this.id);

    this._balance = this._balance.subtract(amount);
    this._updatedAt = new Date();
    this.raise(new WalletWithdrawalCreatedEvent(this.id, this.userId, amount.amount));
  }

  deposit(amount: Money): void {
    this._balance = this._balance.add(amount);
    this._updatedAt = new Date();
  }
}
```

### Port (Repository Interface)

```typescript
// src/domain/wallet/ports/wallet.repository.port.ts
import { Wallet } from '../entities/wallet';

export const WALLET_REPOSITORY = Symbol('WALLET_REPOSITORY');

export interface WalletRepository {
  findById(id: string): Promise<Wallet | null>;
  findByUserId(userId: string): Promise<Wallet | null>;
  save(wallet: Wallet): Promise<void>;
}
```

### Domain Event

```typescript
// src/domain/wallet/events/wallet-withdrawal-created.event.ts
import { BaseEvent } from '@/domain/shared/base-event';

export class WalletWithdrawalCreatedEvent extends BaseEvent {
  static readonly NAME = 'wallet.withdrawal.created';

  constructor(
    public readonly walletId: string,
    public readonly userId: string,
    public readonly amount: bigint,
  ) {
    super(WalletWithdrawalCreatedEvent.NAME);
  }
}
```

### Use Case

```typescript
// src/domain/wallet/use-cases/withdraw.use-case.ts
import { Wallet } from '../entities/wallet';
import { WalletRepository } from '../ports/wallet.repository.port';
import { Money } from '../value-objects/money';
import { WalletNotFoundError } from '../errors';

export class WithdrawUseCase {
  constructor(private readonly walletRepo: WalletRepository) {}

  async execute(walletId: string, amount: Money): Promise<Wallet> {
    const wallet = await this.walletRepo.findById(walletId);
    if (!wallet) throw new WalletNotFoundError(walletId);

    wallet.withdraw(amount);
    await this.walletRepo.save(wallet);

    return wallet;
  }
}
```

---

## Application Layer Examples

### Module

```typescript
// src/application/wallet/wallet.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletOrmEntity } from '@/infrastructure/persistence/entities/wallet.orm-entity';
import { WalletController } from './controllers/wallet.controller';
import { WalletService } from './services/wallet.service';
import { WALLET_REPOSITORY } from '@/domain/wallet/ports/wallet.repository.port';
import { TypeOrmWalletRepository } from '@/infrastructure/persistence/repositories/wallet.repository';
import { WithdrawUseCase } from '@/domain/wallet/use-cases/withdraw.use-case';
import { OnWalletWithdrawalCreatedListener } from './listeners/on-wallet-withdrawal-created.listener';

@Module({
  imports: [TypeOrmModule.forFeature([WalletOrmEntity])],
  controllers: [WalletController],
  providers: [
    WalletService,
    OnWalletWithdrawalCreatedListener,
    TypeOrmWalletRepository,
    {
      provide: WALLET_REPOSITORY,
      useExisting: TypeOrmWalletRepository,
    },
    {
      provide: WithdrawUseCase,
      useFactory: (repo) => new WithdrawUseCase(repo),
      inject: [WALLET_REPOSITORY],
    },
  ],
})
export class WalletModule {}
```

### Controller

```typescript
// src/application/wallet/controllers/wallet.controller.ts
import { Body, Controller, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { WalletService } from '../services/wallet.service';
import { WithdrawDto } from '../dtos/withdraw.dto';
import { WalletResponseDto } from '../dtos/wallet-response.dto';
import { WalletMapper } from '../mappers/wallet.mapper';

@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post(':id/withdraw')
  @HttpCode(200)
  async withdraw(
    @Param('id') id: string,
    @Body() dto: WithdrawDto,
  ): Promise<WalletResponseDto> {
    const wallet = await this.walletService.withdraw(id, dto.amount, dto.currency);
    return WalletMapper.toResponse(wallet);
  }
}
```

### Service (thin wrapper)

```typescript
// src/application/wallet/services/wallet.service.ts
import { Injectable } from '@nestjs/common';
import { WithdrawUseCase } from '@/domain/wallet/use-cases/withdraw.use-case';
import { Money } from '@/domain/wallet/value-objects/money';

@Injectable()
export class WalletService {
  constructor(private readonly withdrawUseCase: WithdrawUseCase) {}

  async withdraw(walletId: string, amount: number, currency: string) {
    return this.withdrawUseCase.execute(walletId, Money.of(amount, currency));
  }
}
```

### DTOs

```typescript
// src/application/wallet/dtos/withdraw.dto.ts
import { IsInt, IsPositive, IsString, Length } from 'class-validator';

export class WithdrawDto {
  @IsInt()
  @IsPositive()
  amount!: number;

  @IsString()
  @Length(3, 10)
  currency!: string;
}
```

```typescript
// src/application/wallet/dtos/wallet-response.dto.ts
export class WalletResponseDto {
  id!: string;
  userId!: string;
  balance!: number;
  currency!: string;
  status!: string;
  createdAt!: string;
  updatedAt!: string;
}
```

### Mapper

```typescript
// src/application/wallet/mappers/wallet.mapper.ts
import { Wallet } from '@/domain/wallet/entities/wallet';
import { WalletResponseDto } from '../dtos/wallet-response.dto';

export class WalletMapper {
  static toResponse(w: Wallet): WalletResponseDto {
    return {
      id:        w.id,
      userId:    w.userId,
      balance:   Number(w.balance.amount),
      currency:  w.balance.currency,
      status:    w.status,
      createdAt: w.createdAt.toISOString(),
      updatedAt: w.updatedAt.toISOString(),
    };
  }
}
```

### Event Listener

```typescript
// src/application/wallet/listeners/on-wallet-withdrawal-created.listener.ts
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WalletWithdrawalCreatedEvent } from '@/domain/wallet/events/wallet-withdrawal-created.event';

@Injectable()
export class OnWalletWithdrawalCreatedListener {
  private readonly logger = new Logger(OnWalletWithdrawalCreatedListener.name);

  @OnEvent(WalletWithdrawalCreatedEvent.NAME, { async: true })
  async handle(event: WalletWithdrawalCreatedEvent): Promise<void> {
    this.logger.log(`Withdrawal: wallet=${event.walletId} amount=${event.amount}`);
    // send notification, update analytics, enqueue job, etc.
  }
}
```

---

## Infrastructure Layer Examples

### TypeORM Entity (persistence model — separate from domain entity)

```typescript
// src/infrastructure/persistence/entities/wallet.orm-entity.ts
import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'wallets' })
@Index(['userId'])
export class WalletOrmEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'bigint', default: '0', transformer: {
    to: (v: bigint) => v.toString(),
    from: (v: string) => BigInt(v),
  }})
  balance!: bigint;

  @Column({ type: 'varchar', length: 10, default: 'VND' })
  currency!: string;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
```

### Repository Implementation

```typescript
// src/infrastructure/persistence/repositories/wallet.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletOrmEntity } from '../entities/wallet.orm-entity';
import { WalletRepository } from '@/domain/wallet/ports/wallet.repository.port';
import { Wallet } from '@/domain/wallet/entities/wallet';
import { Money, WalletStatus } from '@/domain/wallet/value-objects/money';

@Injectable()
export class TypeOrmWalletRepository implements WalletRepository {
  constructor(
    @InjectRepository(WalletOrmEntity)
    private readonly repo: Repository<WalletOrmEntity>,
  ) {}

  async findById(id: string): Promise<Wallet | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async findByUserId(userId: string): Promise<Wallet | null> {
    const row = await this.repo.findOne({ where: { userId } });
    return row ? this.toEntity(row) : null;
  }

  async save(wallet: Wallet): Promise<void> {
    await this.repo.save(this.toOrm(wallet));
  }

  private toEntity(row: WalletOrmEntity): Wallet {
    return Wallet.restore({
      id:        row.id,
      userId:    row.userId,
      balance:   Money.of(row.balance, row.currency),
      status:    row.status as WalletStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private toOrm(w: Wallet): WalletOrmEntity {
    const orm = new WalletOrmEntity();
    orm.id        = w.id;
    orm.userId    = w.userId;
    orm.balance   = w.balance.amount;
    orm.currency  = w.balance.currency;
    orm.status    = w.status;
    orm.createdAt = w.createdAt;
    orm.updatedAt = w.updatedAt;
    return orm;
  }
}
```

### TypeORM Module

```typescript
// src/infrastructure/persistence/typeorm/typeorm.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule as NestTypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    NestTypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host:     config.getOrThrow<string>('DB_HOST'),
        port:     config.getOrThrow<number>('DB_PORT'),
        username: config.getOrThrow<string>('DB_USER'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_NAME'),
        entities: [__dirname + '/../entities/*.orm-entity{.ts,.js}'],
        migrations: [__dirname + '/../migrations/*{.ts,.js}'],
        migrationsRun: false,
        synchronize: false,
        logging: config.get<string>('NODE_ENV') !== 'production' ? ['error', 'warn'] : ['error'],
      }),
    }),
  ],
})
export class TypeOrmModule {}
```

### DataSource (for CLI / migrations)

```typescript
// src/infrastructure/persistence/typeorm/data-source.ts
import 'dotenv/config';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host:     process.env.DB_HOST!,
  port:     Number(process.env.DB_PORT),
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  entities:   [__dirname + '/../entities/*.orm-entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
});
```

### JWT Auth Guard + Strategy

```typescript
// src/infrastructure/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload { sub: string; email: string; }

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload) {
    return { id: payload.sub, email: payload.email };
  }
}
```

### Background Worker (BullMQ)

```typescript
// src/infrastructure/queue/processors/notification.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

export interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
}

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  async process(job: Job<NotificationPayload>): Promise<void> {
    const { userId, title, body } = job.data;
    // dispatch FCM / push notification
  }
}
```

---

## Global Configuration

### main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './infrastructure/http/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('v1');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({ origin: process.env.ALLOWED_ORIGINS?.split(',') });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
```

### Global Exception Filter

```typescript
// src/infrastructure/http/filters/all-exceptions.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from '@/domain/shared/domain-error';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      res.status(exception.getStatus()).json({
        success: false,
        error: exception.getResponse(),
      });
      return;
    }

    if (exception instanceof DomainError) {
      res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        success: false,
        error: { code: exception.code, message: exception.message },
      });
      return;
    }

    this.logger.error(exception);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
}
```

---

## Test Patterns

### Entity Tests (pure, no mocks)

```typescript
// test/domain/wallet/entities/wallet.spec.ts
import { Wallet } from '@/domain/wallet/entities/wallet';
import { Money } from '@/domain/wallet/value-objects/money';
import { InsufficientBalanceError } from '@/domain/wallet/errors';

describe('Wallet', () => {
  it('withdraws when balance is sufficient', () => {
    const w = Wallet.create('user-1');
    w.deposit(Money.of(10_000));

    w.withdraw(Money.of(5_000));

    expect(w.balance.amount).toBe(5_000n);
  });

  it('throws when balance is insufficient', () => {
    const w = Wallet.create('user-1');
    w.deposit(Money.of(1_000));

    expect(() => w.withdraw(Money.of(5_000))).toThrow(InsufficientBalanceError);
  });

  it('raises event on withdrawal', () => {
    const w = Wallet.create('user-1');
    w.deposit(Money.of(10_000));
    w.clearEvents();

    w.withdraw(Money.of(5_000));

    expect(w.events).toHaveLength(1);
  });
});
```

### Use-Case Tests (mock ports)

```typescript
// test/domain/wallet/use-cases/withdraw.use-case.spec.ts
import { WithdrawUseCase } from '@/domain/wallet/use-cases/withdraw.use-case';
import { Wallet } from '@/domain/wallet/entities/wallet';
import { Money } from '@/domain/wallet/value-objects/money';
import { WalletRepository } from '@/domain/wallet/ports/wallet.repository.port';

describe('WithdrawUseCase', () => {
  it('persists wallet after successful withdrawal', async () => {
    const wallet = Wallet.create('user-1');
    wallet.deposit(Money.of(10_000));

    const repo: jest.Mocked<WalletRepository> = {
      findById:     jest.fn().mockResolvedValue(wallet),
      findByUserId: jest.fn(),
      save:         jest.fn().mockResolvedValue(undefined),
    };

    const uc = new WithdrawUseCase(repo);
    const result = await uc.execute(wallet.id, Money.of(5_000));

    expect(result.balance.amount).toBe(5_000n);
    expect(repo.save).toHaveBeenCalledWith(wallet);
  });
});
```

### E2E Tests (Supertest)

```typescript
// test/wallet.e2e-spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@/app.module';

describe('POST /v1/wallets/:id/withdraw (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('returns 422 when balance is insufficient', () =>
    request(app.getHttpServer())
      .post('/v1/wallets/abc/withdraw')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 999999999, currency: 'VND' })
      .expect(422));
});
```

---

## Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Domain folder | kebab-case | `bank-account/` |
| File | kebab-case with suffix | `wallet.entity.ts`, `withdraw.use-case.ts` |
| Class | PascalCase | `Wallet`, `WithdrawUseCase` |
| Value object class | PascalCase | `Money`, `Email` |
| Port interface | PascalCase + `Repository`/`Client` | `WalletRepository` |
| Port token | SCREAMING_SNAKE_CASE as `Symbol` | `WALLET_REPOSITORY` |
| Use case class | PascalCase + `UseCase` | `WithdrawUseCase` |
| Service class | PascalCase + `Service` | `WalletService` |
| Controller class | PascalCase + `Controller` | `WalletController` |
| DTO | PascalCase + `Dto` | `WithdrawDto`, `WalletResponseDto` |
| Event class | PascalCase + `Event` | `WalletWithdrawalCreatedEvent` |
| Event constant (name) | `{domain}.{entity}.{action}` | `wallet.withdrawal.created` |
| Listener file | `on-{event-name}.listener.ts` | `on-wallet-withdrawal-created.listener.ts` |
| Constants | UPPER_SNAKE_CASE | `WALLET_REPOSITORY` |

---

## Check Scripts

```bash
DOMAIN={domain}

echo "=== Typecheck ==="
npx tsc --noEmit && echo "PASS" || echo "FAIL"

echo "=== Lint ==="
npx eslint "src/**/*.ts" && echo "PASS" || echo "FAIL"

echo "=== Domain Purity ==="
grep -rEn '"@nestjs/|"typeorm"|"@nestjs/typeorm|"ioredis|"bullmq|"firebase-admin|"passport' src/domain/$DOMAIN/ \
  && echo "FAIL: infra in domain" || echo "PASS"

echo "=== No Cross-Domain Imports ==="
for d in $(ls src/domain | grep -v shared | grep -v $DOMAIN); do
  grep -rEn "from '@/domain/$d" src/domain/$DOMAIN/ && echo "FAIL: imports domain/$d"
done

echo "=== Tests ==="
npx jest src/domain/$DOMAIN && echo "PASS" || echo "FAIL"
```

---

## Package Scripts

```json
{
  "scripts": {
    "dev":              "nest start --watch",
    "build":            "nest build",
    "start":            "node dist/main.js",
    "test":             "jest",
    "test:e2e":         "jest --config ./test/jest-e2e.json",
    "lint":             "eslint \"{src,test}/**/*.ts\" --fix",
    "typeorm":          "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js -d src/infrastructure/persistence/typeorm/data-source.ts",
    "migration:gen":    "pnpm typeorm migration:generate src/infrastructure/persistence/migrations/$NAME",
    "migration:create": "pnpm typeorm migration:create src/infrastructure/persistence/migrations/$NAME",
    "migration:run":    "pnpm typeorm migration:run",
    "migration:revert": "pnpm typeorm migration:revert"
  }
}
```

---

## When to Use What

| Scenario | Solution |
|----------|----------|
| New business capability | New domain with entities, ports, use-cases + NestJS module |
| Simple CRUD | Entity + repository port + single use-case |
| Complex validation | Pure validator classes in `domain/validators` |
| Background jobs | BullMQ processor in `infrastructure/queue/processors` |
| Real-time events | Socket.IO gateway + Redis adapter |
| Cross-domain communication | Domain events via `@nestjs/event-emitter` or BullMQ |
| File upload | S3/R2 adapter in `infrastructure/storage` |
| Push notifications | FCM service enqueued via BullMQ |
| Scheduled tasks | `@nestjs/schedule` + use-case invocation |

---

## Rules of Thumb

- Controllers are thin: parse DTO → call service → map to response DTO
- Services are thin: wrap one use-case call, convert primitives to value objects
- Business rules live ONLY in entities, value objects, and use-cases
- Repositories hide Prisma completely — use-cases never see `PrismaClient`
- Validate at boundaries (controller DTOs); trust types inside the app
- Prefer domain events over direct cross-module calls
