import '../../domain/entities/points_entity.dart';
import '../../domain/repositories/ipoints_repository.dart';
import '../datasources/points_datasource.dart';

class PointsRepository implements IPointsRepository {
  final PointsDatasource _datasource;

  PointsRepository(this._datasource);

  @override
  Future<PointsEntity> getWallet() async {
    return await _datasource.getWallet();
  }

  @override
  Future<List<PointTransactionEntity>> getTransactions({int page = 1, int limit = 20}) async {
    return await _datasource.getTransactions(page: page, limit: limit);
  }
}
