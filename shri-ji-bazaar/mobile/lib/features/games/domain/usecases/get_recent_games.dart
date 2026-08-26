import '../../domain/entities/game_entity.dart';
import '../../domain/repositories/igame_repository.dart';

class GetRecentGames {
  final IGameRepository _repository;
  GetRecentGames(this._repository);
  Future<List<GameEntity>> call() async => await _repository.getRecentGames();
}
