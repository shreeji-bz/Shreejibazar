import '../../domain/entities/result_entity.dart';
import '../../domain/repositories/iresult_repository.dart';

class GetLatestResults {
  final IResultRepository _repository;
  GetLatestResults(this._repository);
  Future<List<ResultEntity>> call({int page = 1, int limit = 20}) async => await _repository.getLatestResults(page: page, limit: limit);
}
