import '../../domain/entities/referral_entity.dart';
import '../../domain/repositories/ireferral_repository.dart';

class GetReferrals {
  final IReferralRepository _repository;
  GetReferrals(this._repository);
  Future<ReferralStatsEntity> call() async => await _repository.getReferralStats();
}
