import 'package:get/get.dart';
import '../../domain/usecases/get_notifications.dart';

class NotificationController extends GetxController {
  final GetNotifications getNotifications;
  NotificationController(this.getNotifications);
}
