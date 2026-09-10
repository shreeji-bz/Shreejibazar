import '../entities/profile_entity.dart';

abstract class IProfileRepository {
  Future<ProfileEntity> getProfile();
  Future<ProfileEntity> updateProfile({
    String? name,
    String? email,
    String? mobile,
  });
}
