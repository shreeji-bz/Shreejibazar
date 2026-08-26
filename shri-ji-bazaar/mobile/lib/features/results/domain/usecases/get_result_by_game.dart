import '../../domain/entities/result_entity.dart';
import '../../domain/repositories/iresult_repository.dart';

class GetResultByGame {
  final IResultRepository _repository;
  GetResultByGame(this._repository);
  Future<List<ResultEntity>> call(String gameId) async => await _repository.getResultsByGame(gameId);
}
