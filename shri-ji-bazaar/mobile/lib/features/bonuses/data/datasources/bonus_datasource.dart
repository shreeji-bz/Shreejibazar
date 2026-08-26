import '../../../core/network/api_service.dart';
import '../../domain/entities/bonus_entity.dart';

class BonusDatasource {
  final ApiService _api = ApiService();

  Future<List<BonusEntity>> getAvailableBonuses() async {
    final data = await _api.get('/bonuses');
    return (data as List).map((e) => BonusModel.fromJson(e)).toList();
  }

  Future<List<BonusEntity>> getClaimedBonuses() async {
    final data = await _api.get('/bonuses/claimed');
    return (data as List).map((e) => BonusModel.fromJson(e)).toList();
  }

  Future<BonusEntity> claimBonus(String bonusId) async {
    final data = await _api.post('/bonuses/$bonusId/claim');
    return BonusModel.fromJson(data);
  }
}
