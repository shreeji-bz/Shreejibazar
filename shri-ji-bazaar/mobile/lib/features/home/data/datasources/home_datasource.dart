import '../../../../core/network/api_service.dart';
import '../../domain/entities/banner_entity.dart';
import '../models/banner_model.dart';
import '../../../games/domain/entities/game_entity.dart';
import '../../../games/data/models/game_model.dart';

class HomeDatasource {
  final ApiService _api = ApiService();

  Future<List<BannerEntity>> getBanners() async {
    final data = await _api.get('/banners');
    return (data as List).map((e) => BannerModel.fromJson(e)).toList();
  }

  Future<List<GameEntity>> getPopularGames() async {
    final data = await _api.get('/games/popular');
    return (data as List).map((e) => GameModel.fromJson(e)).toList();
  }

  Future<List<GameEntity>> getRecentGames() async {
    final data = await _api.get('/games/recent');
    return (data as List).map((e) => GameModel.fromJson(e)).toList();
  }
}
