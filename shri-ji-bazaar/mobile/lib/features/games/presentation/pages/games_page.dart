import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import 'package:shri_ji_bazaar/core/routes/route_names.dart';

class GamesPage extends StatelessWidget {
  const GamesPage({super.key});

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
  static const _gameStatuses = ['Active', 'Active', 'Active', 'Coming Soon', 'Active', 'Coming Soon'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Games')),
      body: SafeArea(
        child: ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: _gameNames.length,
          itemBuilder: (context, index) {
            return _GameCard(
              name: _gameNames[index],
              status: _gameStatuses[index],
              icon: _gameIcon(_gameNames[index]),
              onTap: () => context.push('${RouteNames.gameDetails}/$index'),
            );
          },
        ),
      ),
    );
  }
}

class _GameCard extends StatelessWidget {
  final String name;
  final String status;
  final IconData icon;
  final VoidCallback onTap;

  const _GameCard({required this.name, required this.status, required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isActive = status == 'Active';
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Container(
          width: 48,
          height: 48,
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFF8A5A00), Color(0xFFD89B18)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.all(Radius.circular(12)),
          ),
          child: Icon(icon, color: Colors.white, size: 24),
        ),
        title: Text(name, style: AppTextStyles.cardTitle),
        subtitle: Row(
          children: [
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: isActive ? const Color(0xFF25C85A) : const Color(0xFFFFA726),
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 8),
            Text(
              status,
              style: AppTextStyles.bodySmall.copyWith(
                color: isActive ? const Color(0xFF25C85A) : const Color(0xFFFFA726),
              ),
            ),
          ],
        ),
        trailing: isActive
            ? ElevatedButton(
                onPressed: onTap,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                ),
                child: const Text('Play', style: TextStyle(fontSize: 13)),
              )
            : TextButton(onPressed: null, child: Text('Soon', style: AppTextStyles.caption)),
      ),
    );
  }
}
