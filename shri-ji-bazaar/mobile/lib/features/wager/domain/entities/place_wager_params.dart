class PlaceWagerParams {
  final String gameId;
  final String roundId;
  final String playType;
  final String selection;
  final int pointsStaked;
  final String? gameName;

  PlaceWagerParams({
    required this.gameId,
    required this.roundId,
    required this.playType,
    required this.selection,
    required this.pointsStaked,
    this.gameName,
  });

  Map<String, dynamic> toJson() => {
        'gameId': gameId,
        'roundId': roundId,
        'playType': playType,
        'selection': selection,
        'pointsStaked': pointsStaked,
        if (gameName != null) 'gameName': gameName,
      };
}
