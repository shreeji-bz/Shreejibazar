import '../../domain/entities/payment_entity.dart';
import '../../domain/repositories/ipayment_repository.dart';
import '../datasources/payment_datasource.dart';

class PaymentRepository implements IPaymentRepository {
  final PaymentDatasource _datasource;

  PaymentRepository(this._datasource);

  @override
  Future<PaymentEntity> createDeposit(Map<String, dynamic> data) async {
    return await _datasource.createDeposit(data);
  }

  @override
  Future<PaymentEntity> createWithdrawal(Map<String, dynamic> data) async {
    return await _datasource.createWithdrawal(data);
  }

  @override
  Future<List<PaymentEntity>> getPaymentHistory({int page = 1, int limit = 20}) async {
    return await _datasource.getPaymentHistory(page: page, limit: limit);
  }

  @override
  Future<List<PaymentEntity>> getPendingDeposits() async {
    return await _datasource.getPendingDeposits();
  }

  @override
  Future<List<PaymentEntity>> getPendingWithdrawals() async {
    return await _datasource.getPendingWithdrawals();
  }

  @override
  Future<Map<String, dynamic>> createImbOrder(double amount, {String? description}) {
    throw UnsupportedError('Use ImbPaymentRepository for IMB payments');
  }
}
