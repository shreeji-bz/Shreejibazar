import '../../../core/network/api_service.dart';
import '../../domain/entities/support/ticket_entity.dart';

class SupportDatasource {
  final ApiService _api = ApiService();

  Future<List<TicketEntity>> getTickets() async {
    final data = await _api.get('/support/tickets');
    return (data as List).map((e) => TicketModel.fromJson(e)).toList();
  }

  Future<TicketEntity> getTicketById(String id) async {
    final data = await _api.get('/support/tickets/$id');
    return TicketModel.fromJson(data);
  }

  Future<TicketEntity> createTicket({required String subject, required String category, required String description, String? attachment}) async {
    final data = await _api.post('/support/tickets', data: {
      'subject': subject,
      'category': category,
      'description': description,
      if (attachment != null) 'attachment': attachment,
    });
    return TicketModel.fromJson(data);
  }

  Future<void> addMessage(String ticketId, {required String message, String? attachment}) async {
    await _api.post('/support/tickets/$ticketId/messages', data: {
      'message': message,
      if (attachment != null) 'attachment': attachment,
    });
  }
}
