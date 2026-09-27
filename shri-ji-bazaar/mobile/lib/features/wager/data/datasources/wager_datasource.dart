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

    final items = (data as List<dynamic>).map((e) => WagerModel.fromJson(e as Map<String, dynamic>)).toList();

    return WagerListResponse(
      wagers: items,
      page: page,
      limit: limit,
      total: items.length,
      totalPages: 1,
    );
  }

  Future<WagerEntity> getWagerById(String id) async {
    final response = await _api.get('/wagers/$id');
    return WagerModel.fromJson(response as Map<String, dynamic>);
  }
}
