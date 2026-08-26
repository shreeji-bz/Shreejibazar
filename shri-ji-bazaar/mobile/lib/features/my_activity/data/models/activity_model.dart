import '../../domain/entities/activity_entity.dart';

class ActivityModel extends ActivityEntity {
  ActivityModel({
    required super.id,
    required super.userId,
    required super.gameId,
    required super.gameName,
    required super.roundId,
    required super.roundNumber,
    required super.playType,
    required super.selection,
    required super.points,
    super.result,
    required super.status,
    required super.createdAt,
  });

  factory ActivityModel.fromJson(Map<String, dynamic> json) {
    return ActivityModel(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      gameId: json['game_id'] as String,
      gameName: json['game_name'] as String,
      roundId: json['round_id'] as String,
      roundNumber: json['round_number'] as String,
      playType: json['play_type'] as String,
      selection: json['selection'] as String,
      points: json['points'] as int,
      result: json['result'] as String?,
      status: json['status'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }
}
