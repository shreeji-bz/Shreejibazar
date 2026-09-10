import '../entities/ticket_entity.dart';
import '../repositories/isupport_repository.dart';

class GetTicketById {
  final ISupportRepository _repository;
  GetTicketById(this._repository);
  Future<TicketEntity> call(String id) async => await _repository.getTicketById(id);
}
