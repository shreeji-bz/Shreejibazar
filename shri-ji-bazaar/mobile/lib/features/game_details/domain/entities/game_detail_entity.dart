class GameDetailEntity {
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
  final List<RoundEntity> rounds;

  GameDetailEntity({
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
    required this.rounds,
  });
}

class RoundEntity {
  final String id;
  final String gameId;
  final String roundNumber;
  final String startTime;
  final String endTime;
  final String? result;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;

  RoundEntity({
    required this.id,
    required this.gameId,
    required this.roundNumber,
    required this.startTime,
    required this.endTime,
    this.result,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });
}
