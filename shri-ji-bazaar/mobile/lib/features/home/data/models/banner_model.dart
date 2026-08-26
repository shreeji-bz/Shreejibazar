import '../../domain/entities/banner_entity.dart';

class BannerModel extends BannerEntity {
  BannerModel({
    required super.id,
    required super.title,
    required super.image,
    required super.description,
    required super.action,
    required super.actionValue,
    required super.sortOrder,
    super.startDate,
    super.endDate,
  });

  factory BannerModel.fromJson(Map<String, dynamic> json) {
    return BannerModel(
      id: json['id'] as String,
      title: json['title'] as String,
      image: json['image'] as String,
      description: json['description'] as String? ?? '',
      action: json['action'] as String,
      actionValue: json['action_value'] as String? ?? '',
      sortOrder: json['sort_order'] as int? ?? 0,
      startDate: json['start_date'] != null ? DateTime.parse(json['start_date'] as String) : null,
      endDate: json['end_date'] != null ? DateTime.parse(json['end_date'] as String) : null,
    );
  }
}
