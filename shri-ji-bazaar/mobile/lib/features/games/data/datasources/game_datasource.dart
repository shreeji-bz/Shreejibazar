import '../../../../core/network/api_service.dart';
import '../../domain/entities/game_entity.dart';

class GameDatasource {
  final ApiService _api = ApiService();

  Future<List<GameEntity>> getPopularGames() async {
    final data = await _api.get('/games/popular');
    return (data as List).map((e) => GameModel.fromJson(e)).toList();
  }

  Future<List<GameEntity>> getRecentGames() async {
    final data = await _api.get('/games/recent');
    return (data as List).map((e) => GameModel.fromJson(e)).toList();
  }

  Future<GameEntity> getGameById(String id) async {
    final data = await _api.get('/games/$id');
    return GameModel.fromJson(data);
  }
}
