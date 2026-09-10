import '../entities/points_entity.dart';
import '../repositories/ipoints_repository.dart';

class GetWallet {
  final IPointsRepository _repository;
  GetWallet(this._repository);
  Future<PointsEntity> call() async => await _repository.getWallet();
}
