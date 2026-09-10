import '../entities/points_entity.dart';
import '../repositories/ipoints_repository.dart';

class GetPointsHistory {
  final IPointsRepository _repository;
  GetPointsHistory(this._repository);
  Future<List<PointTransactionEntity>> call({int page = 1, int limit = 20}) async => await _repository.getTransactions(page: page, limit: limit);
}
