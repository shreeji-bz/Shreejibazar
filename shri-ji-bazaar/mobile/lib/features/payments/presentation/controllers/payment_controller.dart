import 'package:flutter/foundation.dart';
import '../../domain/entities/payment_entity.dart';
import '../../domain/usecases/create_deposit.dart';
import '../../domain/usecases/create_withdrawal.dart';
import '../../domain/usecases/get_payment_history.dart';

enum PaymentFilter { all, deposits, withdrawals }

class PaymentController extends ChangeNotifier {
  final CreateDeposit createDeposit;
  final CreateWithdrawal createWithdrawal;
  final GetPaymentHistory getPaymentHistory;

  PaymentController({
    required this.createDeposit,
    required this.createWithdrawal,
    required this.getPaymentHistory,
  });

  // State
  bool _isLoading = false;
  bool _isProcessing = false;
  String? _error;
  List<PaymentEntity> _history = [];
  List<PaymentEntity> _pendingDeposits = [];
  List<PaymentEntity> _pendingWithdrawals = [];
  double _availableBalance = 0;
  double _minWithdrawal = 100;
  double _minDeposit = 50;
  double _maxWithdrawal = 50000;
  PaymentFilter _currentFilter = PaymentFilter.all;

  // Getters
  bool get isLoading => _isLoading;
  bool get isProcessing => _isProcessing;
  String? get error => _error;
  List<PaymentEntity> get history => _history;
  List<PaymentEntity> get pendingDeposits => _pendingDeposits;
  List<PaymentEntity> get pendingWithdrawals => _pendingWithdrawals;
  double get availableBalance => _availableBalance;
  double get minWithdrawal => _minWithdrawal;
  double get minDeposit => _minDeposit;
  double get maxWithdrawal => _maxWithdrawal;
  PaymentFilter get currentFilter => _currentFilter;

  // Filtered history based on current filter
  List<PaymentEntity> get filteredHistory {
    switch (_currentFilter) {
      case PaymentFilter.deposits:
        return _history.where((p) => p.type == 'deposit').toList();
      case PaymentFilter.withdrawals:
        return _history.where((p) => p.type == 'withdrawal').toList();
      case PaymentFilter.all:
        return _history;
    }
  }

  void setFilter(PaymentFilter filter) {
    _currentFilter = filter;
    notifyListeners();
  }

  void setAvailableBalance(double balance) {
    _availableBalance = balance;
    notifyListeners();
  }

  void setWithdrawalLimits({double? min, double? max}) {
    if (min != null) _minWithdrawal = min;
    if (max != null) _maxWithdrawal = max;
    notifyListeners();
  }

  // Validation
  String? validateAmount(double amount) {
    if (amount <= 0) return 'Amount must be greater than zero';
    return null;
  }

  String? validateWithdrawalAmount(double amount) {
    if (amount <= 0) return 'Amount must be greater than zero';
    if (amount < _minWithdrawal) return 'Minimum withdrawal amount is $_minWithdrawal';
    if (amount > _maxWithdrawal) return 'Maximum withdrawal amount is $_maxWithdrawal';
    if (amount > _availableBalance) return 'Insufficient balance';
    return null;
  }

  String? validateDepositAmount(double amount) {
    if (amount <= 0) return 'Amount must be greater than zero';
    if (amount < _minDeposit) return 'Minimum deposit amount is $_minDeposit';
    return null;
  }

  // Actions
  Future<bool> requestDeposit({
    required double amount,
    required String method,
    String? referenceId,
    String? notes,
  }) async {
    final validationError = validateDepositAmount(amount);
    if (validationError != null) {
      _setError(validationError);
      return false;
    }

    _setProcessing(true);
    try {
      final payment = await createDeposit(
        amount: amount,
        method: method,
        referenceId: referenceId,
        notes: notes,
      );
      _pendingDeposits.insert(0, payment);
      _history.insert(0, payment);
      _error = null;
      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setProcessing(false);
    }
  }

  Future<bool> requestWithdrawal({
    required double amount,
    required String method,
    String? referenceId,
    String? notes,
  }) async {
    final validationError = validateWithdrawalAmount(amount);
    if (validationError != null) {
      _setError(validationError);
      return false;
    }

    _setProcessing(true);
    try {
      final payment = await createWithdrawal(
        amount: amount,
        method: method,
        referenceId: referenceId,
        notes: notes,
      );
      _pendingWithdrawals.insert(0, payment);
      _history.insert(0, payment);
      _availableBalance -= amount;
      _error = null;
      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setProcessing(false);
    }
  }

  Future<void> loadHistory({int page = 1, int limit = 20}) async {
    _setLoading(true);
    try {
      final results = await getPaymentHistory(page: page, limit: limit);
      _history = results;
      _error = null;
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  Future<void> refresh() async {
    await loadHistory();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  void _setLoading(bool value) {
    _isLoading = value;
    _error = null;
    notifyListeners();
  }

  void _setProcessing(bool value) {
    _isProcessing = value;
    notifyListeners();
  }

  void _setError(String message) {
    _error = message;
    notifyListeners();
  }
}
