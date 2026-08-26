class ReferralRepository implements IReferralRepository {
  final ReferralDatasource _datasource;
  ReferralRepository(this._datasource);

  @override
  Future<ReferralStatsEntity> getReferralStats() async {
    return await _datasource.getReferralStats();
  }

  @override
  Future<List<ReferralEntity>> getReferralList() async {
    return await _datasource.getReferralList();
  }
}
