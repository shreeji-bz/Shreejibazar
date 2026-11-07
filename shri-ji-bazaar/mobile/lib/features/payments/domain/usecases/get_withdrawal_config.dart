import '../repositories/ipayment_repository.dart';

/// Loads the admin-configured withdrawal rules for the user side:
/// minimum amount, admin response timeout, the pending-notice delay, and
/// the four message templates. Nothing is hardcoded in the UI.
class GetWithdrawalConfig {
  final IPaymentRepository _repository;
  GetWithdrawalConfig(this._repository);

  Future<Map<String, dynamic>> call() async =>
      await _repository.getWithdrawalConfig();
}
