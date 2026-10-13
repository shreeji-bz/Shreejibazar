class GameEntity {
  final String id;
  final String name;
  final String slug;
  final String description;
  final String image;
  final String openingTime;
  final String closingTime;
  final String resultTime;
  final String status;
  final bool isPopular;
  final int sortOrder;
  final DateTime createdAt;
  final DateTime updatedAt;

  GameEntity({
    required this.id,
    required this.name,
    required this.slug,
    required this.description,
    required this.image,
    required this.openingTime,
    required this.closingTime,
    required this.resultTime,
    required this.status,
    required this.isPopular,
    required this.sortOrder,
    required this.createdAt,
    required this.updatedAt,
  });
}
