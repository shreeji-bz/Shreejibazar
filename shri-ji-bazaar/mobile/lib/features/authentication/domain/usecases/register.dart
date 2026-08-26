import '../../domain/repositories/auth_repository.dart';

class Register {
  final AuthRepository _repository;
  Register(this._repository);
  Future call({required String name, required String mobile, required String password, String? referralCode}) async {
    return await _repository.register(name: name, mobile: mobile, password: password, referralCode: referralCode);
  }
}
