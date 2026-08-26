import '../../domain/entities/notification_entity.dart';
import '../../domain/repositories/inotification_repository.dart';

class GetNotifications {
  final INotificationRepository _repository;
  GetNotifications(this._repository);
  Future<List<NotificationEntity>> call({int page = 1, int limit = 20}) async => await _repository.getNotifications(page: page, limit: limit);
}
