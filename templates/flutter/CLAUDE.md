# CLAUDE.md - Flutter Mobile App Template

## Project Overview

Cross-platform mobile application built with:
- **Flutter 3.x** - UI toolkit
- **Dart** - Programming language
- **Riverpod** - State management
- **GoRouter** - Navigation
- **Dio** - HTTP client
- **Freezed** - Code generation for immutable classes

## Quick Start

```bash
# Install dependencies
flutter pub get

# Generate code (freezed, json_serializable)
dart run build_runner build --delete-conflicting-outputs

# Run development
flutter run

# Run on specific device
flutter run -d chrome
flutter run -d ios
flutter run -d android

# Build release
flutter build apk
flutter build ios
flutter build web

# Run tests
flutter test
```

## Project Structure

```
{project_name}/
├── lib/
│   ├── core/                    # Core utilities
│   │   ├── config/
│   │   │   └── app_config.dart
│   │   ├── constants/
│   │   │   └── api_constants.dart
│   │   ├── network/
│   │   │   ├── api_client.dart
│   │   │   └── api_exceptions.dart
│   │   ├── router/
│   │   │   └── app_router.dart
│   │   └── theme/
│   │       └── app_theme.dart
│   ├── features/                # Feature modules
│   │   └── {feature}/
│   │       ├── data/
│   │       │   ├── models/
│   │       │   ├── repositories/
│   │       │   └── datasources/
│   │       ├── domain/
│   │       │   └── entities/
│   │       ├── presentation/
│   │       │   ├── providers/
│   │       │   ├── screens/
│   │       │   └── widgets/
│   │       └── {feature}.dart   # Barrel file
│   ├── shared/                  # Shared components
│   │   ├── widgets/
│   │   └── utils/
│   └── main.dart
├── test/
├── android/
├── ios/
├── web/
├── pubspec.yaml
└── analysis_options.yaml
```

## Key Patterns and Conventions

### File Naming
- Use `snake_case.dart` for all Dart files
- Feature barrel files: `{feature}.dart`
- Widgets: `{name}_widget.dart`
- Screens: `{name}_screen.dart`
- Providers: `{name}_provider.dart`

### Model Pattern (Freezed)

```dart
// features/users/data/models/user_model.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_model.freezed.dart';
part 'user_model.g.dart';

@freezed
class UserModel with _$UserModel {
  const factory UserModel({
    required String id,
    required String name,
    required String email,
    @JsonKey(name: 'created_at') DateTime? createdAt,
  }) = _UserModel;

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);
}

@freezed
class UserListResponse with _$UserListResponse {
  const factory UserListResponse({
    required List<UserModel> data,
    required int total,
    required int page,
    required int limit,
    @JsonKey(name: 'total_pages') required int totalPages,
  }) = _UserListResponse;

  factory UserListResponse.fromJson(Map<String, dynamic> json) =>
      _$UserListResponseFromJson(json);
}
```

### Repository Pattern

```dart
// features/users/data/repositories/user_repository.dart
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'user_repository.g.dart';

@riverpod
UserRepository userRepository(UserRepositoryRef ref) {
  return UserRepository(ref.watch(apiClientProvider));
}

class UserRepository {
  final ApiClient _apiClient;

  UserRepository(this._apiClient);

  Future<UserListResponse> getUsers({
    int page = 1,
    int limit = 10,
    String? search,
  }) async {
    final response = await _apiClient.get(
      '/users',
      queryParameters: {
        'page': page,
        'limit': limit,
        if (search != null) 'search': search,
      },
    );
    return UserListResponse.fromJson(response.data);
  }

  Future<UserModel> getUserById(String id) async {
    final response = await _apiClient.get('/users/$id');
    return UserModel.fromJson(response.data);
  }

  Future<UserModel> createUser(CreateUserDto data) async {
    final response = await _apiClient.post('/users', data: data.toJson());
    return UserModel.fromJson(response.data);
  }
}
```

### Provider Pattern (Riverpod)

```dart
// features/users/presentation/providers/users_provider.dart
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'users_provider.g.dart';

@riverpod
class UsersNotifier extends _$UsersNotifier {
  @override
  Future<UserListResponse> build({int page = 1}) async {
    final repository = ref.watch(userRepositoryProvider);
    return repository.getUsers(page: page);
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => ref.read(userRepositoryProvider).getUsers());
  }

  Future<void> createUser(CreateUserDto data) async {
    await ref.read(userRepositoryProvider).createUser(data);
    ref.invalidateSelf();
  }
}

// Simple state provider
@riverpod
class SelectedUser extends _$SelectedUser {
  @override
  UserModel? build() => null;

  void select(UserModel user) => state = user;
  void clear() => state = null;
}
```

