import '../entities/banner_entity.dart';
import '../../../games/domain/entities/game_entity.dart';

abstract class IHomeRepository {
  Future<List<BannerEntity>> getBanners();
  Future<List<GameEntity>> getPopularGames();
  Future<List<GameEntity>> getRecentGames();
}
