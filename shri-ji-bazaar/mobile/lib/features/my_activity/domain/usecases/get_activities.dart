import '../entities/activity_entity.dart';
import '../repositories/iactivity_repository.dart';

class GetActivities {
  final IActivityRepository _repository;
  GetActivities(this._repository);
  Future<List<ActivityEntity>> call({int page = 1, int limit = 20}) async => await _repository.getUserActivities(page: page, limit: limit);
}
