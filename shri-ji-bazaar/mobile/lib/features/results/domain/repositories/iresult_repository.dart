import '../entities/result_entity.dart';

abstract class IResultRepository {
  Future<List<ResultEntity>> getLatestResults({int page = 1, int limit = 20});
  Future<List<ResultEntity>> getResultsByGame(String gameId, {int page = 1, int limit = 20});
}
