import '../entities/ticket_entity.dart';

abstract class ISupportRepository {
  Future<List<TicketEntity>> getTickets();
  Future<TicketEntity> getTicketById(String id);
  Future<TicketEntity> createTicket({required String subject, required String category, required String description, String? attachment});
  Future<void> addMessage(String ticketId, {required String message, String? attachment});
}
