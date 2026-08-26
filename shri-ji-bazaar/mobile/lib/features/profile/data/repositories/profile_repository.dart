import '../../domain/entities/profile_entity.dart';
import '../../domain/repositories/iprofile_repository.dart';
import '../datasources/profile_datasource.dart';

class ProfileRepository implements IProfileRepository {
  final ProfileDatasource _datasource;

  ProfileRepository(this._datasource);

  @override
  Future<ProfileEntity> getProfile() {
    return _datasource.getProfile();
  }

  @override
  Future<ProfileEntity> updateProfile({String? name, String? email, String? avatar}) {
    return _datasource.updateProfile(name: name, email: email, avatar: avatar);
  }

  @override
  Future<void> changePassword({required String currentPassword, required String newPassword}) {
    return _datasource.changePassword(currentPassword: currentPassword, newPassword: newPassword);
  }

  @override
  Future<void> deleteAccount(String password) {
    return _datasource.deleteAccount(password);
  }
}
