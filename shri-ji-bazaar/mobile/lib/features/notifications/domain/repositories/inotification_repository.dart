import '../../domain/entities/notification_entity.dart';

abstract class INotificationRepository {
  Future<List<NotificationEntity>> getNotifications({int page = 1, int limit = 20});
  Future<int> getUnreadCount();
  Future<void> markAsRead(String id);
  Future<void> markAllAsRead();
}
