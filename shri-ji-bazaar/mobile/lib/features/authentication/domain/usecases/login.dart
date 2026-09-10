import '../repositories/auth_repository.dart';

class Login {
  final AuthRepository _repository;
  Login(this._repository);
  Future call({required String mobile, required String password}) async {
    return await _repository.login(mobile: mobile, password: password);
  }
}
