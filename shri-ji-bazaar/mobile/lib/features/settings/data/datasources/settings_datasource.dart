import '../../../../core/network/api_service.dart';
import '../../domain/entities/settings_entity.dart';
import '../models/settings_model.dart';

class SettingsDatasource {
  final ApiService _api = ApiService();

  Future<SettingsEntity> getSettings() async {
    final data = await _api.get('/settings');
    return SettingsModel.fromJson(data);
  }

  Future<Map<String, dynamic>> getPublicContact() async {
    final data = await _api.get('/settings/public/contact');
    return Map<String, dynamic>.from(data as Map);
  }
}
