import '../../domain/entities/profile_entity.dart';

abstract class IProfileRepository {
  Future<ProfileEntity> getProfile();
  Future<ProfileEntity> updateProfile({String? name, String? email, String? avatar});
  Future<void> changePassword({required String currentPassword, required String newPassword});
  Future<void> deleteAccount(String password);
}
