class GameDetailEntity extends GameEntity {
  final List<RoundEntity> rounds;

  GameDetailEntity({
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
