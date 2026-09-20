import '../../../../core/network/api_service.dart';
import '../../domain/entities/game_detail_entity.dart';
import '../models/game_detail_model.dart';

class GameDetailDatasource {
  final ApiService _api = ApiService();

  Future<GameDetailEntity> getGameDetail(String gameId) async {
    final data = await _api.get('/games/$gameId');
    return GameDetailModel.fromJson(data);
  }
}
