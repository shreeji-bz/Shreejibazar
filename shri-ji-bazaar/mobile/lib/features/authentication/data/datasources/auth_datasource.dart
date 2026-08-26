import '../../../core/network/api_service.dart';
import '../../domain/entities/user_entity.dart';

class AuthDatasource {
  final ApiService _api = ApiService();

  Future<UserResponse> register({required String name, required String mobile, required String password, String? referralCode}) async {
    final data = await _api.post('/auth/register', data: {
      'name': name,
      'mobile': mobile,
      'password': password,
      if (referralCode != null) 'referral_code': referralCode,
    });
    return UserModel.fromResponse(data);
  }

  Future<UserResponse> login({required String mobile, required String password}) async {
    final data = await _api.post('/auth/login', data: {
      'mobile': mobile,
      'password': password,
    });
    return UserModel.fromResponse(data);
  }

  Future<void> logout() async {
    await _api.post('/auth/logout');
  }

  Future<void> forgotPassword(String mobile) async {
    await _api.post('/auth/forgot-password', data: {'mobile': mobile});
  }

  Future<void> resetPassword({required String mobile, required String resetCode, required String newPassword}) async {
    await _api.post('/auth/reset-password', data: {
      'mobile': mobile,
      'reset_code': resetCode,
      'new_password': newPassword,
    });
  }
}
