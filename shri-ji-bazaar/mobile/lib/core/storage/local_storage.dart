import 'package:shared_preferences/shared_preferences.dart';

class LocalStorage {
  static const String _keyToken = 'token';
  static const String _keyRefreshToken = 'refresh_token';
  static const String _keyUser = 'user_data';
  static const String _keyOnboarding = 'onboarding_done';

  static Future<SharedPreferences> get _instance async => await SharedPreferences.getInstance();

  static Future<String?> getToken() async {
    final prefs = await _instance;
    return prefs.getString(_keyToken);
  }

  static Future<void> setToken(String token) async {
    final prefs = await _instance;
    await prefs.setString(_keyToken, token);
  }

  static Future<String?> getRefreshToken() async {
    final prefs = await _instance;
    return prefs.getString(_keyRefreshToken);
  }

  static Future<void> setRefreshToken(String token) async {
    final prefs = await _instance;
    await prefs.setString(_keyRefreshToken, token);
  }

  static Future<void> clearTokens() async {
    final prefs = await _instance;
    await prefs.remove(_keyToken);
    await prefs.remove(_keyRefreshToken);
  }

  static Future<void> setOnboardingComplete() async {
    final prefs = await _instance;
    await prefs.setBool(_keyOnboarding, true);
  }

  static Future<bool> isOnboardingComplete() async {
    final prefs = await _instance;
    return prefs.getBool(_keyOnboarding) ?? false;
  }

  static Future<void> clearAll() async {
    final prefs = await _instance;
    await prefs.clear();
  }
}
