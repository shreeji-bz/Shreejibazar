import 'package:get/get.dart';
import '../../domain/usecases/get_user_activities.dart';

class ActivityController extends GetxController {
  final GetUserActivities getUserActivities;
  ActivityController(this.getUserActivities);
}
