import '../entities/points_entity.dart';
import '../repositories/ipoints_repository.dart';

class GetPointsBalance {
  final IPointsRepository _repository;
  GetPointsBalance(this._repository);
  Future<PointsEntity> call() async => await _repository.getWallet();
}
