import '../../domain/entities/activity_entity.dart';
import '../../domain/repositories/iactivity_repository.dart';
import '../datasources/activity_datasource.dart';

class ActivityRepository implements IActivityRepository {
  final ActivityDatasource _datasource;

  ActivityRepository(this._datasource);

  @override
  Future<List<ActivityEntity>> getUserActivities({int page = 1, int limit = 20}) async {
    return await _datasource.getUserActivities(page: page, limit: limit);
  }
}
