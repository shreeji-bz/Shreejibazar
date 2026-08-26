import '../../domain/entities/ticket_entity.dart';

class TicketModel extends TicketEntity {
  TicketModel({
    required super.id,
    required super.userId,
    required super.subject,
    required super.category,
    required super.description,
    super.attachment,
    required super.status,
    required super.priority,
    super.resolvedAt,
    required super.messages,
    required super.createdAt,
    required super.updatedAt,
  });

  factory TicketModel.fromJson(Map<String, dynamic> json) {
    final messagesList = json['messages'] as List<dynamic>? ?? [];
    return TicketModel(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      subject: json['subject'] as String,
      category: json['category'] as String,
      description: json['description'] as String,
      attachment: json['attachment'] as String?,
      status: json['status'] as String,
      priority: json['priority'] as String,
      resolvedAt: json['resolved_at'] != null ? DateTime.parse(json['resolved_at'] as String) : null,
      messages: messagesList.map((m) => TicketMessageModel.fromJson(m)).toList(),
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }
}

class TicketMessageModel extends TicketMessageEntity {
  TicketMessageModel({
    required super.id,
    required super.ticketId,
    required super.senderId,
    required super.senderType,
    required super.message,
    super.attachment,
    required super.createdAt,
  });

  factory TicketMessageModel.fromJson(Map<String, dynamic> json) {
    return TicketMessageModel(
      id: json['id'] as String,
      ticketId: json['ticket_id'] as String,
      senderId: json['sender_id'] as String,
      senderType: json['sender_type'] as String,
      message: json['message'] as String,
      attachment: json['attachment'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }
}
