import '../entities/place_wager_params.dart';
import '../entities/wager_entity.dart';
import '../repositories/iwager_repository.dart';

class PlaceWager {
  final IWagerRepository repository;

  PlaceWager(this.repository);

  Future<WagerEntity> execute(PlaceWagerParams params) {
    return repository.placeWager(params);
  }
}
