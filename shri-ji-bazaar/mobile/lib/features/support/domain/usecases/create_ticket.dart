import '../../domain/entities/ticket_entity.dart';
import '../../domain/repositories/isupport_repository.dart';

class CreateTicket {
  final ISupportRepository _repository;
  CreateTicket(this._repository);
  Future<TicketEntity> call({required String subject, required String category, required String description, String? attachment}) async {
    return await _repository.createTicket(subject: subject, category: category, description: description, attachment: attachment);
  }
}
