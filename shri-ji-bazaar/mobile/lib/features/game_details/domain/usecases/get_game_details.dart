import '../entities/game_detail_entity.dart';
import '../repositories/igame_detail_repository.dart';

class GetGameDetails {
  final IGameDetailRepository _repository;
  GetGameDetails(this._repository);
  Future<GameDetailEntity> call(String gameId) async => await _repository.getGameDetail(gameId);
}
