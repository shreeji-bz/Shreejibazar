class WagerEntity {
  final String id;
  final String userId;
  final String gameId;
  final String gameName;
  final String roundId;
  final String playType;
  final String selection;
  final int pointsStaked;
  final int potentialPayout;
  final String status;
  final String? resultStatus;
  final String? resultText;
  final int? pointsWon;
  final DateTime placedAt;
  final DateTime? settledAt;

  const WagerEntity({
    required this.id,
    required this.userId,
    required this.gameId,
    required this.gameName,
    required this.roundId,
    required this.playType,
    required this.selection,
    required this.pointsStaked,
    required this.potentialPayout,
    required this.status,
    this.resultStatus,
    this.resultText,
    this.pointsWon,
    required this.placedAt,
    this.settledAt,
  });
}

class WagerListResponse {
  final List<WagerEntity> wagers;
  final int page;
  final int limit;
  final int total;
  final int totalPages;

  const WagerListResponse({
    required this.wagers,
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });
}
