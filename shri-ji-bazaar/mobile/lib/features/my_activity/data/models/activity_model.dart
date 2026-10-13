import '../../domain/entities/activity_entity.dart';

class ActivityModel extends ActivityEntity {
  ActivityModel({
    required super.id,
    required super.userId,
    required super.activityType,
    required super.description,
    required super.pointsChange,
    super.metadata,
    super.gameName,
    super.roundNumber,
    required super.createdAt,
  });

  factory ActivityModel.fromJson(Map<String, dynamic> json) {
    final game = json['games'] as Map<String, dynamic>?;
    final round = json['rounds'] as Map<String, dynamic>?;
    return ActivityModel(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      activityType: json['activity_type'] as String,
      description: json['description'] as String,
      pointsChange: (json['points_change'] as int?) ?? 0,
      metadata: json['metadata'] as Map<String, dynamic>? ?? {},
      gameName: game?['name'],
      roundNumber: round?['round_number']?.toString(),
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }
}
