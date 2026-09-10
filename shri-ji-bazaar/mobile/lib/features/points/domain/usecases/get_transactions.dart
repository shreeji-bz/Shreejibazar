import '../entities/points_entity.dart';
import '../repositories/ipoints_repository.dart';

class GetTransactions {
  final IPointsRepository _repository;
  GetTransactions(this._repository);
  Future<List<PointTransactionEntity>> call({int page = 1, int limit = 20}) async => await _repository.getTransactions(page: page, limit: limit);
}
