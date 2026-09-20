import '../../domain/entities/settings_entity.dart';
import '../../domain/repositories/isettings_repository.dart';
import '../datasources/settings_datasource.dart';

class SettingsRepository implements ISettingsRepository {
  final SettingsDatasource _datasource;
  SettingsRepository(this._datasource);

  @override
  Future<SettingsEntity> getSettings() async {
    return await _datasource.getSettings();
  }
}
