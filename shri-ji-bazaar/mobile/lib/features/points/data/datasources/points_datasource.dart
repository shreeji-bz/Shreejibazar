import '../../../../core/network/api_service.dart';
import '../../domain/entities/points_entity.dart';
import '../models/points_model.dart';

class PointsDatasource {
  final ApiService _api = ApiService();

  Future<PointsEntity> getWallet() async {
    final data = await _api.get('/points/wallet');
    return PointsModel.fromJson(data);
  }

  Future<List<PointTransactionEntity>> getTransactions({int page = 1, int limit = 20}) async {
    final response = await _api.get('/points/transactions', queryParameters: {'page': page, 'limit': limit});
    final list = response is List ? response : (response['data'] as List? ?? []);
    return list.map((e) => PointTransactionModel.fromJson(e)).toList();
  }
}
