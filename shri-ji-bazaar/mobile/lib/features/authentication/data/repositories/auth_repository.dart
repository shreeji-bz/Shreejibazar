import '../../domain/repositories/auth_repository.dart' as domain;

class AuthRepository implements IAuthRepository {
  final AuthDatasource _datasource;

  AuthRepository(this._datasource);

  @override
  Future<AuthResponse> register({required String name, required String mobile, required String password, String? referralCode}) async {
    return await _datasource.register(name: name, mobile: mobile, password: password, referralCode: referralCode);
  }

  @override
  Future<AuthResponse> login({required String mobile, required String password}) async {
    return await _datasource.login(mobile: mobile, password: password);
  }

  @override
  Future<void> logout() async {
    return await _datasource.logout();
  }

  @override
  Future<void> forgotPassword(String mobile) async {
    return await _datasource.forgotPassword(mobile);
  }

  @override
  Future<void> resetPassword({required String mobile, required String resetCode, required String newPassword}) async {
    return await _datasource.resetPassword(mobile: mobile, resetCode: resetCode, newPassword: newPassword);
  }
}
