import '../repositories/inotification_repository.dart';

class GetUnreadCount {
  final INotificationRepository _repository;
  GetUnreadCount(this._repository);
  Future<int> call() async => await _repository.getUnreadCount();
}
