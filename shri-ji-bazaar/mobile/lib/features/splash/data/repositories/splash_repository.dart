import '../../domain/entities/splash_entity.dart';
import '../../domain/repositories/isplash_repository.dart';
import '../datasources/splash_datasource.dart';

class SplashRepository implements ISplashRepository {
  final SplashDatasource _datasource;
  SplashRepository(this._datasource);

  @override
  Future<SplashEntity> checkAppStatus() async {
    return await _datasource.checkAppStatus();
  }
}
