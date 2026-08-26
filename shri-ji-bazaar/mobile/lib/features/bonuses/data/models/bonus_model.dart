import '../../domain/entities/bonus_entity.dart';

class BonusModel extends BonusEntity {
  BonusModel({
    required super.id,
    required super.name,
    required super.slug,
    required super.description,
    required super.points,
    required super.type,
    required super.status,
    super.startDate,
    super.endDate,
    required super.claimed,
    super.claimedAt,
    required super.createdAt,
  });

  factory BonusModel.fromJson(Map<String, dynamic> json) {
    return BonusModel(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      description: json['description'] as String? ?? '',
      points: json['points'] as int,
      type: json['type'] as String,
      status: json['status'] as String,
      startDate: json['start_date'] != null ? DateTime.parse(json['start_date'] as String) : null,
      endDate: json['end_date'] != null ? DateTime.parse(json['end_date'] as String) : null,
      claimed: json['claimed'] as bool? ?? false,
      claimedAt: json['claimed_at'] != null ? DateTime.parse(json['claimed_at'] as String) : null,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }
}
