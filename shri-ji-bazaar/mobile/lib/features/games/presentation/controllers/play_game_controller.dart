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
  Map<String, dynamic>? dateRound; // round for the user-selected date
  String selectedDate; // YYYY-MM-DD, local
  GamePlayConfig config = GamePlayConfig.standard;

  int activeTabIndex = 0;
  final Map<int, List<WagerEntry>> _entries = {};

  bool submitting = false;
  bool loading = true;
  String? errorMessage;

  PlayGameController({required this.gameId, required ApiService api})
      : _api = api,
        selectedDate = _today();

  List<String> get activePlayTypes => config.tabs;
  List<String> get tabs => config.tabs;

  /// The round to bet against. When "today" is selected we bet on the live
  /// open round; when a specific (future) date is selected we bet on that
  /// date's market round.
  Map<String, dynamic>? get effectiveRound {
    final isToday = selectedDate == _today();
    if (isToday) return activeRound;
    return dateRound;
  }

  static String _two(int n) => n.toString().padLeft(2, '0');

  /// Today's local date as YYYY-MM-DD.
  static String _today() {
    final d = DateTime.now();
    return '${d.year}-${_two(d.month)}-${_two(d.day)}';
  }

  /// Tomorrow's local date as YYYY-MM-DD.
  static String _tomorrow() {
    final d = DateTime.now().add(const Duration(days: 1));
    return '${d.year}-${_two(d.month)}-${_two(d.day)}';
  }

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
        _loadDateRound(selectedDate),
      ]);
      game = results[0] as Map<String, dynamic>?;
      activeRound = results[1] as Map<String, dynamic>?;
      dateRound = results[2] as Map<String, dynamic>?;
      // Configure which play types this game supports.
      config = _resolveConfig();
      if (activeTabIndex >= config.tabs.length) activeTabIndex = 0;
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
    // The games API now returns a per-game playConfig: {tabs (or playTypes),
    // minStake, maxStake}. When present, the play screen uses this game's own
    // tabs and stake bounds; when absent, it falls back to the standard set.
    final raw = game?['play_config'] ?? game?['playConfig'];
    if (raw is! Map || raw.isEmpty) return GamePlayConfig.standard;

    final m = Map<String, dynamic>.from(raw);
    final tabs = ((m['tabs'] ?? m['playTypes'] ?? m['play_types']) as List<dynamic>? ?? const [])
        .map((t) => t.toString())
        .toList();
    return GamePlayConfig(
      tabs: tabs.isEmpty ? GamePlayConfig.standard.tabs : tabs,
      minStake: ((m['minStake'] ?? m['min_stake']) as num?)?.toInt() ?? 10,
      maxStake: ((m['maxStake'] ?? m['max_stake']) as num?)?.toInt() ?? 1000,
    );
  }

  /// The round that lives on a given local date for this game (date-wise
  /// markets). Returns null when that day's round doesn't exist yet.
  Future<Map<String, dynamic>?> _loadDateRound(String date) async {
    try {
      final list = await _api.get('/rounds/game/$gameId', queryParameters: {'date': date, 'limit': 1});
      if (list is List && list.isNotEmpty && list.first is Map) {
        return Map<String, dynamic>.from(list.first as Map);
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  /// Switch the date-wise market the user is betting on. Re-fetches that day's
  /// round and clears the current tab's entries so a stale bet never carries
  /// over to a different date.
  Future<void> selectDate(String date) async {
    if (date == selectedDate) return;
    selectedDate = date;
    dateRound = await _loadDateRound(date);
    _entries.remove(activeTabIndex);
    notifyListeners();
  }

  /// Whether a round is available to bet on for the current view. A picked
  /// date with no generated round yet does NOT silently fall back to the
  /// live round — the user must see "no market for this date".
  bool get canBet {
    if (selectedDate == _today()) return (activeRound != null || dateRound != null) && !marketClosed;
    return dateRound != null && !marketClosed;
  }

  /// The market exists but has NOT reached its start time yet. Bets on a
  /// not-yet-open market must be blocked (the backend also rejects them).
  bool get notStartedYet {
    final round = effectiveRound;
    if (round == null) return false;
    final startMs = _parseMillis(round['start_time'] ?? round['startTime']);
    return startMs != null && DateTime.now().millisecondsSinceEpoch < startMs;
  }

  /// The market's bet window has passed (end_time is in the past) and no
  /// result is declared yet — no more bets may be placed on it.
  bool get marketClosed {
    final round = effectiveRound;
    if (round == null) return false;
    final endMs = _parseMillis(round['end_time'] ?? round['endTime']);
    return endMs != null && DateTime.now().millisecondsSinceEpoch > endMs;
  }

  /// Human start time of the effective round, for the "opens at" message.
  String? get roundOpensAt {
    final round = effectiveRound;
    if (round == null) return null;
    final startMs = _parseMillis(round['start_time'] ?? round['startTime']);
    if (startMs == null) return null;
    return DateTime.fromMillisecondsSinceEpoch(startMs).toLocal().toString().split('.').first;
  }

  static int? _parseMillis(dynamic raw) {
    if (raw == null) return null;
    final t = DateTime.tryParse(raw.toString());
    return t?.millisecondsSinceEpoch;
  }

  /// Message for the blocked-before-open case.
  String notStartedYetMessage() {
    final when = roundOpensAt;
    return when != null ? 'This market opens at $when — no bets yet.' : 'This market has not opened yet.';
  }

  /// Message for the window-passed case.
  String marketClosedMessage() {
    final round = effectiveRound;
    final result = round?['result'] ?? round?['result_value'];
    if (result == null || result.toString().isEmpty) {
      return 'Betting closed for this market.\nWaiting for the result to be declared.';
    }
    return 'Result: $result';
  }

  void selectTab(int index) {
    if (index < 0 || index >= activePlayTypes.length || index == activeTabIndex) return;
    activeTabIndex = index;
    notifyListeners();
  }

  /// [playType] overrides the active tab's type. This matters because the Jodi
  /// tab hosts two zones that produce different bet types: the 00–99 grid
  /// (a `jodi` pick) and the Andar Haruf 0–9 row (a `single` pick).
  void addEntry({
    required String selection,
    required int pointsStaked,
    bool palti = false,
    String? playType,
  }) {
    _entries.putIfAbsent(activeTabIndex, () => []).add(WagerEntry(
      uid: '$activeTabIndex-${DateTime.now().microsecondsSinceEpoch}',
      playType: playType ?? activePlayTypes[activeTabIndex],
      selection: selection,
      pointsStaked: pointsStaked,
      palti: palti,
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
      final key = '${e.playType}:${e.selection}:${e.palti}';
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

  /// Remove any entry in the current tab matching (playType, selection).
  /// Used by the Jodi grid to "un-tap" an already-selected number.
  void removeSelection(String playType, String selection) {
    final list = _entries[activeTabIndex];
    if (list == null) return;
    list.removeWhere((e) => e.playType == playType && e.selection == selection);
    if (list.isEmpty) _entries.remove(activeTabIndex);
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
    // A market that hasn't reached its start time takes no bets yet.
    if (notStartedYet) {
      errorMessage = notStartedYetMessage();
      notifyListeners();
      return false;
    }
    // A market whose window has passed takes no more bets.
    if (marketClosed) {
      errorMessage = marketClosedMessage();
      notifyListeners();
      return false;
    }
    submitting = true;
    errorMessage = null;
    notifyListeners();
    try {
      final roundId = effectiveRound?['id'] as String?;
      for (final e in list) {
        await _api.post('/wagers', data: {
          'gameId': gameId,
          'roundId': roundId ?? '',
          'playType': e.playType,
          'selection': e.selection,
          'palti': e.palti,
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
    final results = await Future.wait([
      _api.get('/rounds/active', queryParameters: {'gameId': gameId}).catchError((_) async => null),
      _loadDateRound(selectedDate),
    ]);
    activeRound = results[0] as Map<String, dynamic>?;
    dateRound = results[1] as Map<String, dynamic>?;
    notifyListeners();
  }
}
