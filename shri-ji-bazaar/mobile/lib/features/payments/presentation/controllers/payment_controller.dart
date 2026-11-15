import 'dart:async';

import 'package:flutter/foundation.dart';
import '../../domain/entities/payment_entity.dart';
import '../../domain/usecases/create_deposit.dart';
import '../../domain/usecases/create_withdrawal.dart';
import '../../domain/usecases/create_imb_order.dart';
import '../../domain/usecases/get_payment_history.dart';
import '../../domain/usecases/get_withdrawal_config.dart';
import '../../../points/domain/usecases/get_wallet.dart';

enum PaymentFilter { all, deposits, withdrawals }

class PaymentController extends ChangeNotifier {
  final CreateDeposit createDeposit;
  final CreateWithdrawal createWithdrawal;
  final GetPaymentHistory getPaymentHistory;
  final CreateImbOrder createImbOrder;
  final GetWallet getWallet;
  final GetWithdrawalConfig getWithdrawalConfig;

  PaymentController({
    required this.createDeposit,
    required this.createWithdrawal,
    required this.getPaymentHistory,
    required this.createImbOrder,
    required this.getWallet,
    required this.getWithdrawalConfig,
  });

  // State
  bool _isLoading = false;
  bool _isProcessing = false;
  String? _error;
  List<PaymentEntity> _history = [];
  List<PaymentEntity> _pendingDeposits = [];
  List<PaymentEntity> _pendingWithdrawals = [];
  double _availableBalance = 0;
  /// Amount reserved by open (pending) withdrawal requests — held, not spent.
  double _pendingWithdrawal = 0;
  double _minDeposit = 1;
  double _maxWithdrawal = 50000;

  // ---- Admin-approved withdrawal config (server-driven, NOT hardcoded) ----
  int _minWithdrawal = 100;
  int _adminTimeoutHours = 24;
  int _pendingNoticeDelayMs = 3500;
  String _msgPending = 'Your withdrawal request has been sent. It is pending admin approval. Your money is safe in your wallet.';
  String _msgApproved = 'Your withdrawal of {amount} has been approved.';
  String _msgRejected = 'Your withdrawal request was not processed. Your {amount} is safe in your wallet.';
  String _msgExpired = 'Your withdrawal request could not be processed in time. Your {amount} is safe in your wallet. You can request again.';
  bool _configLoaded = false;

  /// True once the post-submit "pending, money safe" notice has been shown.
  bool _pendingNoticeShown = false;
  Timer? _pendingNoticeTimer;

  PaymentFilter _currentFilter = PaymentFilter.all;

  // Getters
  bool get isLoading => _isLoading;
  bool get isProcessing => _isProcessing;
  String? get error => _error;
  List<PaymentEntity> get history => _history;
  List<PaymentEntity> get pendingDeposits => _pendingDeposits;
  List<PaymentEntity> get pendingWithdrawals => _pendingWithdrawals;
  /// Spendable balance: server already returns balance minus reservations.
  double get availableBalance => _availableBalance;
  /// Total held for open withdrawal requests (safe in the wallet).
  double get pendingWithdrawal => _pendingWithdrawal;
  /// Total in the wallet = available + reserved.
  double get totalBalance => _availableBalance + _pendingWithdrawal;
  int get minWithdrawal => _minWithdrawal;
  int get adminTimeoutHours => _adminTimeoutHours;
  int get pendingNoticeDelayMs => _pendingNoticeDelayMs;
  String get msgPending => _msgPending;
  bool get pendingNoticeShown => _pendingNoticeShown;
  /// The user's single open withdrawal request (one at a time), if any.
  PaymentEntity? get pendingRequest {
    for (final p in _pendingWithdrawals) {
      if (p.status == 'pending') return p;
    }
    return null;
  }

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

  void setWithdrawalLimits({int? min, double? max}) {
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
    if (amount < _minWithdrawal) {
      return 'Minimum withdrawal amount is ₹$_minWithdrawal';
    }
    if (amount > _maxWithdrawal) {
      return 'Maximum withdrawal amount is ₹${_maxWithdrawal.round()}';
    }
    // available = balance - reserved withdrawals (server-driven).
    if (amount > _availableBalance) return 'Insufficient available balance';
    return null;
  }

  /// Fill a configured message template ({amount} -> ₹X).
  String fillMessage(String template, double amount) {
    return template.replaceAll('{amount}', '₹${amount.toStringAsFixed(0)}');
  }

  String? validateDepositAmount(double amount) {
    if (amount <= 0) return 'Amount must be greater than zero';
    if (amount < _minDeposit) return 'Minimum deposit amount is $_minDeposit';
    return null;
  }

  // Actions
  Future<void> loadBalance() async {
    try {
      final points = await getWallet();
      // `available` = balance minus reserved withdrawals (server-side).
      _availableBalance = (points.balance - points.pendingWithdrawal).toDouble();
      _pendingWithdrawal = points.pendingWithdrawal.toDouble();
      notifyListeners();
    } catch (e) {
      debugPrint('Failed to load wallet balance: $e');
    }
  }

