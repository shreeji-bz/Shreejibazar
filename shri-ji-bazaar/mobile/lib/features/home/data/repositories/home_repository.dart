import '../../../games/data/models/game_model.dart';
import '../models/banner_model.dart';

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
