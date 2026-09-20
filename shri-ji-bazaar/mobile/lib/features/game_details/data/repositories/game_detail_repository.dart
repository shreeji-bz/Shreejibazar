import '../../domain/entities/game_detail_entity.dart';
import '../../domain/repositories/igame_detail_repository.dart';
import '../datasources/game_detail_datasource.dart';

class GameDetailRepository implements IGameDetailRepository {
  final GameDetailDatasource _datasource;

  GameDetailRepository(this._datasource);

  @override
  Future<GameDetailEntity> getGameDetail(String gameId) async {
    return await _datasource.getGameDetail(gameId);
  }
}
