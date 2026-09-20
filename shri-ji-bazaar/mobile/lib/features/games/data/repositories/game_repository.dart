import '../../domain/entities/game_entity.dart';
import '../../domain/repositories/igame_repository.dart';
import '../datasources/game_datasource.dart';

class GameRepository implements IGameRepository {
  final GameDatasource _datasource;

  GameRepository(this._datasource);

  @override
  Future<List<GameEntity>> getPopularGames() async {
    return await _datasource.getPopularGames();
  }

  @override
  Future<List<GameEntity>> getRecentGames() async {
    return await _datasource.getRecentGames();
  }

  @override
  Future<GameEntity> getGameById(String id) async {
    return await _datasource.getGameById(id);
  }
}
