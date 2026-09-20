import '../../../../core/network/api_service.dart';
import '../../domain/entities/referral_entity.dart';
import '../models/referral_model.dart';

class ReferralDatasource {
  final ApiService _api = ApiService();

  Future<ReferralStatsEntity> getReferralStats() async {
    final data = await _api.get('/referrals/stats');
    return ReferralStatsModel.fromJson(data);
  }

  Future<List<ReferralEntity>> getReferralList() async {
    final data = await _api.get('/referrals');
    return (data as List).map((e) => ReferralModel.fromJson(e)).toList();
  }
}
