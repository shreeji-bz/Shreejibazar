import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'app_colors.dart';

/// Owns the light/dark theme choice. LIGHT is the fixed default; dark is
/// opt-in via the Settings screen ("Dark Theme" toggle) and persists across
/// launches. Flipping it re-skins the whole app because every color flows
/// through [AppColors] (see app_colors.dart).
class ThemeController extends ChangeNotifier {
  ThemeController._(this._prefs) {
    isDark = AppColors.isDark;
  }

  final SharedPreferences _prefs;
  static const _key = 'sjb_theme_dark';

  late bool isDark;

  /// Restore the persisted choice (call once at startup, before runApp).
  static Future<ThemeController> init() async {
    final prefs = await SharedPreferences.getInstance();
    AppColors.isDark = prefs.getBool(_key) ?? false;
    return ThemeController._(prefs);
  }

  /// Set the mode and persist it. [notifyListeners] rebuilds the MaterialApp
  /// (consumed in main.dart) with the matching [AppTheme].
  Future<void> setDark(bool dark) async {
    if (AppColors.isDark == dark) {
      isDark = dark;
      return;
    }
    AppColors.isDark = dark;
    isDark = dark;
    await _prefs.setBool(_key, dark);
    notifyListeners();
  }

  void toggle() => setDark(!isDark);
}
