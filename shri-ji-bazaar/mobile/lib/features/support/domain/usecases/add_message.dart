import '../../domain/repositories/isupport_repository.dart';

class AddMessage {
  final ISupportRepository _repository;
  AddMessage(this._repository);
  Future<void> call(String ticketId, {required String message, String? attachment}) async {
    return await _repository.addMessage(ticketId, message: message, attachment: attachment);
  }
}
