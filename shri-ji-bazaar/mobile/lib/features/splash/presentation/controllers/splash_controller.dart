import 'package:flutter/foundation.dart';
import '../../domain/usecases/check_app_update.dart';
import '../../domain/entities/splash_entity.dart';

class SplashController extends ChangeNotifier {
  final CheckAppUpdate checkAppUpdate;
  SplashController(this.checkAppUpdate);

  Future<SplashEntity?> getSettings() async {
    try {
      return await checkAppUpdate();
    } catch (e) {
      if (kDebugMode) {
        print('SplashController: settings fetch failed - ${e.toString()}');
      }
      return null;
    }
  }
}
