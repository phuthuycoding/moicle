# Flutter Mobile Structure

> Simple Feature-based architecture with Riverpod/Provider

## Project Structure

```
{project}/
├── lib/
│   ├── core/
│   │   ├── config/
│   │   │   ├── app_config.dart
│   │   │   ├── routes.dart
│   │   │   └── theme.dart
│   │   ├── services/
│   │   │   ├── api_client.dart
│   │   │   └── storage_service.dart
│   │   ├── utils/
│   │   │   ├── extensions.dart
│   │   │   └── validators.dart
│   │   └── widgets/                # Core widgets
│   ├── features/
│   │   └── {feature}/
│   │       ├── models/             # Data models
│   │       ├── providers/          # State management
│   │       ├── services/           # API calls
│   │       ├── screens/            # Screen widgets
│   │       └── widgets/            # Feature widgets
│   ├── shared/
│   │   ├── models/                 # Shared models
│   │   └── widgets/                # Shared widgets
│   ├── app.dart
│   └── main.dart
├── test/
├── assets/
│   ├── images/
│   └── fonts/
├── .claude/
├── CLAUDE.md
├── pubspec.yaml
└── analysis_options.yaml
```

## Architecture Pattern

```
Screen → Provider → Service → API
   ↓         ↓
Widget    Model
```

**Simple flow:**
1. Screen uses Provider for state
2. Provider manages state and calls Service
3. Service makes API calls
4. Model defines data structure

## Feature Structure

```
features/users/
├── models/
│   └── user.dart                   # User model
├── providers/
│   └── user_provider.dart          # State management
├── services/
│   └── user_service.dart           # API calls
├── screens/
│   ├── user_list_screen.dart
│   └── user_detail_screen.dart
└── widgets/
    ├── user_card.dart
    └── user_form.dart
```

## Key Files

### models/user.dart
```dart
class User {
  final String id;
  final String name;
  final String email;
  final DateTime createdAt;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
```

### services/user_service.dart
```dart
import '../models/user.dart';
import '../../core/services/api_client.dart';

class UserService {
  final ApiClient _api;

  UserService(this._api);

  Future<List<User>> getUsers() async {
    final response = await _api.get('/users');
    return (response['data'] as List)
        .map((json) => User.fromJson(json))
        .toList();
  }

  Future<User> getUserById(String id) async {
    final response = await _api.get('/users/$id');
    return User.fromJson(response['data']);
  }

  Future<User> createUser(Map<String, dynamic> data) async {
    final response = await _api.post('/users', data);
    return User.fromJson(response['data']);
  }

  Future<void> deleteUser(String id) async {
    await _api.delete('/users/$id');
  }
}
```

### providers/user_provider.dart (Riverpod)
```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user.dart';
import '../services/user_service.dart';

final userServiceProvider = Provider((ref) => UserService(ref.read(apiClientProvider)));

final usersProvider = FutureProvider<List<User>>((ref) async {
  final service = ref.read(userServiceProvider);
  return service.getUsers();
});

final userProvider = FutureProvider.family<User, String>((ref, id) async {
  final service = ref.read(userServiceProvider);
  return service.getUserById(id);
});
```

### providers/user_provider.dart (Provider alternative)
```dart
import 'package:flutter/material.dart';
import '../models/user.dart';
import '../services/user_service.dart';

class UserProvider extends ChangeNotifier {
  final UserService _service;

  List<User> _users = [];
  bool _isLoading = false;
  String? _error;

  List<User> get users => _users;
  bool get isLoading => _isLoading;
  String? get error => _error;

  UserProvider(this._service);

  Future<void> fetchUsers() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _users = await _service.getUsers();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
```

### screens/user_list_screen.dart
```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/user_provider.dart';
import '../widgets/user_card.dart';

class UserListScreen extends ConsumerWidget {
  const UserListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final usersAsync = ref.watch(usersProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Users')),
      body: usersAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text('Error: $error')),
        data: (users) => ListView.builder(
          itemCount: users.length,
          itemBuilder: (context, index) => UserCard(user: users[index]),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.pushNamed(context, '/users/new'),
        child: const Icon(Icons.add),
      ),
    );
  }
}
```

### core/services/api_client.dart
```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiClient {
  final String baseUrl;
  String? _token;

  ApiClient(this.baseUrl);

  void setToken(String token) => _token = token;

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_token != null) 'Authorization': 'Bearer $_token',
  };

  Future<Map<String, dynamic>> get(String path) async {
    final response = await http.get(
      Uri.parse('$baseUrl$path'),
      headers: _headers,
    );
    return jsonDecode(response.body);
  }

  Future<Map<String, dynamic>> post(String path, Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl$path'),
      headers: _headers,
      body: jsonEncode(data),
    );
    return jsonDecode(response.body);
  }

  Future<void> delete(String path) async {
    await http.delete(Uri.parse('$baseUrl$path'), headers: _headers);
  }
}
```

## Conventions

| Item | Convention | Example |
|------|------------|---------|
| File | snake_case | `user_service.dart` |
| Class | PascalCase | `UserService` |
| Variable | camelCase | `userName` |
| Provider | xxxProvider | `usersProvider` |
| Screen | XxxScreen | `UserListScreen` |

## State Management Options

| Option | Use Case |
|--------|----------|
| Riverpod | Recommended, compile-safe |
| Provider | Simple, familiar |
| BLoC | Complex state, events |
| GetX | Rapid development |

## When to Add More Structure

**Current pattern is enough for:**
- Small to medium apps
- CRUD operations
- Standard mobile apps

**Consider adding layers when:**
- Offline-first requirements
- Complex business rules
- Multiple data sources
