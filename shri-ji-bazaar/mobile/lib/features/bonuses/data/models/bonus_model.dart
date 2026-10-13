import '../../domain/entities/bonus_entity.dart';

class BonusModel extends BonusEntity {
  BonusModel({
    required super.id,
    required super.name,
    required super.description,
    required super.slug,
    required super.type,
    required super.status,
    required super.points,
    super.startDate,
    super.endDate,
    required super.claimed,
    super.claimedAt,
    required super.createdAt,
  });

  factory BonusModel.fromJson(Map<String, dynamic> json) {
    final raw = json['bonus_type'] as String?;
    return BonusModel(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String? ?? '',
      slug: json['slug'] as String? ?? (raw ?? 'general'),
      type: raw ?? 'general',
      status: json['is_active'] == true ? 'active' : (json['status'] as String? ?? 'active'),
      points: json['points_amount'] as int? ?? json['points'] as int? ?? 0,
      startDate: json['valid_from'] != null ? DateTime.tryParse(json['valid_from']) : null,
      endDate: json['valid_until'] != null ? DateTime.tryParse(json['valid_until']) : null,
      claimed: json['claimed'] as bool? ?? false,
      claimedAt: json['claimed_at'] != null ? DateTime.tryParse(json['claimed_at']) : null,
      createdAt: json['created_at'] != null ? DateTime.parse(json['created_at']) : DateTime.now(),
    );
  }
}
