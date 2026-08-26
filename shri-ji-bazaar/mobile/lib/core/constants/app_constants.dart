class AppConstants {
  // App info
  static const String appName = 'Shri Ji Bazaar';
  static const String appVersion = '1.0.0';

  // API
  static const String apiBaseUrl = 'http://localhost:3000/api/v1';
  static const int connectTimeout = 30000;
  static const int receiveTimeout = 30000;

  // Points
  static const int minPointsPerPlay = 10;
  static const int maxPointsPerPlay = 1000;
  static const int welcomeBonus = 100;

  // Pagination
  static const int defaultPageSize = 20;

  // Storage keys
  static const String keyToken = 'auth_token';
  static const String keyRefreshToken = 'refresh_token';
  static const String keyUser = 'user_data';
  static const String keyOnboardingComplete = 'onboarding_complete';

  // Animation durations
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 400);
  static const Duration longAnimation = Duration(milliseconds: 800);
}
