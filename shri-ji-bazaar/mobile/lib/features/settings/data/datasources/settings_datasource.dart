import '../../../core/network/api_service.dart';

class SettingsDatasource {
  final ApiService _api = ApiService();

  Future<SettingsEntity> getSettings() async {
    final data = await _api.get('/settings');
    return SettingsModel.fromJson(data);
  }
}
