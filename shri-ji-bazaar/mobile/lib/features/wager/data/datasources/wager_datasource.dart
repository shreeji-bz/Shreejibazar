import '../../../../core/network/api_service.dart';
import '../../domain/entities/wager_entity.dart';
import '../models/wager_model.dart';

class WagerDatasource {
  final ApiService _api = ApiService();

  Future<WagerEntity> placeWager(Map<String, dynamic> data) async {
    final response = await _api.post('/wagers', data: data);
    return WagerModel.fromJson(response as Map<String, dynamic>);
  }

  Future<WagerListResponse> getWagerHistory({int page = 1, int limit = 20}) async {
    final data = await _api.get(
      '/wagers/history',
      queryParameters: {'page': page, 'limit': limit},
    );

    final responseMap = data as Map<String, dynamic>;
    final items = responseMap['wagers'] as List<dynamic>;
    final pagination = responseMap['pagination'] as Map<String, dynamic>;

    return WagerListResponse(
      wagers: items.map((e) => WagerModel.fromJson(e as Map<String, dynamic>)).toList(),
      page: pagination['page'] as int,
      limit: pagination['limit'] as int,
      total: pagination['total'] as int,
      totalPages: pagination['total_pages'] as int,
    );
  }

  Future<WagerEntity> getWagerById(String id) async {
    final response = await _api.get('/wagers/$id');
    return WagerModel.fromJson(response as Map<String, dynamic>);
  }
}
