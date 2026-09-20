import 'dart:async';
import 'package:flutter/foundation.dart';
import '../../domain/entities/wager_entity.dart';
import '../../domain/usecases/place_wager.dart';
import '../../domain/usecases/get_wager_history.dart';
import '../../domain/entities/place_wager_params.dart';

class WagerController extends ChangeNotifier {
  final PlaceWager _placeWager;
  final GetWagerHistory _getWagerHistory;

  // State
  bool _isLoading = false;
  bool _isPlacingWager = false;
  String? _errorMessage;
  WagerEntity? _selectedWager;
  List<WagerEntity> _wagerHistory = [];
  int _currentPage = 1;
  int _totalPages = 1;
  bool _hasMore = false;
  int _balance = 0;

  // Form state
  String? _selectedPlayType;
  String _enteredNumber = '';
  String _stakeAmount = '';
  int _potentialPayout = 0;
  String _gameId = '';
  String _roundId = '';

  // Play type multipliers for payout calculation
  static const Map<String, double> _multipliers = {
    'Single': 9.0,
    'Jodi': 90.0,
    'Panel': 150.0,
    'Double': 180.0,
  };

  static const Map<String, int> _minimumStakes = {
    'Single': 10,
    'Jodi': 10,
    'Panel': 10,
    'Double': 10,
  };

  WagerController(this._placeWager, this._getWagerHistory);

  // Getters
  bool get isLoading => _isLoading;
  bool get isPlacingWager => _isPlacingWager;
  String? get errorMessage => _errorMessage;
  WagerEntity? get selectedWager => _selectedWager;
  List<WagerEntity> get wagerHistory => List.unmodifiable(_wagerHistory);
  int get currentPage => _currentPage;
  int get totalPages => _totalPages;
  bool get hasMore => _hasMore;
  int get balance => _balance;
  String? get selectedPlayType => _selectedPlayType;
  String get enteredNumber => _enteredNumber;
  String get stakeAmount => _stakeAmount;
  int get potentialPayout => _potentialPayout;
  bool get isPlacing => _isPlacingWager;
  String get gameId => _gameId;
  String get roundId => _roundId;

  bool get canPlaceWager {
    if (_selectedPlayType == null || _enteredNumber.isEmpty || _stakeAmount.isEmpty) {
      return false;
    }
    final stake = int.tryParse(_stakeAmount);
    if (stake == null || stake <= 0) return false;
    if (stake < _minimumStakes[_selectedPlayType]!) return false;
    if (stake > _balance) return false;
    return true;
  }

  void setBalance(int balance) {
    _balance = balance;
    notifyListeners();
  }

  void setPlayType(String? type) {
    _selectedPlayType = type;
    _calculatePayout();
    notifyListeners();
  }

  void setNumber(String value) {
    _enteredNumber = value;
    _calculatePayout();
    notifyListeners();
  }

  void setStake(String value) {
    _stakeAmount = value;
    _calculatePayout();
    notifyListeners();
  }

  void _calculatePayout() {
    if (_selectedPlayType == null || _enteredNumber.isEmpty || _stakeAmount.isEmpty) {
      _potentialPayout = 0;
      return;
    }

    final stake = int.tryParse(_stakeAmount);
    if (stake == null || stake <= 0) {
      _potentialPayout = 0;
      return;
    }

    final multiplier = _multipliers[_selectedPlayType] ?? 1.0;
    _potentialPayout = (stake * multiplier).round();
  }

  String? validateNumber(String? value) {
    if (value == null || value.isEmpty) return 'Please enter a number';
    if (_selectedPlayType == 'Single') {
      if (value.length != 1 || !RegExp(r'^[0-9]$').hasMatch(value)) {
        return 'Enter a single digit (0-9)';
      }
    } else if (_selectedPlayType == 'Jodi') {
      if (value.length != 2 || !RegExp(r'^[0-9]{2}$').hasMatch(value)) {
        return 'Enter a 2-digit number';
      }
    } else if (_selectedPlayType == 'Panel') {
      if (value.length != 3 || !RegExp(r'^[0-9]{3}$').hasMatch(value)) {
        return 'Enter a 3-digit number';
      }
    } else if (_selectedPlayType == 'Double') {
      if (value.length != 4 || !RegExp(r'^[0-9]{4}$').hasMatch(value)) {
        return 'Enter a 4-digit number';
      }
    }
    return null;
  }

  String? validateStake(String? value) {
    if (value == null || value.isEmpty) return 'Please enter a stake amount';
    final stake = int.tryParse(value);
    if (stake == null || stake <= 0) return 'Enter a valid amount';

    if (_selectedPlayType != null && stake < _minimumStakes[_selectedPlayType]!) {
      return 'Minimum stake is ${_minimumStakes[_selectedPlayType]} points';
    }

    if (stake > _balance) {
      return 'Insufficient balance';
    }

    return null;
  }

  Future<WagerEntity?> placeWager() async {
    if (!canPlaceWager || _selectedPlayType == null) return null;

    final stake = int.tryParse(_stakeAmount);
    if (stake == null) return null;

    _isPlacingWager = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final params = PlaceWagerParams(
        gameId: _gameId,
        roundId: _roundId,
        playType: _selectedPlayType!,
        selection: _enteredNumber,
        pointsStaked: stake,
      );

      final wager = await _placeWager.execute(params);

      _balance -= stake;
      _isPlacingWager = false;
      notifyListeners();

      return wager;
    } catch (e) {
      _isPlacingWager = false;
      _errorMessage = _parseError(e);
      notifyListeners();
      return null;
    }
  }

  Future<void> loadHistory({bool refresh = true}) async {
    if (_isLoading) return;

    _isLoading = true;
    if (refresh) {
      _wagerHistory = [];
      _currentPage = 1;
      _errorMessage = null;
    }
    notifyListeners();

    try {
      final response = await _getWagerHistory.execute(page: _currentPage, limit: 20);

      if (refresh) {
        _wagerHistory = response.wagers;
      } else {
        _wagerHistory.addAll(response.wagers);
      }

      _totalPages = response.totalPages;
      _hasMore = _currentPage < _totalPages;
      _errorMessage = null;
    } catch (e) {
      _errorMessage = _parseError(e);
      debugPrint('Failed to load history: $_errorMessage');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadMore() async {
    if (!_hasMore || _isLoading) return;
    _currentPage++;
    await loadHistory(refresh: false);
  }

  Future<void> selectWager(WagerEntity wager) async {
    _selectedWager = wager;
    notifyListeners();
  }

  void setGameContext({required String gameId, required String roundId}) {
    _gameId = gameId;
    _roundId = roundId;
    notifyListeners();
  }

  void resetForm() {
    _selectedPlayType = null;
    _enteredNumber = '';
    _stakeAmount = '';
    _potentialPayout = 0;
    _errorMessage = null;
    notifyListeners();
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  String _parseError(dynamic error) {
    final message = error.toString().replaceFirst('Exception: ', '');
    if (message.toLowerCase().contains('network') ||
        message.toLowerCase().contains('connection') ||
        message.toLowerCase().contains('timeout')) {
      return 'No Internet Connection';
    }
    return message;
  }

  @override
  void dispose() {
    super.dispose();
  }
}
