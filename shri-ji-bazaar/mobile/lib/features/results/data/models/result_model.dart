import '../../domain/entities/result_entity.dart';

class ResultModel extends ResultEntity {
  ResultModel({
    required super.id,
    required super.gameId,
    required super.gameName,
    required super.roundId,
    required super.roundNumber,
    required super.result,
    required super.resultTime,
    required super.createdAt,
  });

  factory ResultModel.fromJson(Map<String, dynamic> json) {
    return ResultModel(
      id: json['id'] as String,
      gameId: json['game_id'] as String,
      gameName: json['game_name'] as String,
      roundId: json['round_id'] as String,
      roundNumber: json['round_number'] as String,
      result: json['result'] as String,
      resultTime: DateTime.parse(json['result_time'] as String),
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }
}
