import '../../../../core/network/api_service.dart';
import '../../domain/entities/banner_entity.dart';
import '../../domain/entities/game_entity.dart';
import '../models/banner_model.dart';

class HomeDatasource {
  final ApiService _api = ApiService();

  Future<List<BannerEntity>> getBanners() async {
    final data = await _api.get('/banners');
    return (data as List).map((e) => BannerModel.fromJson(e)).toList();
  }

  Future<List<GameEntity>> getPopularGames() async {
    final data = await _api.get('/games/popular');
    return (data as List).map((e) => GameEntity(
      id: e['id'] as String,
      name: e['name'] as String,
      slug: e['slug'] as String,
      description: e['description'] as String? ?? '',
      image: e['image'] as String? ?? '',
      openingTime: e['opening_time'] as String? ?? '',
      closingTime: e['closing_time'] as String? ?? '',
      resultTime: e['result_time'] as String? ?? '',
      status: e['status'] as String? ?? 'active',
      isPopular: e['is_popular'] as bool? ?? false,
      sortOrder: e['sort_order'] as int? ?? 0,
      createdAt: DateTime.parse(e['created_at'] as String),
      updatedAt: DateTime.parse(e['updated_at'] as String),
    )).toList();
  }

  Future<List<GameEntity>> getRecentGames() async {
    final data = await _api.get('/games/recent');
    return (data as List).map((e) => GameEntity(
      id: e['id'] as String,
      name: e['name'] as String,
      slug: e['slug'] as String,
      description: e['description'] as String? ?? '',
      image: e['image'] as String? ?? '',
      openingTime: e['opening_time'] as String? ?? '',
      closingTime: e['closing_time'] as String? ?? '',
      resultTime: e['result_time'] as String? ?? '',
      status: e['status'] as String? ?? 'active',
      isPopular: e['is_popular'] as bool? ?? false,
      sortOrder: e['sort_order'] as int? ?? 0,
      createdAt: DateTime.parse(e['created_at'] as String),
      updatedAt: DateTime.parse(e['updated_at'] as String),
    )).toList();
  }
}
