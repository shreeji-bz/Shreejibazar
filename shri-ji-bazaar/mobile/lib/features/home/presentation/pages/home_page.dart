import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import 'package:shri_ji_bazaar/core/routes/route_names.dart';
import '../controllers/home_controller.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Consumer<HomeController>(
          builder: (context, homeController, _) {
            final greeting = _getGreeting();
            final pointsBalance = homeController.points?.balance ?? 0;
            return SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 8),
                  Text(
                    '$greeting,',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          color: Theme.of(context).colorScheme.primary,
                        ),
                  ),
                  Text(
                    'Player',
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  const SizedBox(height: 24),
                  Text('Quick Actions', style: AppTextStyles.sectionHeading),
                  const SizedBox(height: 16),
                  GridView.count(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: 2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 1.3,
                    children: [
                      _QuickActionCard(
                        icon: Icons.sports_esports_rounded,
                        title: 'Games',
                        onTap: () => context.push(RouteNames.games),
                      ),
                      _QuickActionCard(
                        icon: Icons.emoji_events_rounded,
                        title: 'Results',
                        onTap: () => context.push(RouteNames.results),
                      ),
                      _QuickActionCard(
                        icon: Icons.account_balance_wallet_rounded,
                        title: 'Wallet',
                        onTap: () => context.push(RouteNames.wallet),
                      ),
                      _QuickActionCard(
                        icon: Icons.card_giftcard_rounded,
                        title: 'Bonuses',
                        onTap: () => context.push(RouteNames.bonuses),
                      ),
                      _QuickActionCard(
                        icon: Icons.person_rounded,
                        title: 'Profile',
                        onTap: () => context.push(RouteNames.profile),
                      ),
                      _QuickActionCard(
                        icon: Icons.history_rounded,
                        title: 'My Plays',
                        onTap: () => context.push(RouteNames.myPlays),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Color(0xFF8A5A00), Color(0xFFD89B18), Color(0xFF8A5A00)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.all(Radius.circular(16)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.stars_rounded, size: 36, color: Colors.white),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Your Points', style: AppTextStyles.body.copyWith(color: Colors.white70)),
                              const SizedBox(height: 4),
                              Text('$pointsBalance', style: AppTextStyles.points.copyWith(color: Colors.white)),
                            ],
                          ),
                        ),
                        TextButton(
                          onPressed: () => context.push(RouteNames.points),
                          child: const Text('View', style: TextStyle(color: Colors.white)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }
}

class _QuickActionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;

  const _QuickActionCard({required this.icon, required this.title, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.2)),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 36, color: Theme.of(context).colorScheme.primary),
            const SizedBox(height: 8),
            Text(title, style: Theme.of(context).textTheme.bodySmall),
          ],
        ),
      ),
    );
  }
}
