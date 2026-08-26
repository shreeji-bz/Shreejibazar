import '../../../core/network/api_service.dart';
import '../../domain/entities/notification_entity.dart';

class NotificationDatasource {
  final ApiService _api = ApiService();

  Future<List<NotificationEntity>> getNotifications({int page = 1, int limit = 20}) async {
    final data = await _api.get('/notifications', queryParameters: {'page': page, 'limit': limit});
    return (data as List).map((e) => NotificationModel.fromJson(e)).toList();
  }

  Future<int> getUnreadCount() async {
    final data = await _api.get('/notifications/unread-count');
    return data['count'] ?? 0;
  }

  Future<void> markAsRead(String id) async {
    await _api.patch('/notifications/$id/read');
  }

  Future<void> markAllAsRead() async {
    await _api.patch('/notifications/read-all');
  }
}
