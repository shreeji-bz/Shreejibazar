import '../entities/payment_entity.dart';

abstract class IPaymentRepository {
  Future<PaymentEntity> createDeposit(Map<String, dynamic> data);
  Future<PaymentEntity> createWithdrawal(Map<String, dynamic> data);
  Future<List<PaymentEntity>> getPaymentHistory({int page = 1, int limit = 20});
  Future<List<PaymentEntity>> getPendingDeposits();
  Future<List<PaymentEntity>> getPendingWithdrawals();
  Future<List<PaymentEntity>> getWithdrawalHistory({int limit = 50});
  /// Withdrawal config: min amount, admin timeout, notice delay, messages.
  Future<Map<String, dynamic>> getWithdrawalConfig();
  Future<Map<String, dynamic>> createImbOrder(double amount, {String? description});
}
