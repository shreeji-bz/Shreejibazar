import '../entities/result_entity.dart';
import '../repositories/iresult_repository.dart';

class GetResultsByGame {
  final IResultRepository _repository;
  GetResultsByGame(this._repository);
  Future<List<ResultEntity>> call(String gameId, {int page = 1, int limit = 20}) async => await _repository.getResultsByGame(gameId, page: page, limit: limit);
}