### Screen Pattern

```dart
// features/users/presentation/screens/users_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class UsersScreen extends ConsumerWidget {
  const UsersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final usersAsync = ref.watch(usersNotifierProvider());

    return Scaffold(
      appBar: AppBar(
        title: const Text('Users'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => context.push('/users/new'),
          ),
        ],
      ),
      body: usersAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text('Error: $error')),
        data: (response) => RefreshIndicator(
          onRefresh: () => ref.read(usersNotifierProvider().notifier).refresh(),
          child: ListView.builder(
            itemCount: response.data.length,
            itemBuilder: (context, index) {
              final user = response.data[index];
              return UserListTile(
                user: user,
                onTap: () => context.push('/users/${user.id}'),
              );
            },
          ),
        ),
      ),
    );
  }
}
```

### Widget Pattern

```dart
// features/users/presentation/widgets/user_list_tile.dart
import 'package:flutter/material.dart';

class UserListTile extends StatelessWidget {
  final UserModel user;
  final VoidCallback? onTap;

  const UserListTile({
    super.key,
    required this.user,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: CircleAvatar(
        child: Text(user.name[0].toUpperCase()),
      ),
      title: Text(user.name),
      subtitle: Text(user.email),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}
```

### Router Configuration

```dart
// core/router/app_router.dart
import 'package:go_router/go_router.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'app_router.g.dart';

@riverpod
GoRouter appRouter(AppRouterRef ref) {
  return GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: '/users',
        builder: (context, state) => const UsersScreen(),
        routes: [
          GoRoute(
            path: 'new',
            builder: (context, state) => const CreateUserScreen(),
          ),
          GoRoute(
            path: ':id',
            builder: (context, state) {
              final id = state.pathParameters['id']!;
              return UserDetailScreen(userId: id);
            },
          ),
        ],
      ),
    ],
  );
}
```

## Adding New Feature

1. Create feature directory structure:
```bash
mkdir -p lib/features/{feature}/{data/{models,repositories,datasources},domain/entities,presentation/{providers,screens,widgets}}
```

2. Create model with Freezed (`data/models/{entity}_model.dart`)
3. Create repository (`data/repositories/{entity}_repository.dart`)
4. Create providers (`presentation/providers/{entity}_provider.dart`)
5. Create screens (`presentation/screens/{entity}_screen.dart`)
6. Create barrel file (`{feature}.dart`)
7. Add routes in `app_router.dart`
8. Run code generation: `dart run build_runner build`

## API Client

```dart
// core/network/api_client.dart
import 'package:dio/dio.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'api_client.g.dart';

@riverpod
ApiClient apiClient(ApiClientRef ref) {
  return ApiClient(baseUrl: AppConfig.apiBaseUrl);
}

class ApiClient {
  final Dio _dio;

  ApiClient({required String baseUrl}) : _dio = Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  )) {
    _dio.interceptors.add(LogInterceptor());
  }

  void setAuthToken(String token) {
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }

  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) {
    return _dio.get(path, queryParameters: queryParameters);
  }

  Future<Response> post(String path, {dynamic data}) {
    return _dio.post(path, data: data);
  }
}
```

## Configuration

### pubspec.yaml
```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_riverpod: ^2.4.0
  riverpod_annotation: ^2.3.0
  go_router: ^13.0.0
  dio: ^5.4.0
  freezed_annotation: ^2.4.0
  json_annotation: ^4.8.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  build_runner: ^2.4.0
  riverpod_generator: ^2.3.0
  freezed: ^2.4.0
  json_serializable: ^6.7.0
  flutter_lints: ^3.0.0
```

### Environment Config
```dart
// core/config/app_config.dart
class AppConfig {
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:8080/api',
  );

  static const bool isProduction = bool.fromEnvironment('PRODUCTION');
}
```

Run with environment:
```bash
flutter run --dart-define=API_BASE_URL=https://api.example.com
```

## Testing

```dart
// test/features/users/users_provider_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mocktail/mocktail.dart';

class MockUserRepository extends Mock implements UserRepository {}

void main() {
  late MockUserRepository mockRepository;

  setUp(() {
    mockRepository = MockUserRepository();
  });

  test('fetches users successfully', () async {
    when(() => mockRepository.getUsers()).thenAnswer(
      (_) async => UserListResponse(data: [testUser], total: 1, page: 1, limit: 10, totalPages: 1),
    );

    final container = ProviderContainer(
      overrides: [userRepositoryProvider.overrideWithValue(mockRepository)],
    );

    final result = await container.read(usersNotifierProvider().future);
    expect(result.data.length, 1);
  });
}
```
