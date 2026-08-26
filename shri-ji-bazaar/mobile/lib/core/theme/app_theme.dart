import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'app_colors.dart';
import 'app_text_styles.dart';

class AppTheme {
  static const String fontFamily = 'Roboto';

  static ThemeData get light => ThemeData(
    useMaterial3: true,
    fontFamily: fontFamily,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: AppColors.background,
    colorScheme: const ColorScheme.dark(
      primary: AppColors.gold,
      secondary: AppColors.goldDark,
      surface: AppColors.card,
      error: AppColors.error,
      onPrimary: AppColors.textPrimary,
      onSecondary: AppColors.textSecondary,
      onSurface: AppColors.textPrimary,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.background,
      elevation: 0,
      centerTitle: true,
      titleTextStyle: TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.bold,
        color: AppColors.goldBright,
        fontFamily: fontFamily,
      ),
      systemOverlayStyle: SystemUiOverlayStyle.light,
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: AppColors.card,
      selectedItemColor: AppColors.goldBright,
      unselectedItemColor: AppColors.textMuted,
      type: BottomNavigationBarType.fixed,
      elevation: 8,
    ),
    cardTheme: CardTheme(
      color: AppColors.card,
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AppColors.border, width: 0.5),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.gold,
        foregroundColor: AppColors.textPrimary,
        elevation: 4,
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        textStyle: AppTextStyles.button,
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.goldBright,
        side: const BorderSide(color: AppColors.goldDark, width: 1.5),
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.cardSecondary,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.gold, width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.error),
      ),
      hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 14),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    ),
    dialogTheme: DialogTheme(
      backgroundColor: AppColors.card,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: const BorderSide(color: AppColors.border),
      ),
    ),
    dividerTheme: const DividerThemeData(
      color: AppColors.divider,
      thickness: 1,
    ),
  );
}
