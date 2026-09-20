import '../../domain/entities/banner_entity.dart';
import '../../../games/domain/entities/game_entity.dart';
import '../../domain/repositories/ihome_repository.dart';
import '../datasources/home_datasource.dart';

class HomeRepository implements IHomeRepository {
  final HomeDatasource _datasource;
  HomeRepository(this._datasource);

  @override
  Future<List<BannerEntity>> getBanners() async {
    return await _datasource.getBanners();
  }

  @override
  Future<List<GameEntity>> getPopularGames() async {
    return await _datasource.getPopularGames();
  }

  @override
  Future<List<GameEntity>> getRecentGames() async {
    return await _datasource.getRecentGames();
  }
}
