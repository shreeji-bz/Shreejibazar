import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:shri_ji_bazaar/core/theme/app_colors.dart';
import 'package:shri_ji_bazaar/core/theme/app_theme.dart';
import 'package:shri_ji_bazaar/core/theme/theme_controller.dart';

void main() {
  group('AppColors light/dark switch', () {
    test('defaults to light', () {
      AppColors.isDark = false;
      expect(AppColors.background, const Color(0xFFF6F4EF));
      expect(AppColors.textPrimary, const Color(0xFF1A1608));
      expect(AppColors.card, const Color(0xFFFFFFFF));
    });

    test('dark mode swaps the palette to the original colors', () {
      AppColors.isDark = true;
      expect(AppColors.background, const Color(0xFF050505));
      expect(AppColors.textPrimary, const Color(0xFFFFFFFF));
      expect(AppColors.card, const Color(0xFF120C05));
    });

    test('status colors are identical in both modes', () {
      AppColors.isDark = false;
      final lightSuccess = AppColors.success;
      final lightError = AppColors.error;
      AppColors.isDark = true;
      expect(AppColors.success, lightSuccess);
      expect(AppColors.error, lightError);
      expect(AppColors.resultGreen, lightSuccess);
      AppColors.isDark = false;
    });

    test('gradients resolve per mode without const breakage', () {
      AppColors.isDark = false;
      expect(AppColors.goldGradient.colors, isNotEmpty);
      AppColors.isDark = true;
      expect(AppColors.goldGradient.colors, isNotEmpty);
      expect(AppColors.cardGradient.colors.length, 2);
      AppColors.isDark = false;
    });
  });

  group('AppTheme', () {
    test('light theme uses light brightness', () {
      AppColors.isDark = false;
      expect(AppTheme.light.brightness, Brightness.light);
      expect(AppTheme.current.brightness, Brightness.light);
    });

    test('dark theme + current follow AppColors.isDark', () {
      AppColors.isDark = true;
      expect(AppTheme.dark.brightness, Brightness.dark);
      expect(AppTheme.current.brightness, Brightness.dark);
      AppColors.isDark = false;
    });
  });
  group('ThemeController persistence', () {
    test('light is the default with no stored value', () async {
      SharedPreferences.setMockInitialValues({});
      AppColors.isDark = false;
      final tc = await ThemeController.init();
      expect(tc.isDark, false);
    });

    test('dark choice persists and restores', () async {
      SharedPreferences.setMockInitialValues({'sjb_theme_dark': true});
      AppColors.isDark = false;
      final tc = await ThemeController.init();
      expect(tc.isDark, true);
      expect(AppColors.background, const Color(0xFF050505)); // dark palette active
      await tc.setDark(false);
      expect(AppColors.isDark, false);
      AppColors.isDark = false;
    });

    test('toggle flips the global flag', () async {
      SharedPreferences.setMockInitialValues({});
      AppColors.isDark = false;
      final tc = await ThemeController.init();
      tc.toggle();
      expect(tc.isDark, true);
      tc.toggle();
      expect(tc.isDark, false);
    });
  });

}
