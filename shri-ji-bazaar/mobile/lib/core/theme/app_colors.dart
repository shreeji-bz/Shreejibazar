import 'package:flutter/material.dart';

class AppColors {
  // Backgrounds
  static const Color background = Color(0xFF050505);
  static const Color backgroundSecondary = Color(0xFF0A0A0A);
  static const Color card = Color(0xFF120C05);
  static const Color cardSecondary = Color(0xFF1A1005);
  static const Color cardTertiary = Color(0xFF211508);

  // Gold palette
  static const Color goldDark = Color(0xFF8A5A00);
  static const Color gold = Color(0xFFD89B18);
  static const Color goldBright = Color(0xFFC9A227);
  static const Color goldLight = Color(0xFFE8C547);
  static const Color goldMuted = Color(0xFFB8942B);

  // Gradients
  static const LinearGradient goldGradient = LinearGradient(
    colors: [Color(0xFF8A5A00), Color(0xFFD89B18), Color(0xFF8A5A00)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient goldButtonGradient = LinearGradient(
    colors: [Color(0xFF6B4A00), Color(0xFFB8860B), Color(0xFFDAA520)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient cardGradient = LinearGradient(
    colors: [Color(0xFF1A1005), Color(0xFF120C05)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  // Text
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFFB8A98A);
  static const Color textMuted = Color(0xFF7A6E5A);

  // Status
  static const Color success = Color(0xFF25C85A);
  static const Color error = Color(0xFFE53935);
  static const Color warning = Color(0xFFFFA726);
  static const Color info = Color(0xFF42A5F5);

  // Game result colors
  static const Color resultRed = Color(0xFFE53935);
  static const Color resultGreen = Color(0xFF25C85A);
  static const Color resultViolet = Color(0xFF9C27B0);

  // Misc
  static const Color overlay = Color(0x66000000);
  static const Color shimmer = Color(0xFF1A1005);
  static const Color border = Color(0xFF2A2008);
  static const Color divider = Color(0xFF1F1808);
}
