import '../entities/ticket_entity.dart';
import '../repositories/isupport_repository.dart';

class GetTickets {
  final ISupportRepository _repository;
  GetTickets(this._repository);
  Future<List<TicketEntity>> call() async => await _repository.getTickets();
}
