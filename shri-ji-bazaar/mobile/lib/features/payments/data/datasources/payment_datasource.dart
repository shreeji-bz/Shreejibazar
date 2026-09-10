import '../../../../../core/network/api_service.dart';
import '../../domain/entities/payment_entity.dart';
import '../models/payment_model.dart';

class PaymentDatasource {
  final ApiService _api = ApiService();

  Future<PaymentEntity> createDeposit(Map<String, dynamic> data) async {
    final result = await _api.post('/payments/deposit', data: data);
    return PaymentModel.fromJson(result as Map<String, dynamic>);
  }

  Future<PaymentEntity> createWithdrawal(Map<String, dynamic> data) async {
    final result = await _api.post('/payments/withdrawal', data: data);
    return PaymentModel.fromJson(result as Map<String, dynamic>);
  }

  Future<List<PaymentEntity>> getPaymentHistory({int page = 1, int limit = 20}) async {
    final result = await _api.get(
      '/payments/history',
      queryParameters: {'page': page, 'limit': limit},
    );
    final List<dynamic> list = result is List ? result : (result['items'] ?? result['data'] ?? []);
    return list.map((item) => PaymentModel.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<List<PaymentEntity>> getPendingDeposits() async {
    final result = await _api.get('/payments/pending/deposits');
    final List<dynamic> list = result is List ? result : (result['items'] ?? result['data'] ?? []);
    return list.map((item) => PaymentModel.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<List<PaymentEntity>> getPendingWithdrawals() async {
    final result = await _api.get('/payments/pending/withdrawals');
    final List<dynamic> list = result is List ? result : (result['items'] ?? result['data'] ?? []);
    return list.map((item) => PaymentModel.fromJson(item as Map<String, dynamic>)).toList();
  }
}
