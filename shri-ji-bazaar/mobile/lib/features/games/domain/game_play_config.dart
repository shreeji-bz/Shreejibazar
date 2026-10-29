/// Per-game play configuration.
///
/// The Play screen shows three tabs that mirror the reference UI:
///   * `jodi`     — a 00–99 grid plus an "Andar Haruf" (0–9) single-digit row
///   * `crossing` — free "digit + amount" entry
///   * `palti`    — copy-paste number with a With/Without Palti toggle
///
/// Not every game necessarily supports every tab, so each game declares the
/// tabs it shows and the stake bounds. The play screen renders only what the
/// config allows.
class GamePlayConfig {
  final List<String> tabs; // ['jodi', 'crossing', 'palti'] in order
  final int minStake;
  final int maxStake;

  const GamePlayConfig({
    required this.tabs,
    this.minStake = 10,
    this.maxStake = 1000,
  });

  /// Default config: all three tabs, in the reference order.
  static const GamePlayConfig standard = GamePlayConfig(
    tabs: ['jodi', 'crossing', 'palti'],
  );

  /// The set of UI tabs a game exposes.
  static const Set<String> allTabs = {'jodi', 'crossing', 'palti'};

  /// Tab header label.
  static String tabLabel(String tab) {
    switch (tab) {
      case 'crossing':
        return 'Crossing';
      case 'palti':
        return 'Copy Paste';
      default:
        return 'Jodi';
    }
  }

  /// Human label for a *bet* play type (used in entry tables / confirm dialog).
  static String labelFor(String playType) {
    switch (playType) {
      case 'single':
        return 'Andar Haruf';
      case 'jodi':
        return 'Jodi';
      case 'panel':
        return 'Panel';
      case 'double':
        return 'Double';
      case 'crossing':
        return 'Crossing';
      case 'palti':
        return 'Palti';
      default:
        return playType.toUpperCase();
    }
  }
}
