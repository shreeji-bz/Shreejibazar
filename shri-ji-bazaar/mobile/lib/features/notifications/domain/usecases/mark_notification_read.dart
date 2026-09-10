import '../repositories/inotification_repository.dart';

class MarkNotificationRead {
  final INotificationRepository _repository;
  MarkNotificationRead(this._repository);
  Future<void> call(String id) async => await _repository.markAsRead(id);
}
