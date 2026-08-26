import '../../domain/entities/settings_entity.dart';

abstract class ISettingsRepository {
  Future<SettingsEntity> getSettings();
}
