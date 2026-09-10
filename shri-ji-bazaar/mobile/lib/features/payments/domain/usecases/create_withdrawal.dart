import '../entities/payment_entity.dart';
import '../repositories/ipayment_repository.dart';

class CreateWithdrawal {
  final IPaymentRepository _repository;
  CreateWithdrawal(this._repository);

  Future<PaymentEntity> call({
    required double amount,
    required String method,
    String? referenceId,
    String? notes,
  }) async {
    return await _repository.createWithdrawal({
      'amount': amount,
      'method': method,
      if (referenceId != null) 'reference_id': referenceId,
      if (notes != null) 'notes': notes,
    });
  }
}
