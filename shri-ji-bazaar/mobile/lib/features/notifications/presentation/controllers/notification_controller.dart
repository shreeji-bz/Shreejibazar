import 'package:flutter/foundation.dart';
import '../../domain/usecases/get_notifications.dart';
import '../../domain/entities/notification_entity.dart';

class NotificationController extends ChangeNotifier {
  final GetNotifications getNotifications;

  List<NotificationEntity> _notifications = [];
  bool _isLoading = false;
  String? _errorMessage;
  int _unreadCount = 0;

  List<NotificationEntity> get notifications => List.unmodifiable(_notifications);
  int get unreadCount => _unreadCount;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  NotificationController(this.getNotifications);

  Future<void> loadNotifications({int page = 1, int limit = 20}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _notifications = await getNotifications(page: page, limit: limit);
    } catch (e) {
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
