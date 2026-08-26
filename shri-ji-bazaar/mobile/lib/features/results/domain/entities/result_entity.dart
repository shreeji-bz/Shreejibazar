class ResultEntity {
  final String id;
  final String gameId;
  final String gameName;
  final String roundId;
  final String roundNumber;
  final String result;
  final DateTime resultTime;
  final DateTime createdAt;

  ResultEntity({
    required this.id,
    required this.gameId,
    required this.gameName,
    required this.roundId,
    required this.roundNumber,
    required this.result,
    required this.resultTime,
    required this.createdAt,
  });
}
