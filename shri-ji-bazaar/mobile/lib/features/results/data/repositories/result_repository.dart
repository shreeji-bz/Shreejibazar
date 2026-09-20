import '../../domain/entities/result_entity.dart';
import '../../domain/repositories/iresult_repository.dart';
import '../datasources/result_datasource.dart';

class ResultRepository implements IResultRepository {
  final ResultDatasource _datasource;

  ResultRepository(this._datasource);

  @override
  Future<List<ResultEntity>> getLatestResults({int page = 1, int limit = 20}) async {
    return await _datasource.getLatestResults(page: page, limit: limit);
  }

  @override
  Future<List<ResultEntity>> getResultsByGame(String gameId, {int page = 1, int limit = 20}) async {
    return await _datasource.getResultsByGame(gameId, page: page, limit: limit);
  }
}
