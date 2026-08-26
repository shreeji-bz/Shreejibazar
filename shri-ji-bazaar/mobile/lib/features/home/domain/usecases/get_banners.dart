import '../../domain/entities/banner_entity.dart';
import '../../domain/repositories/ihome_repository.dart';

class GetBanners {
  final IHomeRepository _repository;
  GetBanners(this._repository);
  Future<List<BannerEntity>> call() async => await _repository.getBanners();
}
