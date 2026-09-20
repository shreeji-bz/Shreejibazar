import 'package:flutter/foundation.dart';
import '../../domain/usecases/get_points_balance.dart';
import '../../domain/usecases/get_points_history.dart';

class PointsController extends ChangeNotifier {
  final GetPointsBalance getPointsBalance;
  final GetPointsHistory getPointsHistory;

  PointsController(this.getPointsBalance, this.getPointsHistory);
}
