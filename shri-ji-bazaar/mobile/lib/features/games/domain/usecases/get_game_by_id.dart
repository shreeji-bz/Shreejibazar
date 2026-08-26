import '../../domain/entities/game_entity.dart';
import '../../domain/repositories/igame_repository.dart';

class GetGameById {
  final IGameRepository _repository;
  GetGameById(this._repository);
  Future<GameEntity> call(String id) async => await _repository.getGameById(id);
}
