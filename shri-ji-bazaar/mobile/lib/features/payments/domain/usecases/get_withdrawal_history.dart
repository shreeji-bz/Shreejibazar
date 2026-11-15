import '../entities/payment_entity.dart';
import '../repositories/ipayment_repository.dart';

/// The user's withdrawal requests (all statuses, most recent first) for the
/// Withdrawal History screen.
class GetWithdrawalHistory {
  final IPaymentRepository _repository;
  GetWithdrawalHistory(this._repository);

  Future<List<PaymentEntity>> call({int limit = 50}) async =>
      await _repository.getWithdrawalHistory(limit: limit);
}
