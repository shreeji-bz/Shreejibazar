import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorage {
  static const FlutterSecureStorage _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
  );

  static const String _keyToken = 'auth_token';
  static const String _keyRefreshToken = 'refresh_token';
  static const String _keyUser = 'cached_user';

  static Future<void> writeToken(String token) async {
    await _storage.write(key: _keyToken, value: token);
  }

  static Future<String?> readToken() async {
    return await _storage.read(key: _keyToken);
  }

  static Future<void> writeRefreshToken(String token) async {
    await _storage.write(key: _keyRefreshToken, value: token);
  }

  static Future<String?> readRefreshToken() async {
    return await _storage.read(key: _keyRefreshToken);
  }

  static Future<void> writeUser(Map<String, dynamic> user) async {
    await _storage.write(key: _keyUser, value: jsonEncode(user));
  }

  static Future<Map<String, dynamic>?> readUser() async {
    final raw = await _storage.read(key: _keyUser);
    if (raw == null) return null;
    try {
      return Map<String, dynamic>.from(jsonDecode(raw));
    } catch (_) {
      return null;
    }
  }

  static Future<void> deleteToken() async {
    await _storage.delete(key: _keyToken);
  }

  static Future<void> deleteRefreshToken() async {
    await _storage.delete(key: _keyRefreshToken);
  }

  static Future<void> deleteAll() async {
    await _storage.deleteAll();
  }
}
