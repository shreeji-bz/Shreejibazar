import '../entities/result_entity.dart';
import '../repositories/iresult_repository.dart';

class GetResults {
  final IResultRepository _repository;
  GetResults(this._repository);
  Future<List<ResultEntity>> call({int page = 1, int limit = 20}) async => await _repository.getLatestResults(page: page, limit: limit);
}
