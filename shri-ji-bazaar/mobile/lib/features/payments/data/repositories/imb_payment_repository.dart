import '../../domain/entities/payment_entity.dart';
import '../../domain/repositories/ipayment_repository.dart';
import '../datasources/imb_payment_datasource.dart';

class ImbPaymentRepository implements IPaymentRepository {
  final ImbPaymentDatasource _datasource;

  ImbPaymentRepository(this._datasource);

  @override
  Future<PaymentEntity> createDeposit(Map<String, dynamic> data) async {
    throw UnsupportedError('Use createImbOrder for IMB payments');
  }

  @override
  Future<PaymentEntity> createWithdrawal(Map<String, dynamic> data) async {
    throw UnsupportedError('IMB does not support withdrawals');
  }

  @override
  Future<List<PaymentEntity>> getPaymentHistory({int page = 1, int limit = 20}) {
    throw UnsupportedError('Use payment datasource for history');
  }

  @override
  Future<List<PaymentEntity>> getPendingDeposits() {
    throw UnsupportedError('Use payment datasource for pending deposits');
  }

  @override
  Future<List<PaymentEntity>> getPendingWithdrawals() {
    throw UnsupportedError('Use payment datasource for pending withdrawals');
  }

  @override
  Future<List<PaymentEntity>> getWithdrawalHistory({int limit = 50}) {
    throw UnsupportedError('Use payment datasource for withdrawal history');
  }

  @override
  Future<Map<String, dynamic>> getWithdrawalConfig() {
    throw UnsupportedError('Use payment datasource for withdrawal config');
  }

  Future<Map<String, dynamic>> createImbOrder(double amount, {String? description}) async {
    return await _datasource.createImbOrder(amount, description: description);
  }
}
