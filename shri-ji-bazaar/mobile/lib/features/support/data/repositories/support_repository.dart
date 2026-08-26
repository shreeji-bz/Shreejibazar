class SupportRepository implements ISupportRepository {
  final SupportDatasource _datasource;
  SupportRepository(this._datasource);

  @override
  Future<List<TicketEntity>> getTickets() async {
    return await _datasource.getTickets();
  }

  @override
  Future<TicketEntity> getTicketById(String id) async {
    return await _datasource.getTicketById(id);
  }

  @override
  Future<TicketEntity> createTicket({required String subject, required String category, required String description, String? attachment}) async {
    return await _datasource.createTicket(subject: subject, category: category, description: description, attachment: attachment);
  }

  @override
  Future<void> addMessage(String ticketId, {required String message, String? attachment}) async {
    return await _datasource.addMessage(ticketId, message: message, attachment: attachment);
  }
}
