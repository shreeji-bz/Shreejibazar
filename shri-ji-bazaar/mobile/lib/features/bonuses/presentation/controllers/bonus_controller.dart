import 'package:flutter/foundation.dart';
import '../../domain/entities/bonus_entity.dart';
import '../../domain/usecases/get_bonuses.dart';
import '../../domain/usecases/claim_bonus.dart';

class BonusController extends ChangeNotifier {
  final GetBonuses getBonuses;
  final ClaimBonus? _claimBonus;

  List<BonusEntity> _bonuses = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<BonusEntity> get bonuses => List.unmodifiable(_bonuses);
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  BonusController(this.getBonuses, {ClaimBonus? claimBonus}) : _claimBonus = claimBonus;

  Future<void> loadBonuses() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _bonuses = await getBonuses();
    } catch (e) {
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> claimBonus(String bonusId) async {
    final claim = _claimBonus;
    if (claim == null) return false;
    try {
      await claim.call(bonusId);
      final idx = _bonuses.indexWhere((b) => b.id == bonusId);
      if (idx >= 0) {
        _bonuses = List.from(_bonuses);
        _bonuses[idx] = BonusEntity(
          id: _bonuses[idx].id,
          name: _bonuses[idx].name,
          slug: _bonuses[idx].slug,
          description: _bonuses[idx].description,
          points: _bonuses[idx].points,
          type: _bonuses[idx].type,
          status: _bonuses[idx].status,
          startDate: _bonuses[idx].startDate,
          endDate: _bonuses[idx].endDate,
          claimed: true,
          claimedAt: DateTime.now(),
          createdAt: _bonuses[idx].createdAt,
        );
      }
      notifyListeners();
      return true;
    } catch (e) {
      return false;
    }
  }
}
