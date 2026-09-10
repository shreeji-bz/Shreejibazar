import '../repositories/ihome_repository.dart';

class GetHomeData {
  final IHomeRepository _repository;
  GetHomeData(this._repository);
  Future call() async {
    final banners = await _repository.getBanners();
    final popular = await _repository.getPopularGames();
    final recent = await _repository.getRecentGames();
    return {'banners': banners, 'popular': popular, 'recent': recent};
  }
}
