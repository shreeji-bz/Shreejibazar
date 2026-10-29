import 'package:flutter_test/flutter_test.dart';
import 'package:shri_ji_bazaar/core/network/api_service.dart';
import 'package:shri_ji_bazaar/features/games/domain/game_play_config.dart';
import 'package:shri_ji_bazaar/features/games/presentation/controllers/play_game_controller.dart';

void main() {
  group('GamePlayConfig', () {
    test('standard config exposes the three reference tabs in order', () {
      expect(GamePlayConfig.standard.tabs, ['jodi', 'crossing', 'palti']);
    });

    test('tab labels match the reference UI', () {
      expect(GamePlayConfig.tabLabel('jodi'), 'Jodi');
      expect(GamePlayConfig.tabLabel('crossing'), 'Crossing');
      expect(GamePlayConfig.tabLabel('palti'), 'Copy Paste');
    });

    test('bet play-type labels', () {
      expect(GamePlayConfig.labelFor('single'), 'Andar Haruf');
      expect(GamePlayConfig.labelFor('jodi'), 'Jodi');
      expect(GamePlayConfig.labelFor('palti'), 'Palti');
      expect(GamePlayConfig.labelFor('crossing'), 'Crossing');
    });
  });

  group('PlayGameController (pure state ops)', () {
    late PlayGameController c;

    setUp(() {
      c = PlayGameController(gameId: 'g1', api: ApiService());
      // activeTabIndex = 0 => 'jodi' tab hosts both jodi + single entries.
    });

    test('addEntry on the jodi tab stores the tab type by default', () {
      c.addEntry(selection: '42', pointsStaked: 50);
      final e = c.currentEntries.single;
      expect(e.playType, 'jodi');
      expect(e.selection, '42');
      expect(c.totalStake, 50);
    });

    test('addEntry with explicit playType stores the Andar Haruf single', () {
      c.addEntry(selection: '7', pointsStaked: 10, playType: 'single');
      c.addEntry(selection: '42', pointsStaked: 50, playType: 'jodi');
      expect(c.currentEntries.where((e) => e.playType == 'single'), hasLength(1));
      expect(c.currentEntries.where((e) => e.playType == 'jodi'), hasLength(1));
      expect(c.totalStake, 60);
    });

    test('palti flag is stored and distinguishes otherwise-equal entries', () {
      c.addEntry(selection: '14', pointsStaked: 50, palti: true, playType: 'palti');
      c.addEntry(selection: '14', pointsStaked: 50, palti: false, playType: 'palti');
      c.dedupeCurrent();
      // Same selection, different palti -> both survive dedupe.
      expect(c.currentEntries, hasLength(2));
      c.dedupeCurrent(); // idempotent
      expect(c.currentEntries, hasLength(2));
    });

    test('dedupeCurrent drops exact duplicates only', () {
      c.addEntry(selection: '42', pointsStaked: 50, playType: 'jodi');
      c.addEntry(selection: '42', pointsStaked: 50, playType: 'jodi');
      c.dedupeCurrent();
      expect(c.currentEntries, hasLength(1));
    });

    test('removeSelection clears only the matching (type, selection)', () {
      c.addEntry(selection: '42', pointsStaked: 50, playType: 'jodi');
      c.addEntry(selection: '7', pointsStaked: 10, playType: 'single');
      c.removeSelection('jodi', '42');
      expect(c.currentEntries, hasLength(1));
      expect(c.currentEntries.single.playType, 'single');
    });

    test('entries are isolated per tab', () {
      c.addEntry(selection: '42', pointsStaked: 50, playType: 'jodi');
      c.selectTab(1); // crossing
      expect(c.currentEntries, isEmpty);
      c.selectTab(0);
      expect(c.currentEntries, hasLength(1));
    });

    test('selectTab is bounded and ignores same-tab taps', () {
      c.selectTab(0); // no-op
      c.selectTab(99); // out of range
      c.selectTab(-1);
      expect(c.activeTabIndex, 0);
    });
  });
}
