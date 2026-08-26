import '../../domain/repositories/ireferral_repository.dart';

class ShareReferralLink {
  final IReferralRepository _repository;
  ShareReferralLink(this._repository);
  Future<void> call() async => await _repository.getReferralStats();
}
