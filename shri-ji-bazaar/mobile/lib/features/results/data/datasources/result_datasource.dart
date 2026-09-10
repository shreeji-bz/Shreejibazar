import '../../../../core/network/api_service.dart';
import '../../domain/entities/result_entity.dart';

class ResultDatasource {
  final ApiService _api = ApiService();

  Future<List<ResultEntity>> getLatestResults({int page = 1, int limit = 20}) async {
    final data = await _api.get('/results/latest', queryParameters: {'page': page, 'limit': limit});
    return (data as List).map((e) => ResultModel.fromJson(e)).toList();
  }

  Future<List<ResultEntity>> getResultsByGame(String gameId, {int page = 1, int limit = 20}) async {
    final data = await _api.get('/results/game/$gameId', queryParameters: {'page': page, 'limit': limit});
    return (data as List).map((e) => ResultModel.fromJson(e)).toList();
  }
}
