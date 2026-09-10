import '../../../../core/network/api_service.dart';

class GameDetailDatasource {
  final ApiService _api = ApiService();

  Future<Map<String, dynamic>> getGameDetail(String gameId) async {
    return await _api.get('/games/$gameId');
  }
}