  /// Load the server-driven withdrawal rules (min amount, admin timeout,
  /// pending-notice delay, message templates). Called on start and lazily
  /// before validating a withdrawal, so nothing is hardcoded.
  Future<void> loadWithdrawalConfig() async {
    try {
      final cfg = await getWithdrawalConfig();
      _minWithdrawal = int.tryParse((cfg['minAmount'] ?? 100).toString()) ?? 100;
      _adminTimeoutHours = int.tryParse((cfg['adminTimeoutHours'] ?? 24).toString()) ?? 24;
      _pendingNoticeDelayMs =
          int.tryParse((cfg['pendingNoticeDelayMs'] ?? 3500).toString()) ?? 3500;
      final messages = cfg['messages'];
      if (messages is Map) {
        _msgPending = (messages['pending']?.toString()) ?? _msgPending;
        _msgApproved = (messages['approved']?.toString()) ?? _msgApproved;
        _msgRejected = (messages['rejected']?.toString()) ?? _msgRejected;
        _msgExpired = (messages['expired']?.toString()) ?? _msgExpired;
      }
      _configLoaded = true;
      notifyListeners();
    } catch (e) {
      debugPrint('Failed to load withdrawal config: $e');
    }
  }

  Future<bool> requestDeposit({
    required double amount,
    required String method,
    String? referenceId,
    String? notes,
    String? utrNumber,
    String? screenshotUrl,
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
        utrNumber: utrNumber,
        screenshotUrl: screenshotUrl,
      );
      _pendingDeposits.insert(0, payment);
      _history.insert(0, payment);
      _error = null;
      notifyListeners();
      await loadBalance();
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setProcessing(false);
    }
  }

  /// Request an admin-approved withdrawal.
  ///
  /// The amount is NOT deducted locally: the server only RESERVES it
  /// (pendingWithdrawal), so the spendable balance changes on the next
  /// [loadBalance], not here. Returns the created request, or null when the
  /// submit failed (validation or server error is in [error]).
  Future<PaymentEntity?> requestWithdrawal({
    required double amount,
    required String method,
    String? referenceId,
    String? notes,
  }) async {
    if (!_configLoaded) await loadWithdrawalConfig();
    final validationError = validateWithdrawalAmount(amount);
    if (validationError != null) {
      _setError(validationError);
      return null;
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
      _error = null;
      _pendingNoticeShown = false;
      notifyListeners();
      await loadBalance(); // server now reports the reservation
      _schedulePendingNotice(payment.id);
      return payment;
    } catch (e) {
      _setError(e.toString());
      return null;
    } finally {
      _setProcessing(false);
    }
  }

  /// After submitting, if the admin has not acted within the configured
  /// delay (3-4s), surface the "sent / pending / money is safe" notice.
  /// Re-checks the request first: only show it while still pending.
  void _schedulePendingNotice(String requestId) {
    _pendingNoticeTimer?.cancel();
    _pendingNoticeTimer = Timer(
      Duration(milliseconds: _pendingNoticeDelayMs),
      () async {
        if (_pendingNoticeShown) return;
        try {
          final requests = await getPaymentHistory(page: 1, limit: 50);
          final request = requests.where((p) => p.id == requestId).firstOrNull;
          if (request?.status == 'pending') {
            _pendingNoticeShown = true;
            notifyListeners();
          }
        } catch (_) {
          // On lookup failure still surface the "money is safe" notice.
          _pendingNoticeShown = true;
          notifyListeners();
        }
      },
    );
  }

  /// Dismiss the pending notice (e.g. the admin already acted / page left).
  void dismissPendingNotice() {
    _pendingNoticeTimer?.cancel();
    _pendingNoticeShown = false;
    notifyListeners();
  }

  Future<Map<String, dynamic>?> initiateImbPayment(double amount) async {
    _setProcessing(true);
    try {
      final result = await createImbOrder.execute(amount);
      return result;
    } catch (e) {
      _setError(e.toString());
      return null;
    } finally {
      _setProcessing(false);
    }
  }

  /// Withdrawal requests only (all statuses) for the Withdrawal History
  /// screen. Refreshes the open-requests list so the reservation figures
  /// stay consistent.
  Future<List<PaymentEntity>> getWithdrawalHistory() async {
    // Load fresh from the server so new/changed requests are reflected.
    final history = await getPaymentHistory(page: 1, limit: 50);
    _history = history;
    _pendingWithdrawals
      ..clear()
      ..addAll(history.where((p) => p.type == 'withdrawal' && p.status == 'pending').toList());
    notifyListeners();
    return history.where((p) => p.type == 'withdrawal').toList();
  }

  Future<void> loadHistory({int page = 1, int limit = 20}) async {
    _setLoading(true);
    try {
      final results = await getPaymentHistory(page: page, limit: limit);
      _history = results;
      _error = null;
      await loadBalance();
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

  @override
  void dispose() {
    _pendingNoticeTimer?.cancel();
    super.dispose();
  }

  void _setError(String message) {
    _error = message;
    notifyListeners();
  }
}
