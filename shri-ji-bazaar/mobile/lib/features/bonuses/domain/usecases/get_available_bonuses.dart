import '../../domain/entities/bonus_entity.dart';
import '../../domain/repositories/ibonus_repository.dart';

class GetAvailableBonuses {
  final IBonusRepository _repository;
  GetAvailableBonuses(this._repository);
  Future<List<BonusEntity>> call() async => await _repository.getAvailableBonuses();
}
