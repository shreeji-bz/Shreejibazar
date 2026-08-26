class NotificationEntity {
  final String id;
  final String userId;
  final String title;
  final String message;
  final String? image;
  final String type;
  final String? deepLink;
  final bool isRead;
  final DateTime? scheduledAt;
  final String status;
  final DateTime createdAt;

  NotificationEntity({
    required this.id,
    required this.userId,
    required this.title,
    required this.message,
    this.image,
    required this.type,
    this.deepLink,
    required this.isRead,
    this.scheduledAt,
    required this.status,
    required this.createdAt,
  });
}
