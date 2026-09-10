import '../../domain/entities/wager_entity.dart';

class WagerModel extends WagerEntity {
  WagerModel({
    required super.id,
    required super.userId,
    required super.gameId,
    required super.gameName,
    required super.roundId,
    required super.playType,
    required super.selection,
    required super.pointsStaked,
    required super.potentialPayout,
    required super.status,
    super.resultStatus,
    super.resultText,
    super.pointsWon,
    required super.placedAt,
    super.settledAt,
  });

  factory WagerModel.fromJson(Map<String, dynamic> json) {
    return WagerModel(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      gameId: json['game_id'] as String,
      gameName: json['game_name'] as String,
      roundId: json['round_id'] as String,
      playType: json['play_type'] as String,
      selection: json['selection'] as String,
      pointsStaked: json['points_staked'] as int,
      potentialPayout: json['potential_payout'] as int,
      status: json['status'] as String,
      resultStatus: json['result_status'] as String?,
      resultText: json['result_text'] as String?,
      pointsWon: json['points_won'] as int?,
      placedAt: DateTime.parse(json['placed_at'] as String),
      settledAt: json['settled_at'] != null ? DateTime.parse(json['settled_at'] as String) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'game_id': gameId,
      'game_name': gameName,
      'round_id': roundId,
      'play_type': playType,
      'selection': selection,
      'points_staked': pointsStaked,
      'potential_payout': potentialPayout,
      'status': status,
      if (resultStatus != null) 'result_status': resultStatus,
      if (resultText != null) 'result_text': resultText,
      if (pointsWon != null) 'points_won': pointsWon,
      'placed_at': placedAt.toIso8601String(),
      if (settledAt != null) 'settled_at': settledAt!.toIso8601String(),
    };
  }

  WagerModel copyWith({
    String? id,
    String? userId,
    String? gameId,
    String? gameName,
    String? roundId,
    String? playType,
    String? selection,
    int? pointsStaked,
    int? potentialPayout,
    String? status,
    String? resultStatus,
    String? resultText,
    int? pointsWon,
    DateTime? placedAt,
    DateTime? settledAt,
  }) {
    return WagerModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      gameId: gameId ?? this.gameId,
      gameName: gameName ?? this.gameName,
      roundId: roundId ?? this.roundId,
      playType: playType ?? this.playType,
      selection: selection ?? this.selection,
      pointsStaked: pointsStaked ?? this.pointsStaked,
      potentialPayout: potentialPayout ?? this.potentialPayout,
      status: status ?? this.status,
      resultStatus: resultStatus ?? this.resultStatus,
      resultText: resultText ?? this.resultText,
      pointsWon: pointsWon ?? this.pointsWon,
      placedAt: placedAt ?? this.placedAt,
      settledAt: settledAt ?? this.settledAt,
    );
  }
}
