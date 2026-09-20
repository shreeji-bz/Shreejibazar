import 'package:flutter/foundation.dart';
import '../../domain/usecases/get_notifications.dart';

class NotificationController extends ChangeNotifier {
  final GetNotifications getNotifications;
  NotificationController(this.getNotifications);
}
