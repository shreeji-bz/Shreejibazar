import '../repositories/inotification_repository.dart';

class MarkAsRead {
  final INotificationRepository _repository;
  MarkAsRead(this._repository);
  Future<void> call(String id) async => await _repository.markAsRead(id);
}
