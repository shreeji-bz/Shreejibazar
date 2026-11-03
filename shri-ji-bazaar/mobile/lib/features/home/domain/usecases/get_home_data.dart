import 'dart:async';
import 'package:flutter/foundation.dart';
import '../entities/banner_entity.dart';
import '../entities/game_entity.dart';
import '../repositories/ihome_repository.dart';

class GetHomeData {
  final IHomeRepository _repository;
  GetHomeData(this._repository);

  /// Loads banners + popular + recent games. Each part is fetched
  /// independently (in parallel) so that a failure in one part (e.g.
  /// malformed game rows) can never hide the others — banners keep
  /// showing even if the game list errors out.
  Future call() async {
    List<BannerEntity> banners = const [];
    List<GameEntity> popular = const [];
    List<GameEntity> recent = const [];

    final results = await Future.wait([
      _repository.getBanners().catchError((_) {
        debugPrint('banners fetch failed');
        return const <BannerEntity>[];
      }),
      _repository.getPopularGames().catchError((_) {
        debugPrint('popular games fetch failed');
        return const <GameEntity>[];
      }),
      _repository.getRecentGames().catchError((_) {
        debugPrint('recent games fetch failed');
        return const <GameEntity>[];
      }),
    ]);
    banners = results[0] as List<BannerEntity>;
    popular = results[1] as List<GameEntity>;
    recent = results[2] as List<GameEntity>;

    return {'banners': banners, 'popular': popular, 'recent': recent};
  }
}
