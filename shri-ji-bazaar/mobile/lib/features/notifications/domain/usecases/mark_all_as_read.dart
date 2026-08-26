import '../../domain/repositories/inotification_repository.dart';

class MarkAllAsRead {
  final INotificationRepository _repository;
  MarkAllAsRead(this._repository);
  Future<void> call() async => await _repository.markAllAsRead();
}
