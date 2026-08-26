import '../../domain/entities/bonus_entity.dart';
import '../../domain/repositories/ibonus_repository.dart';

class ClaimBonus {
  final IBonusRepository _repository;
  ClaimBonus(this._repository);
  Future<BonusEntity> call(String bonusId) async => await _repository.claimBonus(bonusId);
}
