import 'package:shri_ji_bazaar/features/authentication/domain/entities/user_entity.dart';

abstract class AuthRepository {
  Future<UserEntity> register({required String name, required String mobile, required String password, String? referralCode});
  Future<UserEntity> login({required String mobile, required String password});
  Future<void> logout();
  Future<void> forgotPassword(String mobile);
  Future<void> resetPassword({required String mobile, required String resetCode, required String newPassword});
}
