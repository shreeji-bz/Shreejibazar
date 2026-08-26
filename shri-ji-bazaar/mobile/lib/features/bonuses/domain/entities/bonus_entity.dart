class BonusEntity {
  final String id;
  final String name;
  final String slug;
  final String description;
  final int points;
  final String type;
  final String status;
  final DateTime? startDate;
  final DateTime? endDate;
  final bool claimed;
  final DateTime? claimedAt;
  final DateTime createdAt;

  BonusEntity({
    required this.id,
    required this.name,
    required this.slug,
    required this.description,
    required this.points,
    required this.type,
    required this.status,
    this.startDate,
    this.endDate,
    required this.claimed,
    this.claimedAt,
    required this.createdAt,
  });
}
