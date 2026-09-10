import '../entities/game_detail_entity.dart';

abstract class IGameDetailRepository {
  Future<GameDetailEntity> getGameDetail(String gameId);
}
