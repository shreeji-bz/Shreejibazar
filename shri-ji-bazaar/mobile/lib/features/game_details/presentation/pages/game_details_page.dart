import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import 'package:shri_ji_bazaar/core/routes/route_names.dart';

class GameDetailsPage extends StatelessWidget {
  const GameDetailsPage({super.key, required this.gameId});

  final String gameId;

  static IconData _gameIcon(String name) {
    switch (name) {
      case 'Lucky 7':
        return Icons.casino_rounded;
      case 'Golden Wheel':
        return Icons.circle_rounded;
      case 'Diamond Rush':
        return Icons.diamond_rounded;
      case 'Royal Flush':
        return Icons.emoji_events_rounded;
      case 'Mega Draw':
        return Icons.star_rounded;
      case 'Lucky Star':
        return Icons.auto_awesome_rounded;
      default:
        return Icons.casino_rounded;
    }
  }

  static const _gameNames = ['Lucky 7', 'Golden Wheel', 'Diamond Rush', 'Royal Flush', 'Mega Draw', 'Lucky Star'];
  static const _gameDescriptions = [
    'Match the lucky number 7 to win big prizes! Place your bets on numbers 0-9.',
    'Spin the golden wheel and test your luck. Multiple prize tiers available.',
    'Collect diamonds across rounds. The more you collect, the higher your rewards.',
    'Coming soon! Get ready for the ultimate card game experience.',
    'Big prizes await in the Mega Draw. Multiple rounds with increasing jackpots.',
    'Coming soon! Follow the stars and win extraordinary rewards.',
  ];

  Map<String, dynamic> get _gameData => {
    'name': _gameNames[gameId.isEmpty ? 0 : int.tryParse(gameId) ?? 0],
    'description': _gameDescriptions[gameId.isEmpty ? 0 : int.tryParse(gameId) ?? 0],
    'icon': _gameIcon(_gameNames[gameId.isEmpty ? 0 : int.tryParse(gameId) ?? 0]),
  };

  static const _activeRounds = [
    {'round': 'Round 1', 'time': 'Today, 3:00 PM', 'entry': 50},
    {'round': 'Round 2', 'time': 'Today, 6:00 PM', 'entry': 100},
    {'round': 'Round 3', 'time': 'Today, 9:00 PM', 'entry': 200},
  ];

  @override
  Widget build(BuildContext context) {
    final game = _gameData;
    return Scaffold(
      appBar: AppBar(title: Text(game['name'] as String)),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 100,
                  height: 100,
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Color(0xFF8A5A00), Color(0xFFD89B18)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.all(Radius.circular(24)),
                  ),
                  child: Icon(game['icon'] as IconData, size: 48, color: Colors.white),
                ),
              ),
              const SizedBox(height: 24),
              Text(game['name'] as String, style: Theme.of(context).textTheme.headlineMedium),
              const SizedBox(height: 12),
              Text(game['description'] as String, style: Theme.of(context).textTheme.bodyMedium),
              const SizedBox(height: 32),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Active Rounds', style: AppTextStyles.sectionHeading),
                  TextButton(onPressed: () {}, child: const Text('View All')),
                ],
              ),
              const SizedBox(height: 12),
              ...List.generate(_activeRounds.length, (index) {
                final round = _activeRounds[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(16),
                    title: Text(round['round'] as String, style: AppTextStyles.cardTitle),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text(round['time'] as String, style: AppTextStyles.bodySmall),
                        const SizedBox(height: 4),
                        Text('Entry: ${round['entry']} pts', style: AppTextStyles.points.copyWith(fontSize: 14)),
                      ],
                    ),
                    trailing: ElevatedButton(
                      onPressed: () => context.push(
                        RouteNames.play,
                        extra: {
                          'gameId': gameId,
                          'gameName': game['name'] as String,
                          'roundId': 'round_${index + 1}',
                        },
                      ),
                      child: const Text('Join', style: TextStyle(fontSize: 13)),
                    ),
                  ),
                );
              }),
            ],
          ),
        ),
      ),
    );
  }
}
