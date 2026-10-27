/// Central app configuration — the ONE place the API host lives.
///
/// Update [API_BASE_URL] here whenever the backend moves (new IP, new domain).
/// Everything else in the app reads from this class, so there are no scattered
/// literals to chase down.
///
/// Precedence:
///   1. Build flag (highest):  flutter run --dart-define=API_BASE_URL=https://...
///   2. The default set below
///
/// Reachability rules:
///   - Same Wi-Fi as the backend machine -> use that machine's LAN IP
///     (e.g. http://10.205.236.19:3000/api/v1). This changes when the router
///     reassigns IPs, which is why you edit this file.
///   - Outside your network -> use a public https:// URL.
///
/// A real filesystem .env is NOT read here: a Dart build cannot access
/// mobile/.env at runtime on a phone, and shipping credentials in the APK
/// would be unsafe. This file is the intended place to keep config.
class AppEnv {
  AppEnv._();

  /// >>> CHANGE ME WHEN THE BACKEND MOVES <<<
  /// 2026-10-26: LAN address of the dev machine is now 10.27.174.76 (the router
  /// reissued it; it was 10.97.119.19, then 10.205.236.19). Keep in sync with
  /// [mobile/.env]. If register/home spin forever, check this IP against
  /// `ipconfig` on the backend machine.
  static const String API_BASE_URL = 'http://10.27.174.76:3000/api/v1';
  /// -----------------------------------------

  /// Flips on (throw) when [API_BASE_URL] is cleartext http, to catch
  /// accidental production builds. Keep false for LAN dev, set true once
  /// you have a real https:// host.
  static const bool REQUIRE_HTTPS = false;

  /// Build-flag override, e.g. flutter run --dart-define=API_BASE_URL=https://api.example.com/api/v1
  static const String _buildTime = String.fromEnvironment('API_BASE_URL');

  /// Effective API base URL.
  static String get apiBaseUrl {
    final url = (_buildTime.isNotEmpty ? _buildTime : API_BASE_URL).trim();
    if (REQUIRE_HTTPS && !url.startsWith('https://')) {
      throw StateError(
        'AppEnv.REQUIRE_HTTPS is true but API_BASE_URL is not https: "$url". '
        'Use an encrypted host for production, or set REQUIRE_HTTPS=false for LAN dev.',
      );
    }
    return url;
  }
}
