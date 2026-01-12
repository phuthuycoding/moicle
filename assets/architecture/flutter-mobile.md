# Flutter Mobile Structure

> Reference: [Clean Architecture](./clean-architecture.md)

## Project Structure

```
{project}/
├── lib/
│   ├── core/
│   │   ├── config/
│   │   │   ├── app_config.dart
│   │   │   ├── routes.dart
│   │   │   └── di.dart             # Dependency injection
│   │   ├── theme/
│   │   │   ├── app_theme.dart
│   │   │   ├── colors.dart
│   │   │   └── typography.dart
│   │   ├── constants/
│   │   │   ├── api_constants.dart
│   │   │   └── app_constants.dart
│   │   ├── errors/
│   │   │   ├── failures.dart
│   │   │   └── exceptions.dart
│   │   └── utils/
│   │       ├── extensions.dart
│   │       └── validators.dart
│   ├── features/
│   │   └── {feature}/
│   │       ├── domain/
│   │       │   ├── entities/
│   │       │   ├── repositories/
│   │       │   └── use_cases/
│   │       ├── data/
│   │       │   ├── models/
│   │       │   ├── datasources/
│   │       │   └── repositories/
│   │       └── presentation/
│   │           ├── bloc/           # or provider/riverpod
│   │           ├── pages/
│   │           └── widgets/
│   ├── shared/
│   │   ├── domain/
│   │   │   └── entities/
│   │   ├── data/
│   │   │   ├── models/
│   │   │   └── services/
│   │   └── presentation/
│   │       └── widgets/
│   ├── app.dart
│   └── main.dart
├── test/
│   ├── unit/
│   ├── widget/
│   └── integration/
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
├── .claude/
│   └── agents/
├── CLAUDE.md
├── pubspec.yaml
├── analysis_options.yaml
└── README.md
```

## Feature Module Pattern

```
features/{feature}/
├── domain/
│   ├── entities/
│   │   └── user.dart
│   ├── repositories/
│   │   └── user_repository.dart    # Abstract
│   └── use_cases/
│       ├── get_users.dart
│       └── create_user.dart
├── data/
│   ├── models/
│   │   └── user_model.dart         # Extends entity
│   ├── datasources/
│   │   ├── user_remote_ds.dart
│   │   └── user_local_ds.dart
│   └── repositories/
│       └── user_repository_impl.dart
└── presentation/
    ├── bloc/
    │   ├── user_bloc.dart
    │   ├── user_event.dart
    │   └── user_state.dart
    ├── pages/
    │   ├── user_list_page.dart
    │   └── user_detail_page.dart
    └── widgets/
        ├── user_card.dart
        └── user_form.dart
```

## Key Files

### lib/main.dart
```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await configureDependencies();
  runApp(const App());
}
```

### lib/app.dart
```dart
class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      routerConfig: appRouter,
    );
  }
}
```

### Use Case Pattern
```dart
// domain/use_cases/get_users.dart
class GetUsers {
  final UserRepository repository;

  GetUsers(this.repository);

  Future<Either<Failure, List<User>>> call() async {
    return await repository.getUsers();
  }
}
```

### BLoC Pattern
```dart
// presentation/bloc/user_bloc.dart
class UserBloc extends Bloc<UserEvent, UserState> {
  final GetUsers getUsers;

  UserBloc({required this.getUsers}) : super(UserInitial()) {
    on<LoadUsers>(_onLoadUsers);
  }

  Future<void> _onLoadUsers(LoadUsers event, Emitter<UserState> emit) async {
    emit(UserLoading());
    final result = await getUsers();
    result.fold(
      (failure) => emit(UserError(failure.message)),
      (users) => emit(UserLoaded(users)),
    );
  }
}
```

## Conventions

| Item | Convention | Example |
|------|------------|---------|
| File | snake_case | `user_bloc.dart` |
| Class | PascalCase | `UserBloc` |
| Variable | camelCase | `userName` |
| Constant | lowerCamelCase | `defaultPadding` |
| Private | _prefix | `_privateMethod` |

## State Management Options

| Option | Use Case |
|--------|----------|
| BLoC | Complex state, large apps |
| Riverpod | Modern, compile-safe |
| Provider | Simple, quick setup |
| GetX | Rapid development |
