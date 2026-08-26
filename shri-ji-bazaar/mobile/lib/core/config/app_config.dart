import 'package:flutter/foundation.dart';

class AppConfig {
  static const String appName = 'Shri Ji Bazaar';
  static const String appVersion = '1.0.0';

  static bool get isDebug => kDebugMode;
  static bool get isRelease => kReleaseMode;
}
