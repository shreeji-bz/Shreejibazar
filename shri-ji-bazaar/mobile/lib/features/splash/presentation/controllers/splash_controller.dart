import 'package:get/get.dart';
import '../../domain/usecases/check_app_update.dart';

class SplashController extends GetxController {
  final CheckAppUpdate checkAppUpdate;
  SplashController(this.checkAppUpdate);
}
