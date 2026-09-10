import '../entities/profile_entity.dart';
import '../repositories/iprofile_repository.dart';

class UpdateProfile {
  final IProfileRepository _repository;
  UpdateProfile(this._repository);

  Future<ProfileEntity> execute({
    String? name,
    String? email,
    String? mobile,
  }) async {
    return await _repository.updateProfile(name: name, email: email, mobile: mobile);
  }
}
