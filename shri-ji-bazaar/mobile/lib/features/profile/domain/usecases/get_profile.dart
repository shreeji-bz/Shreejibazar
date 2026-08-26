import '../../data/datasources/profile_datasource.dart';
import '../../domain/entities/profile_entity.dart';
import '../../domain/repositories/iprofile_repository.dart';

class GetProfileUseCase {
  final IProfileRepository _repository;

  GetProfileUseCase(this._repository);

  Future<ProfileEntity> execute() {
    return _repository.getProfile();
  }
}

class UpdateProfileUseCase {
  final IProfileRepository _repository;

  UpdateProfileUseCase(this._repository);

  Future<ProfileEntity> execute({String? name, String? email}) {
    return _repository.updateProfile(name: name, email: email);
  }
}
