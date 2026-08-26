import 'package:get/get.dart';
import '../../domain/usecases/get_available_bonuses.dart';

class BonusController extends GetxController {
  final GetAvailableBonuses getAvailableBonuses;
  BonusController(this.getAvailableBonuses);
}
