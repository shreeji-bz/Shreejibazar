import 'package:flutter/foundation.dart';
import '../../domain/entities/game_detail_entity.dart';
import '../../domain/usecases/get_game_detail.dart';

class GameDetailsController extends ChangeNotifier {
  final GetGameDetail getGameDetail;

  GameDetailsController(this.getGameDetail);

  GameDetailEntity? _game;
  bool _isLoading = false;
  String? _errorMessage;
  final List<String> _playTypes = ['Single', 'Jodi', 'Panel', 'Double'];
  String _selectedPlayType = 'Single';

  GameDetailEntity? get game => _game;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  List<String> get playTypes => _playTypes;
  String get selectedPlayType => _selectedPlayType;
  bool get hasData => _game != null;

  String get gameName => _game?.name ?? '';
  String get gameStatus => _game?.status ?? 'inactive';
  String get openingTime => _game?.openingTime ?? '';
  String get closingTime => _game?.closingTime ?? '';
  String get resultTime => _game?.resultTime ?? '';

  Future<void> loadGameDetail(String gameId) async {
    if (gameId.isEmpty) {
      _errorMessage = 'Invalid game ID';
      notifyListeners();
      return;
    }

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final detail = await getGameDetail(gameId);
      _game = detail;
      _errorMessage = null;
    } catch (e) {
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
      _game = null;
      if (kDebugMode) {
        print('GameDetailsController: Failed to load game detail - $_errorMessage');
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void setPlayType(String type) {
    if (_playTypes.contains(type)) {
      _selectedPlayType = type;
      notifyListeners();
    }
  }
}