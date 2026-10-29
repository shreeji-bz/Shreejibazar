import 'package:flutter_test/flutter_test.dart';
import 'package:shri_ji_bazaar/core/network/api_service.dart';
import 'package:shri_ji_bazaar/features/games/presentation/controllers/play_game_controller.dart';

/// These tests pin down the market-window business rule: a market only
/// accepts bets BETWEEN its start_time and end_time - never before it
/// starts, never after it closes. They drive the PlayGameController getters
/// directly (no network) with a round whose window we control.
void main() {
  final api = ApiService();
  final controller = PlayGameController(gameId: 'game-1', api: api);

  void setRound({required DateTime start, required DateTime end, String? result}) {
    // "today" (local) so the getters use activeRound (not dateRound) -
    // mirrors PlayGameController._today() which is private to its library.
    final d = DateTime.now();
    controller.selectedDate =
        '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
    final r = <String, dynamic>{
      'id': 'round-1',
      'status': 'open',
      'start_time': start.toUtc().toIso8601String(),
      'end_time': end.toUtc().toIso8601String(),
    };
    if (result != null) r['result'] = result;
    controller.activeRound = r;
    controller.dateRound = null;
  }

  group('market window gating', () {
    test('market not started yet -> notStartedYet', () {
      final start = DateTime.now().toLocal().add(const Duration(hours: 3));
      final end = start.add(const Duration(minutes: 30));
      setRound(start: start, end: end);
      expect(controller.notStartedYet, true);
      expect(controller.marketClosed, false);
      expect(controller.notStartedYetMessage(), contains('opens at'));
    });

    test('market live (inside window) -> bettable', () {
      final start = DateTime.now().toLocal().subtract(const Duration(minutes: 10));
      final end = start.add(const Duration(minutes: 30));
      setRound(start: start, end: end);
      expect(controller.notStartedYet, false);
      expect(controller.marketClosed, false);
      expect(controller.canBet, true);
    });

    test('market closed (window passed) -> not bettable, shows closed state', () {
      final end = DateTime.now().toLocal().subtract(const Duration(minutes: 5));
      final start = end.subtract(const Duration(minutes: 30));
      setRound(start: start, end: end);
      expect(controller.notStartedYet, false);
      expect(controller.marketClosed, true);
      expect(controller.canBet, false, reason: 'no more bets after the window');
      expect(controller.marketClosedMessage(), contains('closed'));
    });

    test('market closed with a declared result -> surfaces it', () {
      final end = DateTime.now().toLocal().subtract(const Duration(minutes: 5));
      final start = end.subtract(const Duration(minutes: 30));
      setRound(start: start, end: end, result: '42');
      expect(controller.marketClosed, true);
      expect(controller.marketClosedMessage(), contains('42'));
    });
  });
}
