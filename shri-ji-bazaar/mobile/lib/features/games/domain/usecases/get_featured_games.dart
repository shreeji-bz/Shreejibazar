import '../entities/game_entity.dart';
import '../repositories/igame_repository.dart';

class GetFeaturedGames {
  final IGameRepository _repository;
  GetFeaturedGames(this._repository);
  Future<List<GameEntity>> call() async => await _repository.getPopularGames();
}
