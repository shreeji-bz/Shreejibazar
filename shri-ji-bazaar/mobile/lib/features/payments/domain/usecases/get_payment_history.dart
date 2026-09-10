import '../entities/payment_entity.dart';
import '../repositories/ipayment_repository.dart';

class GetPaymentHistory {
  final IPaymentRepository _repository;
  GetPaymentHistory(this._repository);

  Future<List<PaymentEntity>> call({int page = 1, int limit = 20}) async {
    return await _repository.getPaymentHistory(page: page, limit: limit);
  }
}
