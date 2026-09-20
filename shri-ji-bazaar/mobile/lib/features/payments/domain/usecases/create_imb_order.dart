import '../../domain/repositories/ipayment_repository.dart';

class CreateImbOrder {
  final IPaymentRepository _repository;

  CreateImbOrder(this._repository);

  Future<Map<String, dynamic>> execute(double amount, {String? description}) async {
    return await _repository.createImbOrder(amount, description: description);
  }
}
