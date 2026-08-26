import '../../domain/entities/referral_entity.dart';

abstract class IReferralRepository {
  Future<ReferralStatsEntity> getReferralStats();
  Future<List<ReferralEntity>> getReferralList();
}
