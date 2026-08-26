import '../data/models/settings_model.dart';

class SettingsRepository implements ISettingsRepository {
  final SettingsDatasource _datasource;
  SettingsRepository(this._datasource);

  @override
  Future<SettingsEntity> getSettings() async {
    return await _datasource.getSettings();
  }
}
