import '../entities/splash_entity.dart';
import '../repositories/isplash_repository.dart';

class CheckAppUpdate {
  final ISplashRepository _repository;
  CheckAppUpdate(this._repository);
  Future<SplashEntity> call() async => await _repository.checkAppStatus();
}
