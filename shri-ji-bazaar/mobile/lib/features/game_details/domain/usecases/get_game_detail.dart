import '../../domain/entities/game_detail_entity.dart';
import '../../domain/repositories/igame_detail_repository.dart';

class GetGameDetail {
  final IGameDetailRepository _repository;
  GetGameDetail(this._repository);
  Future<GameDetailEntity> call(String gameId) async => await _repository.getGameDetail(gameId);
}
