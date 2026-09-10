import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppTextStyles {
  // Display / Large heading
  static const TextStyle display = TextStyle(
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: AppColors.goldBright,
    height: 1.2,
    letterSpacing: 0.5,
  );

  // Main heading
  static const TextStyle heading = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.bold,
    color: AppColors.textPrimary,
    height: 1.3,
  );

  // Section heading
  static const TextStyle sectionHeading = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w600,
    color: AppColors.goldBright,
    height: 1.4,
  );

  // Card title
  static const TextStyle cardTitle = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
    height: 1.4,
  );

  // Body text
  static const TextStyle body = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.normal,
    color: AppColors.textSecondary,
    height: 1.5,
  );

  // Caption
  static const TextStyle caption = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.normal,
    color: AppColors.textMuted,
    height: 1.4,
  );

  // Small body text
  static const TextStyle bodySmall = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.normal,
    color: AppColors.textSecondary,
    height: 1.4,
  );

  // Button text
  static const TextStyle button = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
    height: 1.2,
    letterSpacing: 0.5,
  );

  // Gold text variant
  static const TextStyle goldHeading = TextStyle(
    fontSize: 22,
    fontWeight: FontWeight.bold,
    color: AppColors.goldBright,
    height: 1.3,
  );

  // Points display
  static const TextStyle points = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.bold,
    color: AppColors.goldBright,
    height: 1.2,
  );

  // Result number
  static const TextStyle resultNumber = TextStyle(
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: AppColors.goldBright,
    height: 1.2,
    letterSpacing: 4,
  );
}
