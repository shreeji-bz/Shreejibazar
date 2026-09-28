import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter/foundation.dart';

class SupabaseConfig {
  static const String supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://your-project.supabase.co',
  );

  static const String supabasePublishableKey = String.fromEnvironment(
    'SUPABASE_PUBLISHABLE_KEY',
    defaultValue: 'your-publishable-key',
  );

  static Future<void> initialize() async {
    await Supabase.initialize(
      url: supabaseUrl,
      publishableKey: supabasePublishableKey,
      debug: kDebugMode,
    );
  }

  static SupabaseClient get client => Supabase.instance.client;

  static bool get isConfigured =>
      supabaseUrl != 'https://your-project.supabase.co' &&
      supabasePublishableKey != 'your-publishable-key';
}
