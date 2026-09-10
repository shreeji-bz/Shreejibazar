import '../../../../core/errors/app_exception.dart';
import '../../domain/entities/wager_entity.dart';
import '../../domain/entities/place_wager_params.dart';
import '../../domain/repositories/iwager_repository.dart';
import '../datasources/wager_datasource.dart';

class WagerRepository implements IWagerRepository {
  final WagerDatasource _datasource;

  WagerRepository(this._datasource);

  @override
  Future<WagerEntity> placeWager(PlaceWagerParams params) async {
    try {
      final wager = await _datasource.placeWager(params.toJson());
      return wager;
    } catch (e) {
      if (e is AppException) rethrow;
      throw AppException(
        'Failed to place wager. Please try again.',
        code: 'WAGER_PLACE_ERROR',
      );
    }
  }

  @override
  Future<WagerListResponse> getWagerHistory({int page = 1, int limit = 20}) async {
    try {
      return await _datasource.getWagerHistory(page: page, limit: limit);
    } catch (e) {
      if (e is AppException) rethrow;
      throw AppException(
        'Failed to load wager history. Please try again.',
        code: 'WAGER_HISTORY_ERROR',
      );
    }
  }

  @override
  Future<WagerEntity> getWagerById(String id) async {
    try {
      final wager = await _datasource.getWagerById(id);
      return wager;
    } catch (e) {
      if (e is AppException) rethrow;
      throw AppException(
        'Failed to load wager details. Please try again.',
        code: 'WAGER_NOT_FOUND',
      );
    }
  }
}
