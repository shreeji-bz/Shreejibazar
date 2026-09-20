import 'package:flutter/foundation.dart';
import '../../domain/usecases/get_user_activities.dart';

class ActivityController extends ChangeNotifier {
  final GetUserActivities getUserActivities;
  ActivityController(this.getUserActivities);
}
