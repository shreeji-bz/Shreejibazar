/// Per-game play configuration.
///
/// Not every game supports every play type. This lets each game declare which
/// modes its tab bar shows, the number format each mode accepts, and the
/// stake bounds. The play screen reads this to render only what the game
/// supports — no assumption that all games are identical.
class GamePlayConfig {
  final List<String> playTypes; // the tabs to show, in order
  final int minStake;
  final int maxStake;

  const GamePlayConfig({
    required this.playTypes,
    this.minStake = 10,
    this.maxStake = 1000,
  });

  /// Default config: all four backend play types.
  static const GamePlayConfig standard = GamePlayConfig(
    playTypes: ['single', 'jodi', 'double', 'panel'],
  );

  /// Number format a given play type requires (mirrors backend validation).
  static int digitsFor(String playType) =>
      playType == 'single' ? 1 : (playType == 'panel' ? 3 : 2);

  /// Human label for a play type.
  static String labelFor(String playType) => playType.toUpperCase();
}
