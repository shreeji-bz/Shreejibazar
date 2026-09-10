import '../entities/referral_entity.dart';
import '../repositories/ireferral_repository.dart';

class GetReferrals {
  final IReferralRepository _repository;
  GetReferrals(this._repository);
  Future<ReferralStatsEntity> call() async => await _repository.getReferralStats();
}
