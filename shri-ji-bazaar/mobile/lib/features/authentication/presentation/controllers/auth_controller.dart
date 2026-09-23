import 'dart:async';
import 'package:flutter/foundation.dart';
import '../../../../../core/network/api_client.dart';
import '../../../../../core/storage/secure_storage.dart';
import '../../domain/entities/user_entity.dart';

enum AuthStatus { initial, loading, authenticated, unauthenticated, error }

class AuthController extends ChangeNotifier {
  AuthStatus _status = AuthStatus.initial;
  UserEntity? _user;
  String? _errorMessage;

  AuthStatus get status => _status;
  UserEntity? get user => _user;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _status == AuthStatus.authenticated;

  AuthController() {
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    final token = await SecureStorage.readToken();
    if (token == null || token.isEmpty) {
      _status = AuthStatus.unauthenticated;
      notifyListeners();
      return;
    }

    _status = AuthStatus.loading;
    notifyListeners();

    final cachedUser = await _loadCachedUser();
    if (cachedUser != null) {
      _user = cachedUser;
      _status = AuthStatus.authenticated;
      notifyListeners();
      return;
    }

    try {
      await fetchCurrentUser();
    } catch (_) {
      final refreshed = await _tryRefresh();
      if (refreshed) {
        await fetchCurrentUser();
      } else {
        await _silentLogout();
      }
    }
  }

  Future<UserEntity?> _loadCachedUser() async {
    try {
      final raw = await SecureStorage.readUser();
      if (raw == null) return null;
      return UserEntity(
        id: raw['id'] as String,
        name: raw['name'] as String,
        mobile: raw['mobile'] as String,
        email: raw['email'] as String? ?? '',
        referralCode: raw['referralCode'] as String? ?? '',
        status: raw['status'] as String? ?? 'active',
        createdAt: raw['createdAt'] != null ? DateTime.tryParse(raw['createdAt'].toString()) ?? DateTime.now() : DateTime.now(),
        updatedAt: raw['updatedAt'] != null ? DateTime.tryParse(raw['updatedAt'].toString()) ?? DateTime.now() : DateTime.now(),
      );
    } catch (_) {
      return null;
    }
  }

  Future<void> _cacheUser(UserEntity user) async {
    await SecureStorage.writeUser({
      'id': user.id,
      'name': user.name,
      'mobile': user.mobile,
      'email': user.email,
      'referralCode': user.referralCode,
      'status': user.status,
      'createdAt': user.createdAt?.toIso8601String() ?? DateTime.now().toIso8601String(),
      'updatedAt': user.updatedAt?.toIso8601String() ?? DateTime.now().toIso8601String(),
    });
  }

  Future<void> _applyUserFromApi(Map<String, dynamic> data) async {
    _user = UserEntity(
      id: data['id'] as String,
      name: data['name'] as String,
      mobile: data['mobile'] as String,
      email: data['email'] as String? ?? '',
      referralCode: data['referral_code'] as String? ?? data['referralCode'] as String? ?? '',
      status: data['status'] as String? ?? 'active',
      createdAt: data['created_at'] != null ? DateTime.tryParse(data['created_at'].toString()) ?? DateTime.now() : DateTime.now(),
      updatedAt: data['updated_at'] != null ? DateTime.tryParse(data['updated_at'].toString()) ?? DateTime.now() : DateTime.now(),
    );
    await _cacheUser(_user!);
    _status = AuthStatus.authenticated;
    notifyListeners();
  }

  Future<bool> _tryRefresh() async {
    final refreshToken = await SecureStorage.readRefreshToken();
    if (refreshToken == null || refreshToken.isEmpty) return false;

    try {
      final response = await ApiClient().dio.post('/auth/refresh', data: { 'refreshToken': refreshToken });
      final data = response.data['data'];
      await SecureStorage.writeToken(data['accessToken']);
      await SecureStorage.writeRefreshToken(data['refreshToken']);
      return true;
    } catch (e) {
      if (kDebugMode) {
        print('AuthController: refresh failed - ${e.toString().replaceFirst('Exception: ', '')}');
      }
      return false;
    }
  }

