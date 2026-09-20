import 'package:flutter/foundation.dart';
import '../../domain/usecases/get_game_detail.dart';

class GameDetailController extends ChangeNotifier {
  final GetGameDetail getGameDetail;
  GameDetailController(this.getGameDetail);
}
