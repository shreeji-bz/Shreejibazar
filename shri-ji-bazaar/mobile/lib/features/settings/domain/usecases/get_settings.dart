import '../../domain/entities/settings_entity.dart';
import '../../domain/repositories/isettings_repository.dart';

class GetSettings {
  final ISettingsRepository _repository;
  GetSettings(this._repository);
  Future<SettingsEntity> call() async => await _repository.getSettings();
}
