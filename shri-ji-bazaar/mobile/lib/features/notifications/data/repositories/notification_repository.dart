import '../../domain/entities/notification_entity.dart';
import '../../domain/repositories/inotification_repository.dart';
import '../datasources/notification_datasource.dart';

class NotificationRepository implements INotificationRepository {
  final NotificationDatasource _datasource;
  NotificationRepository(this._datasource);

  @override
  Future<List<NotificationEntity>> getNotifications({int page = 1, int limit = 20}) async {
    return await _datasource.getNotifications(page: page, limit: limit);
  }

  @override
  Future<int> getUnreadCount() async {
    return await _datasource.getUnreadCount();
  }

  @override
  Future<void> markAsRead(String id) async {
    return await _datasource.markAsRead(id);
  }

  @override
  Future<void> markAllAsRead() async {
    return await _datasource.markAllAsRead();
  }
}
