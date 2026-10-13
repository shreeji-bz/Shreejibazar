import 'package:flutter/foundation.dart';
import '../../domain/entities/points_entity.dart';
import '../../domain/usecases/get_points_balance.dart';
import '../../domain/usecases/get_points_history.dart';

class PointsController extends ChangeNotifier {
  final GetPointsBalance getPointsBalance;
  final GetPointsHistory getPointsHistory;

  PointsEntity? _wallet;
  List<PointTransactionEntity> _transactions = [];
  bool _isLoading = false;
  String? _errorMessage;

  PointsEntity? get wallet => _wallet;
  List<PointTransactionEntity> get transactions => List.unmodifiable(_transactions);
  int get balance => _wallet?.balance ?? 0;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  PointsController(this.getPointsBalance, this.getPointsHistory);

  Future<void> loadPoints() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final wallet = await getPointsBalance();
      _wallet = wallet;
      _transactions = wallet.transactions;
    } catch (e) {
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
      // Still try to load transactions even if wallet fails
      try {
        _transactions = await getPointsHistory();
      } catch (_) {}
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
