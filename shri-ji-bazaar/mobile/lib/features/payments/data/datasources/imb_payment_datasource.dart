import '../../../../../core/network/api_service.dart';

class ImbPaymentDatasource {
  final ApiService _api = ApiService();

  Future<Map<String, dynamic>> createImbOrder(double amount, {String? description}) async {
    final result = await _api.post('/payments/imb/create-order', data: {
      'amount': amount,
      if (description != null && description.isNotEmpty) 'description': description,
    });
    return result as Map<String, dynamic>;
  }
}
