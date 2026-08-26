class TicketEntity {
  final String id;
  final String userId;
  final String subject;
  final String category;
  final String description;
  final String? attachment;
  final String status;
  final String priority;
  final DateTime? resolvedAt;
  final List<TicketMessageEntity> messages;
  final DateTime createdAt;
  final DateTime updatedAt;

  TicketEntity({
    required this.id,
    required this.userId,
    required this.subject,
    required this.category,
    required this.description,
    this.attachment,
    required this.status,
    required this.priority,
    this.resolvedAt,
    required this.messages,
    required this.createdAt,
    required this.updatedAt,
  });
}

class TicketMessageEntity {
  final String id;
  final String ticketId;
  final String senderId;
  final String senderType;
  final String message;
  final String? attachment;
  final DateTime createdAt;

  TicketMessageEntity({
    required this.id,
    required this.ticketId,
    required this.senderId,
    required this.senderType,
    required this.message,
    this.attachment,
    required this.createdAt,
  });
}
