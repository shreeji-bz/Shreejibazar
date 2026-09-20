import 'package:flutter/foundation.dart';
import '../../domain/usecases/get_bonuses.dart';

class BonusController extends ChangeNotifier {
  final GetBonuses getBonuses;
  BonusController(this.getBonuses);
}
