class ActivityEntity {
  final String id;
  final String userId;
  final String gameId;
  final String gameName;
  final String roundId;
  final String roundNumber;
  final String playType;
  final String selection;
  final int points;
  final String? result;
  final String status;
  final DateTime createdAt;

  ActivityEntity({
    required this.id,
    required this.userId,
    required this.gameId,
    required this.gameName,
    required this.roundId,
    required this.roundNumber,
    required this.playType,
    required this.selection,
    required this.points,
    this.result,
    required this.status,
    required this.createdAt,
  });
}
