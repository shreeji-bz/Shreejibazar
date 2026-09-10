import '../entities/game_entity.dart';
import '../repositories/igame_repository.dart';

class GetGames {
  final IGameRepository _repository;
  GetGames(this._repository);
  Future<List<GameEntity>> call() async => await _repository.getPopularGames();
}
