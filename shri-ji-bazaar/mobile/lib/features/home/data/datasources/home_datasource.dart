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
    return (data as List).map((e) => _gameEntityFrom(e)).toList();
  }

  Future<List<GameEntity>> getRecentGames() async {
    final data = await _api.get('/games/recent');
    return (data as List).map((e) => _gameEntityFrom(e)).toList();
  }

  /// Builds a GameEntity from one JSON object. Accepts both the backend's
  /// snake_case keys and camelCase aliases, and is null-safe on the new
  /// per-game fields (lastResult / lastResultAt / playConfig).
  GameEntity _gameEntityFrom(dynamic e) {
    final m = e as Map;
    final lastResult = m['last_result'] ?? m['lastResult'];
    final lastResultAt = m['last_result_at'] ?? m['lastResultAt'];
    final playConfig = m['play_config'] ?? m['playConfig'];
    return GameEntity(
      id: m['id'] as String,
      name: m['name'] as String,
      slug: m['slug'] as String,
      description: m['description'] as String? ?? '',
      image: m['image'] as String? ?? '',
      openingTime: m['opening_time'] as String? ?? '',
      closingTime: m['closing_time'] as String? ?? '',
      resultTime: m['result_time'] as String? ?? '',
      status: m['status'] as String? ?? 'active',
      isPopular: m['is_popular'] as bool? ?? false,
      sortOrder: m['sort_order'] as int? ?? 0,
      createdAt: DateTime.parse(m['created_at'] as String),
      updatedAt: DateTime.parse(m['updated_at'] as String),
      lastResult: lastResult == null ? null : lastResult.toString(),
      lastResultAt: lastResultAt == null ? null : lastResultAt.toString(),
      playConfig: playConfig is Map ? Map<String, dynamic>.from(playConfig) : null,
    );
  }
}
