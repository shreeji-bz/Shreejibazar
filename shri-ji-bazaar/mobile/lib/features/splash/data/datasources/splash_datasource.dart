import '../../../core/network/api_service.dart';
import '../../domain/entities/splash_entity.dart';

class SplashDatasource {
  final ApiService _api = ApiService();

  Future<SplashEntity> checkAppStatus() async {
    final data = await _api.get('/system/status');
    return SplashModel.fromJson(data);
  }
}
