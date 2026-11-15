import 'package:flutter/foundation.dart';
import '../../domain/usecases/get_settings.dart';
import '../../data/datasources/settings_datasource.dart';

class SettingsController extends ChangeNotifier {
  final GetSettings getSettings;
  final SettingsDatasource _datasource;

  String _appName = 'Shri Ji Bazaar';
  String _description = 'Your ultimate gaming platform for exciting draws and big wins.';
  String _whatsapp = '';
  String _telegram = '';
  String _email = '';
  String _supportUrl = '';

  SettingsController(this.getSettings, SettingsDatasource? datasource)
      : _datasource = datasource ?? SettingsDatasource();

  String get appName => _appName;
  String get description => _description;
  String get whatsApp => _whatsapp;
  String get telegram => _telegram;
  String get email => _email;
  String get supportUrl => _supportUrl;

  Future<void> loadContact() async {
    try {
      final data = await _datasource.getPublicContact();
      if (data is Map) {
        _appName = data['app.name'] as String? ?? _appName;
        _description = data['app.description'] as String? ?? _description;
        _whatsapp = data['contact.whatsapp'] as String? ?? '';
        _telegram = data['contact.telegram'] as String? ?? '';
        _email = data['contact.email'] as String? ?? '';
        _supportUrl = data['contact.support_url'] as String? ?? '';
        notifyListeners();
      }
    } catch (_) {
      // keep defaults
    }
  }
}
