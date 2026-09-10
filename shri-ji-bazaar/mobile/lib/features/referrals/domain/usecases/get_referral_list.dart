import '../entities/referral_entity.dart';
import '../repositories/ireferral_repository.dart';

class GetReferralList {
  final IReferralRepository _repository;
  GetReferralList(this._repository);
  Future<List<ReferralEntity>> call() async => await _repository.getReferralList();
}
