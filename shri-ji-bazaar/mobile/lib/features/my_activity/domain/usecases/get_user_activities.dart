import '../../domain/entities/activity_entity.dart';
import '../../domain/repositories/iactivity_repository.dart';

class GetUserActivities {
  final IActivityRepository _repository;
  GetUserActivities(this._repository);
  Future<List<ActivityEntity>> call({int page = 1, int limit = 20}) async => await _repository.getUserActivities(page: page, limit: limit);
}
