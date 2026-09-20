import 'package:flutter/foundation.dart';
import '../../domain/usecases/check_app_update.dart';

class SplashController extends ChangeNotifier {
  final CheckAppUpdate checkAppUpdate;
  SplashController(this.checkAppUpdate);
}
