import 'dart:async';
import 'package:flutter/foundation.dart';
import '../../../games/domain/entities/game_entity.dart';
import '../../domain/usecases/get_games.dart';
import '../../domain/usecases/get_popular_games.dart';

class GameController extends ChangeNotifier {
  final GetGames getGames;
  final GetPopularGames getPopularGames;

  List<GameEntity> _games = [];
  List<GameEntity> _popularGames = [];
  bool _isLoadingAll = false;
  bool _isLoadingPopular = false;
  String? _errorMessage;
  Timer? _refreshTimer;

  List<GameEntity> get games => List.unmodifiable(_games);
  List<GameEntity> get popularGames => List.unmodifiable(_popularGames);
  bool get isLoadingAll => _isLoadingAll;
  bool get isLoadingPopular => _isLoadingPopular;
  bool get isLoading => _isLoadingAll || _isLoadingPopular;
  String? get errorMessage => _errorMessage;

  GameController(this.getGames, this.getPopularGames);

  Future<void> loadGames() async {
    if (_isLoadingAll) return;
    _isLoadingAll = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _games = await getGames();
      _errorMessage = null;
    } catch (e) {
      _errorMessage = _parseError(e);
      debugPrint('Failed to load games: $_errorMessage');
    } finally {
      _isLoadingAll = false;
      notifyListeners();
    }
  }

  Future<void> loadPopularGames() async {
    if (_isLoadingPopular) return;
    _isLoadingPopular = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _popularGames = await getPopularGames();
      _errorMessage = null;
    } catch (e) {
      _errorMessage = _parseError(e);
      debugPrint('Failed to load popular games: $_errorMessage');
    } finally {
      _isLoadingPopular = false;
      notifyListeners();
    }
  }

  Future<void> refresh() async {
    await Future.wait([
      loadGames(),
      loadPopularGames(),
    ]);
  }

  String _parseError(dynamic error) {
    final message = error.toString().replaceFirst('Exception: ', '');
    if (message.toLowerCase().contains('network') ||
        message.toLowerCase().contains('connection') ||
        message.toLowerCase().contains('socket') ||
        message.toLowerCase().contains('timeout')) {
      return 'No Internet Connection';
    }
    return message;
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
