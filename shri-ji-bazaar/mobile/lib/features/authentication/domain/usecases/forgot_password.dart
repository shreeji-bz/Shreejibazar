import '../../domain/repositories/auth_repository.dart';

class ForgotPassword {
  final AuthRepository _repository;
  ForgotPassword(this._repository);
  Future<void> call(String mobile) async => await _repository.forgotPassword(mobile);
}
