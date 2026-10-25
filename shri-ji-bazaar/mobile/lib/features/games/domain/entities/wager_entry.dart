/// One pending (not-yet-submitted) wager line in the play screen.
/// Stable [uid] so the saved-entry table can be keyed without duplication.
class WagerEntry {
  final String uid; // local-only stable id (not sent to the server)
  final String playType; // single | jodi | panel | double
  final String selection; // the digits the user picked
  final int pointsStaked;
  final String? sourceGameId; // set when created via Copy-Paste bulk entry

  WagerEntry({
    required this.uid,
    required this.playType,
    required this.selection,
    required this.pointsStaked,
    this.sourceGameId,
  });

  WagerEntry copyWith({String? selection, int? pointsStaked}) => WagerEntry(
        uid: uid,
        playType: playType,
        selection: selection ?? this.selection,
        pointsStaked: pointsStaked ?? this.pointsStaked,
        sourceGameId: sourceGameId,
      );
}
