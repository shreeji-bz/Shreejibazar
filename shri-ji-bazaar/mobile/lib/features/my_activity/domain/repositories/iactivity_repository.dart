import '../../domain/entities/activity_entity.dart';

abstract class IActivityRepository {
  Future<List<ActivityEntity>> getUserActivities({int page = 1, int limit = 20});
}
