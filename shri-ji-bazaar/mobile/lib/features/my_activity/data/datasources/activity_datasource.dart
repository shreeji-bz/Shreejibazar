import '../../../../core/network/api_service.dart';
import '../../domain/entities/activity_entity.dart';

class ActivityDatasource {
  final ApiService _api = ApiService();

  Future<List<ActivityEntity>> getUserActivities({int page = 1, int limit = 20}) async {
    final data = await _api.get('/activities', queryParameters: {'page': page, 'limit': limit});
    return (data as List).map((e) => ActivityModel.fromJson(e)).toList();
  }
}
