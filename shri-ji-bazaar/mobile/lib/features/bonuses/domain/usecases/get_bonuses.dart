import '../../domain/entities/bonus_entity.dart';
import '../../domain/repositories/ibonus_repository.dart';

class GetBonuses {
  final IBonusRepository _repository;
  GetBonuses(this._repository);
  Future<List<BonusEntity>> call() async => await _repository.getAvailableBonuses();
}
