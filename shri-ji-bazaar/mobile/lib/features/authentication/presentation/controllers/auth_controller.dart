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
        print('AuthController: refresh failed - ${e.toString().replaceFirst("Exception: ", "")}');
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
    _user = UserEntity(
      id: data['id'],
      name: data['name'],
      mobile: data['mobile'],
      email: data['email'],
      referralCode: data['referral_code'],
    );
    _status = AuthStatus.authenticated;
    notifyListeners();
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
