import 'package:flutter/foundation.dart';
import '../../domain/entities/activity_entity.dart';
import '../../domain/usecases/get_user_activities.dart';

class ActivityController extends ChangeNotifier {
  final GetUserActivities getUserActivities;

  List<ActivityEntity> _activities = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<ActivityEntity> get activities => List.unmodifiable(_activities);
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  ActivityController(this.getUserActivities);

  Future<void> loadActivities({int page = 1, int limit = 20}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _activities = await getUserActivities(page: page, limit: limit);
    } catch (e) {
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
