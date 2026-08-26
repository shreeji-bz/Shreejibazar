import '../../domain/entities/splash_entity.dart';

abstract class ISplashRepository {
  Future<SplashEntity> checkAppStatus();
}
