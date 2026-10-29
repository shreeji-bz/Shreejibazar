import 'package:flutter/material.dart';

/// Dual-palette theme colors.
///
/// LIGHT is the fixed default (client requirement). Dark is opt-in via the
/// Settings screen — flipping [AppColors.isDark] swaps every palette member
/// below, and all ~290 `AppColors.*` call sites re-render with the other
/// palette automatically. Members are instance-backed getters (not const),
/// so each read follows the current mode.
class AppColors {
  AppColors._();

  /// False = light theme (default). Settings "Dark Theme" toggles this.
  static bool isDark = false;

  // Theme-dependent members.
  static Color get background => _cur.background;
  static Color get backgroundSecondary => _cur.backgroundSecondary;
  static Color get card => _cur.card;
  static Color get cardSecondary => _cur.cardSecondary;
  static Color get cardTertiary => _cur.cardTertiary;
  static Color get goldDark => _cur.goldDark;
  static Color get gold => _cur.gold;
  static Color get goldBright => _cur.goldBright;
  static Color get goldLight => _cur.goldLight;
  static Color get goldMuted => _cur.goldMuted;
  static Color get textPrimary => _cur.textPrimary;
  static Color get textSecondary => _cur.textSecondary;
  static Color get textMuted => _cur.textMuted;
  static Color get overlay => _cur.overlay;
  static Color get shimmer => _cur.shimmer;
  static Color get border => _cur.border;
  static Color get divider => _cur.divider;

  // Theme-independent (same in both modes).
  static const Color success = Color(0xFF25C85A);
  static const Color error = Color(0xFFE53935);
  static const Color warning = Color(0xFFFFA726);
  static const Color info = Color(0xFF42A5F5);
  static const Color resultRed = Color(0xFFE53935);
  static const Color resultGreen = Color(0xFF25C85A);
  static const Color resultViolet = Color(0xFF9C27B0);

  // Gradients (theme-aware: read the current palette colors).
  static LinearGradient get goldGradient => LinearGradient(
        colors: [goldDark, gold, goldDark],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );

  static LinearGradient get goldButtonGradient => LinearGradient(
        colors: const [Color(0xFF6B4A00), Color(0xFFB8860B), Color(0xFFDAA520)],
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
      );

  static LinearGradient get cardGradient => LinearGradient(
        colors: [cardSecondary, card],
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
      );

  static _Palette get _cur => isDark ? _dark : _light;
}

/// One concrete palette. All fields are static consts so each palette object
/// can be a `const` instance.
class _Palette {
  const _Palette({
    required this.background,
    required this.backgroundSecondary,
    required this.card,
    required this.cardSecondary,
    required this.cardTertiary,
    required this.goldDark,
    required this.gold,
    required this.goldBright,
    required this.goldLight,
    required this.goldMuted,
    required this.textPrimary,
    required this.textSecondary,
    required this.textMuted,
    required this.overlay,
    required this.shimmer,
    required this.border,
    required this.divider,
  });

  final Color background;
  final Color backgroundSecondary;
  final Color card;
  final Color cardSecondary;
  final Color cardTertiary;
  final Color goldDark;
  final Color gold;
  final Color goldBright;
  final Color goldLight;
  final Color goldMuted;
  final Color textPrimary;
  final Color textSecondary;
  final Color textMuted;
  final Color overlay;
  final Color shimmer;
  final Color border;
  final Color divider;
}

// Light palette — warm paper tones; golds tuned darker for contrast on white.
const _Palette _light = _Palette(
  background: Color(0xFFF6F4EF),
  backgroundSecondary: Color(0xFFFFFFFF),
  card: Color(0xFFFFFFFF),
  cardSecondary: Color(0xFFF1EDE3),
  cardTertiary: Color(0xFFEAE4D6),
  goldDark: Color(0xFF8A5A00),
  gold: Color(0xFFB8860B),
  goldBright: Color(0xFFA97800),
  goldLight: Color(0xFFD89B18),
  goldMuted: Color(0xFFC9A227),
  textPrimary: Color(0xFF1A1608),
  textSecondary: Color(0xFF5A5142),
  textMuted: Color(0xFF8A7E68),
  overlay: Color(0x66000000),
  shimmer: Color(0xFFEFEAE0),
  border: Color(0xFFD8D0BE),
  divider: Color(0xFFCFC7B4),
);

// Dark palette — the original colors, unchanged.
const _Palette _dark = _Palette(
  background: Color(0xFF050505),
  backgroundSecondary: Color(0xFF0A0A0A),
  card: Color(0xFF120C05),
  cardSecondary: Color(0xFF1A1005),
  cardTertiary: Color(0xFF211508),
  goldDark: Color(0xFF8A5A00),
  gold: Color(0xFFD89B18),
  goldBright: Color(0xFFC9A227),
  goldLight: Color(0xFFE8C547),
  goldMuted: Color(0xFFB8942B),
  textPrimary: Color(0xFFFFFFFF),
  textSecondary: Color(0xFFB8A98A),
  textMuted: Color(0xFF7A6E5A),
  overlay: Color(0x66000000),
  shimmer: Color(0xFF1A1005),
  border: Color(0xFF2A2008),
  divider: Color(0xFF1F1808),
);
