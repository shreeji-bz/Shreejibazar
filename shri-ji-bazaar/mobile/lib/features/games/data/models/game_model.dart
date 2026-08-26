import '../../domain/entities/game_entity.dart';

class GameModel extends GameEntity {
  GameModel({
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
  });

  factory GameModel.fromJson(Map<String, dynamic> json) {
    return GameModel(
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
    );
  }
}
