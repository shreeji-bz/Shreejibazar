import 'dart:async';
import 'package:flutter/foundation.dart';
import '../../domain/usecases/get_home_data.dart';
import '../../../points/domain/usecases/get_wallet.dart';
import '../../../games/domain/entities/game_entity.dart';
import '../../domain/entities/banner_entity.dart';
import '../../../points/domain/entities/points_entity.dart';

class HomeController extends ChangeNotifier {
  final GetHomeData getHomeData;
  final GetWallet getWallet;

  List<GameEntity> _popularGames = [];
  List<BannerEntity> _banners = [];
  PointsEntity? _points;
  bool _isLoading = false;
  String? _errorMessage;
  Timer? _refreshTimer;

  List<GameEntity> get popularGames => List.unmodifiable(_popularGames);
  List<BannerEntity> get banners => List.unmodifiable(_banners);
  PointsEntity? get points => _points;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  HomeController(this.getHomeData, this.getWallet);

  Future<void> loadHomeData() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final homeData = await getHomeData();
      _banners = homeData['banners'] as List<BannerEntity>;
      _popularGames = homeData['popular'] as List<GameEntity>;

      try {
        _points = await getWallet();
      } catch (_e) {
        // Points fetch failure should not block the whole page
        debugPrint('Points fetch failed: $_e');
      }
    } catch (e) {
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refresh() async {
    await loadHomeData();
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }
}
