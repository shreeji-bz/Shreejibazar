import '../entities/points_entity.dart';

abstract class IPointsRepository {
  Future<PointsEntity> getWallet();
  Future<List<PointTransactionEntity>> getTransactions({int page = 1, int limit = 20});
}
