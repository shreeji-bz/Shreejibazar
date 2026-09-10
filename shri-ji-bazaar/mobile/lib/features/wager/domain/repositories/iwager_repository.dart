import '../entities/wager_entity.dart';
import '../entities/place_wager_params.dart';

abstract class IWagerRepository {
  Future<WagerEntity> placeWager(PlaceWagerParams params);
  Future<WagerListResponse> getWagerHistory({int page = 1, int limit = 20});
  Future<WagerEntity> getWagerById(String id);
}
