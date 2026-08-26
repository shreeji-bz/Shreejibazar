import '../../domain/entities/game_entity.dart';
import '../../domain/repositories/igame_repository.dart';

class GetPopularGames {
  final IGameRepository _repository;

  GetPopularGames(this._repository);

  Future<List<GameEntity>> call() async {
    return await _repository.getPopularGames();
  }
}

class GetRecentGames {
  final IGameRepository _repository;

  GetRecentGames(this._repository);

  Future<List<GameEntity>> call() async {
    return await _repository.getRecentGames();
  }
}

class GetGameById {
  final IGameRepository _repository;

  GetGameById(this._repository);

  Future<GameEntity> call(String id) async {
    return await _repository.getGameById(id);
  }
}
