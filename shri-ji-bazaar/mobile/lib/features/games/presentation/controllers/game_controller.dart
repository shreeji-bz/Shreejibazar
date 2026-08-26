import 'package:get/get.dart';
import '../../domain/usecases/get_featured_games.dart';

class GameController extends GetxController {
  final GetFeaturedGames getFeaturedGames;
  GameController(this.getFeaturedGames);
}
