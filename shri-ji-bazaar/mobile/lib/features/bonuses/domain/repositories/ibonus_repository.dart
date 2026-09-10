import '../entities/bonus_entity.dart';

abstract class IBonusRepository {
  Future<List<BonusEntity>> getAvailableBonuses();
  Future<List<BonusEntity>> getClaimedBonuses();
  Future<BonusEntity> claimBonus(String bonusId);
}