  Future<void> _silentLogout() async {
    await SecureStorage.deleteAll();
    _user = null;
    _status = AuthStatus.unauthenticated;
    _errorMessage = null;
    notifyListeners();
  }

  Future<void> register({
    required String name,
    required String mobile,
    required String password,
    String? referralCode,
  }) async {
    _status = AuthStatus.loading;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiClient().dio.post('/auth/register', data: {
        'name': name,
        'mobile': mobile,
        'password': password,
        'confirmPassword': password,
        if (referralCode != null && referralCode.isNotEmpty) 'referralCode': referralCode,
      });

      final data = response.data['data'];
      await SecureStorage.writeToken(data['accessToken']);
      await SecureStorage.writeRefreshToken(data['refreshToken']);

      // If a referral code was used, trigger referral bonus for the referrer
      if (referralCode != null && referralCode.isNotEmpty) {
        try {
          await ApiClient().dio.post('/referrals/apply', data: {
            'userId': data['user']['id'],
            'referralCode': referralCode,
          });
        } catch (_) {
          // Non-blocking: referral bonus failure should not fail registration
        }
      }

      _user = UserEntity(
        id: data['user']['id'],
        name: data['user']['name'],
        mobile: data['user']['mobile'],
        email: data['user']['email'],
        referralCode: data['user']['referralCode'],
        status: data['user']['status'] ?? 'active',
        createdAt: data['user']['createdAt'] != null ? DateTime.tryParse(data['user']['createdAt'].toString()) ?? DateTime.now() : DateTime.now(),
        updatedAt: data['user']['updatedAt'] != null ? DateTime.tryParse(data['user']['updatedAt'].toString()) ?? DateTime.now() : DateTime.now(),
      );
      await _cacheUser(_user!);
      _status = AuthStatus.authenticated;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
      _status = AuthStatus.error;
      notifyListeners();
    }
  }

  Future<void> login({required String mobile, required String password}) async {
    _status = AuthStatus.loading;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiClient().dio.post('/auth/login', data: {
        'mobile': mobile,
        'password': password,
      });

      final data = response.data['data'];
      await SecureStorage.writeToken(data['accessToken']);
      await SecureStorage.writeRefreshToken(data['refreshToken']);

      _user = UserEntity(
        id: data['user']['id'],
        name: data['user']['name'],
        mobile: data['user']['mobile'],
        email: data['user']['email'],
        referralCode: data['user']['referralCode'],
        status: data['user']['status'] ?? 'active',
        createdAt: data['user']['createdAt'] != null ? DateTime.tryParse(data['user']['createdAt'].toString()) ?? DateTime.now() : DateTime.now(),
        updatedAt: data['user']['updatedAt'] != null ? DateTime.tryParse(data['user']['updatedAt'].toString()) ?? DateTime.now() : DateTime.now(),
      );
      await _cacheUser(_user!);
      _status = AuthStatus.authenticated;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
      _status = AuthStatus.error;
      notifyListeners();
    }
  }

  Future<void> fetchCurrentUser() async {
    final response = await ApiClient().dio.get('/users/me');
    final data = response.data['data'];
    await _applyUserFromApi(data);
  }

  Future<void> forgotPassword(String mobile) async {
    _status = AuthStatus.loading;
    _errorMessage = null;
    notifyListeners();

    try {
      await ApiClient().dio.post('/auth/forgot-password', data: { 'mobile': mobile });
      _status = AuthStatus.unauthenticated;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
      _status = AuthStatus.error;
      notifyListeners();
    }
  }

  Future<void> resetPassword({
    required String mobile,
    required String resetCode,
    required String newPassword,
  }) async {
    _status = AuthStatus.loading;
    _errorMessage = null;
    notifyListeners();

    try {
      await ApiClient().dio.post('/auth/reset-password', data: {
        'mobile': mobile,
        'resetCode': resetCode,
        'newPassword': newPassword,
      });
      _status = AuthStatus.unauthenticated;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
      _status = AuthStatus.error;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    try {
      final token = await SecureStorage.readToken();
      if (token != null) {
        await ApiClient().dio.post('/auth/logout', data: { 'userId': _user?.id });
      }
    } catch (_) {
      // Ignore logout errors
    } finally {
      await _silentLogout();
    }
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
