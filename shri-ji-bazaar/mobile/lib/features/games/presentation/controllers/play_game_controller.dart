import 'package:flutter/foundation.dart';
import 'package:shri_ji_bazaar/core/network/api_service.dart';
import '../../domain/entities/wager_entry.dart';
import '../../domain/game_play_config.dart';

/// State + business logic for the Play Game screen.
///
/// Follows the app's established Provider/ChangeNotifier pattern. Entry lists
/// are kept per-game so switching games does not leak state between them.
class PlayGameController extends ChangeNotifier {
  final String gameId;
  final ApiService _api;

  Map<String, dynamic>? game;
  Map<String, dynamic>? activeRound;
  GamePlayConfig config = GamePlayConfig.standard;

  int activeTabIndex = 0;
  final Map<int, List<WagerEntry>> _entries = {};

  bool submitting = false;
  bool loading = true;
  String? errorMessage;

  PlayGameController({required this.gameId, required ApiService api}) : _api = api;

  List<String> get activePlayTypes => config.playTypes;

  /// The entries for the currently-selected tab (mode). Each tab keeps its own
  /// isolated list so switching modes never mixes the inputs together.
  List<WagerEntry> get currentEntries => _entries[activeTabIndex] ?? const [];

  int get totalStake => currentEntries.fold(0, (sum, e) => sum + e.pointsStaked);

  Future<void> load() async {
    loading = true;
    errorMessage = null;
    notifyListeners();
    try {
      final results = await Future.wait([
        _api.get('/games/$gameId'),
        _api.get('/rounds/active', queryParameters: {'gameId': gameId}).catchError((_) async => null),
      ]);
      game = results[0] as Map<String, dynamic>?;
      activeRound = results[1] as Map<String, dynamic>?;
      // Configure which play types this game supports.
      config = _resolveConfig();
      if (activeTabIndex >= config.playTypes.length) activeTabIndex = 0;
      // Clear any leftover entries from a previous game so state never leaks.
      _entries.clear();
      notifyListeners();
    } on ApiException catch (e) {
      errorMessage = e.message;
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  GamePlayConfig _resolveConfig() {
    // The games API now returns a per-game playConfig: {playTypes, minStake,
    // maxStake}. When present, the play screen uses this game's own modes and
    // stake bounds; when absent, it falls back to the standard set. This is
    // the single place to branch.
    final raw = game?['play_config'] ?? game?['playConfig'];
    if (raw is! Map || raw.isEmpty) return GamePlayConfig.standard;

    final m = Map<String, dynamic>.from(raw);
    final playTypes = (m['playTypes'] ?? m['play_types']) as List<dynamic>?;
    final resolved = (playTypes ?? const []).map((t) => t.toString()).toList();
    return GamePlayConfig(
      playTypes: resolved.isEmpty ? GamePlayConfig.standard.playTypes : resolved,
      minStake: ((m['minStake'] ?? m['min_stake']) as num?)?.toInt() ?? 10,
      maxStake: ((m['maxStake'] ?? m['max_stake']) as num?)?.toInt() ?? 1000,
    );
  }

  void selectTab(int index) {
    if (index < 0 || index >= activePlayTypes.length || index == activeTabIndex) return;
    activeTabIndex = index;
    notifyListeners();
  }

  void addEntry({required String selection, required int pointsStaked}) {
    _entries.putIfAbsent(activeTabIndex, () => []).add(WagerEntry(
      uid: '$activeTabIndex-${DateTime.now().microsecondsSinceEpoch}',
      playType: activePlayTypes[activeTabIndex],
      selection: selection,
      pointsStaked: pointsStaked,
    ));
    notifyListeners();
  }

  void addEntries(List<WagerEntry> newEntries) {
    final list = _entries.putIfAbsent(activeTabIndex, () => []);
    list.addAll(newEntries);
    notifyListeners();
  }

  /// Dedupe identical (playType+selection) lines, dropping exact duplicates.
  void dedupeCurrent() {
    final list = _entries[activeTabIndex];
    if (list == null || list.length <= 1) return;
    final seen = <String>{};
    final kept = <WagerEntry>[];
    for (final e in list) {
      final key = '${e.playType}:${e.selection}';
      if (!seen.add(key)) continue;
      kept.add(e);
    }
    _entries[activeTabIndex] = kept;
    notifyListeners();
  }

  void removeEntry(WagerEntry entry) {
    _entries[activeTabIndex]?.removeWhere((e) => e.uid == entry.uid);
    notifyListeners();
  }

  void clearCurrent() {
    _entries.remove(activeTabIndex);
    notifyListeners();
  }

  /// Posts every entry in the current tab as its own wager. Idempotency key
  /// per entry prevents duplicate submissions on repeated clicks.
  Future<bool> submitAll() async {
    final list = currentEntries;
    if (list.isEmpty) return false;
    if (submitting) return false; // guard against repeated taps
    submitting = true;
    errorMessage = null;
    notifyListeners();
    try {
      final roundId = activeRound?['id'] as String?;
      for (final e in list) {
        await _api.post('/wagers', data: {
          'gameId': gameId,
          'roundId': roundId ?? '',
          'playType': e.playType,
          'selection': e.selection,
          'pointsStaked': e.pointsStaked,
          'idempotencyKey': e.uid,
        });
      }
      _entries.remove(activeTabIndex); // clear after successful submit
      notifyListeners();
      return true;
    } on ApiException catch (err) {
      errorMessage = err.message;
      notifyListeners();
      return false;
    } finally {
      submitting = false;
      notifyListeners();
    }
  }

  /// Refresh the active round after a submit so the countdown / round id stay
  /// current.
  Future<void> refreshRound() async {
    activeRound = await _api.get('/rounds/active', queryParameters: {'gameId': gameId}).catchError((_) => null);
    notifyListeners();
  }
}
