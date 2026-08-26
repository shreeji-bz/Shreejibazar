class BonusRepository implements IBonusRepository {
  final BonusDatasource _datasource;

  BonusRepository(this._datasource);

  @override
  Future<List<BonusEntity>> getAvailableBonuses() async {
    return await _datasource.getAvailableBonuses();
  }

  @override
  Future<List<BonusEntity>> getClaimedBonuses() async {
    return await _datasource.getClaimedBonuses();
  }

  @override
  Future<BonusEntity> claimBonus(String bonusId) async {
    return await _datasource.claimBonus(bonusId);
  }
}
