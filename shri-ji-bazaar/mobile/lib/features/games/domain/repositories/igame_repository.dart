import '../../domain/entities/game_entity.dart';

abstract class IGameRepository {
  Future<List<GameEntity>> getPopularGames();
  Future<List<GameEntity>> getRecentGames();
  Future<GameEntity> getGameById(String id);
}
