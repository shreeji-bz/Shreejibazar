import '../../../../core/network/api_service.dart';
import '../../domain/entities/user_entity.dart';

class AuthDatasource {
  final ApiService _api = ApiService();

  Future<UserEntity> register({required String name, required String mobile, required String password, String? referralCode}) async {
    final data = await _api.post('/auth/register', data: {
      'name': name,
      'mobile': mobile,
      'password': password,
      if (referralCode != null) 'referral_code': referralCode,
    });
    return _userFromJson(data);
  }

  Future<UserEntity> login({required String mobile, required String password}) async {
    final data = await _api.post('/auth/login', data: {
      'mobile': mobile,
      'password': password,
    });
    return _userFromJson(data);
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

  UserEntity _userFromJson(Map<String, dynamic> data) {
    final user = data['user'] ?? data;
    return UserEntity(
      id: user['id'] ?? user['user_id'] ?? '',
      name: user['name'] ?? '',
      mobile: user['mobile'] ?? '',
      email: user['email'] ?? '',
      referralCode: user['referralCode'] ?? user['referral_code'] ?? '',
      status: user['status'] ?? 'active',
      createdAt: user['createdAt'] != null ? DateTime.tryParse(user['createdAt'].toString()) ?? DateTime.now() : DateTime.now(),
      updatedAt: user['updatedAt'] != null ? DateTime.tryParse(user['updatedAt'].toString()) ?? DateTime.now() : DateTime.now(),
    );
  }
}
