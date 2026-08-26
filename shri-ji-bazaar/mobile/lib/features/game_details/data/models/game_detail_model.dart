import '../../domain/entities/game_detail_entity.dart';

class GameDetailModel extends GameDetailEntity {
  GameDetailModel({
    required super.id,
    required super.name,
    required super.slug,
    required super.description,
    required super.image,
    required super.openingTime,
    required super.closingTime,
    required super.resultTime,
    required super.status,
    required super.isPopular,
    required super.sortOrder,
    required super.createdAt,
    required super.updatedAt,
    required super.rounds,
  });

  factory GameDetailModel.fromJson(Map<String, dynamic> json) {
    final roundsList = json['rounds'] as List<dynamic>? ?? [];
    return GameDetailModel(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      description: json['description'] as String? ?? '',
      image: json['image'] as String? ?? '',
      openingTime: json['opening_time'] as String? ?? '',
      closingTime: json['closing_time'] as String? ?? '',
      resultTime: json['result_time'] as String? ?? '',
      status: json['status'] as String? ?? 'active',
      isPopular: json['is_popular'] as bool? ?? false,
      sortOrder: json['sort_order'] as int? ?? 0,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      rounds: roundsList.map((r) => RoundModel.fromJson(r)).toList(),
    );
  }
}

class RoundModel extends RoundEntity {
  RoundModel({
    required super.id,
    required super.gameId,
    required super.roundNumber,
    required super.startTime,
    required super.endTime,
    super.result,
    required super.status,
    required super.createdAt,
    required super.updatedAt,
  });

  factory RoundModel.fromJson(Map<String, dynamic> json) {
    return RoundModel(
      id: json['id'] as String,
      gameId: json['game_id'] as String,
      roundNumber: json['round_number'] as String,
      startTime: json['start_time'] as String,
      endTime: json['end_time'] as String,
      result: json['result'] as String?,
      status: json['status'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }
}
