/// Central app configuration — the ONE place the API host lives.
///
/// Everything else in the app reads from this class, so there are no
/// scattered host literals to chase down.
///
/// Precedence:
///   1. Build flag (highest):  flutter run --dart-define=API_BASE_URL=https://...
///   2. The defaults below
///
/// These are the FINAL PRODUCTION values: a public https:// host, so the
/// built APK works on any device (client tests, store release). For
/// local dev you can still override with `--dart-define=API_BASE_URL=...`
/// (e.g. http://127.0.0.1:3000/api/v1 + `adb reverse`), but keep the
/// checked-in default pointing at the real backend.
class AppEnv {
  AppEnv._();

  /// >>> HOW THE APP REACHES THE BACKEND <<<
  /// The public production API. All REST calls in the app use this.
  static const String API_BASE_URL = 'https://api.shreejibazar.com/api/v1';

  /// Production WebSocket endpoint (used for live updates when a socket
  /// feature lands; reserved now so URLs stay central).
  static const String WS_BASE_URL = 'https://api.shreejibazar.com';

  /// App version shown to users / reported in telemetry. Keep in sync
  /// with `version:` in pubspec.yaml.
  static const String APP_VERSION = '1.0.0';
  /// -----------------------------------------

  /// We ship to clients, so the effective URL MUST be https — this throws
  /// at startup on any accidental cleartext (http:// or IP) default.
  static const bool REQUIRE_HTTPS = true;

  /// Build-flag override, e.g. flutter run --dart-define=API_BASE_URL=http://127.0.0.1:3000/api/v1
  static const String _buildTime = String.fromEnvironment('API_BASE_URL');

  /// Effective API base URL.
  static String get apiBaseUrl {
    final url = (_buildTime.isNotEmpty ? _buildTime : API_BASE_URL).trim();
    if (REQUIRE_HTTPS && !url.startsWith('https://')) {
      throw StateError(
        'AppEnv.REQUIRE_HTTPS is true but API_BASE_URL is not https: "$url". '
        'Use the production https host, or build with an explicit '
        '--dart-define for local dev.',
      );
    }
    return url;
  }
}
