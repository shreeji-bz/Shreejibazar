import 'package:shri_ji_bazaar/features/authentication/domain/entities/user_entity.dart';

abstract class AuthRepository {
  Future<AuthResponse> register({required String name, required String mobile, required String password, String? referralCode});
  Future<AuthResponse> login({required String mobile, required String password});
  Future<void> logout();
  Future<void> forgotPassword(String mobile);
  Future<void> resetPassword({required String mobile, required String resetCode, required String newPassword});
}
