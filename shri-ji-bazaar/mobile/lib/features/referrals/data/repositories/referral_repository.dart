import '../../domain/entities/referral_entity.dart';
import '../../domain/repositories/ireferral_repository.dart';
import '../datasources/referral_datasource.dart';

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
