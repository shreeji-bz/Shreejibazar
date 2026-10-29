/// One pending (not-yet-submitted) wager line in the play screen.
/// Stable [uid] so the saved-entry table can be keyed without duplication.
class WagerEntry {
  final String uid; // local-only stable id (not sent to the server)
  final String playType; // single | jodi | panel | double | crossing | palti
  final String selection; // the digits the user picked
  final int pointsStaked;
  final bool palti; // Copy-Paste "With Palti" — also cover the reversal
  final String? sourceGameId; // set when created via Copy-Paste bulk entry

  WagerEntry({
    required this.uid,
    required this.playType,
    required this.selection,
    required this.pointsStaked,
    this.palti = false,
    this.sourceGameId,
  });

  WagerEntry copyWith({
    String? selection,
    int? pointsStaked,
    bool? palti,
  }) =>
      WagerEntry(
        uid: uid,
        playType: playType,
        selection: selection ?? this.selection,
        pointsStaked: pointsStaked ?? this.pointsStaked,
        palti: palti ?? this.palti,
        sourceGameId: sourceGameId,
      );
}
