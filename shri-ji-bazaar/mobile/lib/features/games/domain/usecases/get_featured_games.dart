import '../../domain/entities/game_entity.dart';
import '../../domain/repositories/igame_repository.dart';

class GetFeaturedGames {
  final IGameRepository _repository;
  GetFeaturedGames(this._repository);
  Future<List<GameEntity>> call() async => await _repository.getPopularGames();
}
