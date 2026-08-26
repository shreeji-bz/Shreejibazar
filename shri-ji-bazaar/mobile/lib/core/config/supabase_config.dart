import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter/foundation.dart';

class SupabaseConfig {
  static const String supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://your-project.supabase.co',
  );

  static const String supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: 'your-anon-key',
  );

  static Future<void> initialize() async {
    await Supabase.initialize(
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
      debug: kDebugMode,
    );
  }

  static SupabaseClient get client => Supabase.instance.client;

  static bool get isConfigured =>
      supabaseUrl != 'https://your-project.supabase.co' &&
      supabaseAnonKey != 'your-anon-key';
}
