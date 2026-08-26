import '../../domain/entities/bonus_entity.dart';
import '../../domain/repositories/ibonus_repository.dart';

class GetClaimedBonuses {
  final IBonusRepository _repository;
  GetClaimedBonuses(this._repository);
  Future<List<BonusEntity>> call() async => await _repository.getClaimedBonuses();
}
