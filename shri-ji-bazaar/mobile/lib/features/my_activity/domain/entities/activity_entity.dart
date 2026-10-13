class ActivityEntity {
  final String id;
  final String userId;
  final String activityType;
  final String description;
  final int pointsChange;
  final String? gameName;
  final String? roundNumber;
  final Map<String, dynamic> metadata;
  final DateTime createdAt;

  ActivityEntity({
    required this.id,
    required this.userId,
    required this.activityType,
    required this.description,
    required this.pointsChange,
    this.gameName,
    this.roundNumber,
    this.metadata = const {},
    required this.createdAt,
  });
}
