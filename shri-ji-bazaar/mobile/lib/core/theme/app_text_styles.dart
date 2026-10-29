import 'package:flutter/material.dart';
import 'app_colors.dart';

/// Text styles that follow the active theme: colors resolve through
/// [AppColors] at build time, so switching light/dark re-skins them all.
class AppTextStyles {
  // Display / Large heading
  static TextStyle get display => TextStyle(
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: AppColors.goldBright,
    height: 1.2,
    letterSpacing: 0.5,
  );

  // Main heading
  static TextStyle get heading => TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.bold,
    color: AppColors.textPrimary,
    height: 1.3,
  );

  // Section heading
  static TextStyle get sectionHeading => TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w600,
    color: AppColors.goldBright,
    height: 1.4,
  );

  // Card title
  static TextStyle get cardTitle => TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
    height: 1.4,
  );

  // Body text
  static TextStyle get body => TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.normal,
    color: AppColors.textSecondary,
    height: 1.5,
  );

  // Caption
  static TextStyle get caption => TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.normal,
    color: AppColors.textMuted,
    height: 1.4,
  );

  // Small body text
  static TextStyle get bodySmall => TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.normal,
    color: AppColors.textSecondary,
    height: 1.4,
  );

  // Button text
  static TextStyle get button => TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: Colors.white,
    height: 1.2,
    letterSpacing: 0.5,
  );

  // Gold text variant
  static TextStyle get goldHeading => TextStyle(
    fontSize: 22,
    fontWeight: FontWeight.bold,
    color: AppColors.goldBright,
    height: 1.3,
  );

  // App name / brand
  static TextStyle get appName => TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.w800,
    color: AppColors.gold,
    height: 1.2,
    letterSpacing: 2,
  );

  // Banner title
  static final TextStyle bannerTitle = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.w800,
    color: Colors.white,
    height: 1.3,
  );

  // Market title
  static TextStyle get marketTitle => TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w700,
    color: AppColors.goldBright,
    height: 1.3,
  );

  // Points display
  static TextStyle get points => TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.bold,
    color: AppColors.goldBright,
    height: 1.2,
  );

  // Result number
  static TextStyle get resultNumber => TextStyle(
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: AppColors.goldBright,
    height: 1.2,
    letterSpacing: 4,
  );
}
