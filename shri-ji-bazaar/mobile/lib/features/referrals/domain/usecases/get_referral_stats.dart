import '../../domain/entities/referral_entity.dart';
import '../../domain/repositories/ireferral_repository.dart';

class GetReferralStats {
  final IReferralRepository _repository;
  GetReferralStats(this._repository);
  Future<ReferralStatsEntity> call() async => await _repository.getReferralStats();
}
