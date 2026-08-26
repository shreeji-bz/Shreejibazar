import 'package:get/get.dart';
import '../../domain/usecases/get_wallet.dart';

class PointsController extends GetxController {
  final GetWallet getWallet;
  PointsController(this.getWallet);
}
