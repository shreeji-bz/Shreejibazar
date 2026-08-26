import '../../domain/entities/notification_entity.dart';

class NotificationModel extends NotificationEntity {
  NotificationModel({
    required super.id,
    required super.userId,
    required super.title,
    required super.message,
    super.image,
    required super.type,
    super.deepLink,
    required super.isRead,
    super.scheduledAt,
    required super.status,
    required super.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      title: json['title'] as String,
      message: json['message'] as String,
      image: json['image'] as String?,
      type: json['type'] as String,
      deepLink: json['deep_link'] as String?,
      isRead: json['is_read'] as bool? ?? false,
      scheduledAt: json['scheduled_at'] != null ? DateTime.parse(json['scheduled_at'] as String) : null,
      status: json['status'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }
}
