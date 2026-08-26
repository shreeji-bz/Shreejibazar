class BannerEntity {
  final String id;
  final String title;
  final String image;
  final String description;
  final String action;
  final String actionValue;
  final int sortOrder;
  final DateTime? startDate;
  final DateTime? endDate;

  const BannerEntity({
    required this.id,
    required this.title,
    required this.image,
    required this.description,
    required this.action,
    required this.actionValue,
    required this.sortOrder,
    this.startDate,
    this.endDate,
  });
}
