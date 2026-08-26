import '../../../core/network/api_service.dart';
import '../data/models/banner_model.dart';
import '../../games/data/models/game_model.dart';

class HomeDatasource {
  final ApiService _api = ApiService();

  Future<List<BannerEntity>> getBanners() async {
    final data = await _api.get('/banners');
    return (data as List).map((e) => BannerModel.fromJson(e)).toList();
  }

  Future<List<GameModel>> getPopularGames() async {
    final data = await _api.get('/games/popular');
    return (data as List).map((e) => GameModel.fromJson(e)).toList();
  }

  Future<List<GameModel>> getRecentGames() async {
    final data = await _api.get('/games/recent');
    return (data as List).map((e) => GameModel.fromJson(e)).toList();
  }
}
