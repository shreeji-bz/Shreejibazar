import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/constants/app_strings.dart';
import '../../../shared/components/game_card.dart';
import '../../games/presentation/pages/games_page.dart';
import '../../points/presentation/pages/points_page.dart';
import '../../referrals/presentation/pages/referrals_page.dart';
import '../../bonuses/presentation/pages/bonuses_page.dart';
import '../../notifications/presentation/pages/notifications_page.dart';
import '../../support/presentation/pages/support_page.dart';
import '../../profile/presentation/pages/profile_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final List<Map<String, String>> _popularGames = [
    {'name': 'Ghaziabad', 'status': 'Open', 'time': '04:00 PM'},
    {'name': 'Gali', 'status': 'Open', 'time': '04:15 PM'},
    {'name': 'Disawar', 'status': 'Open', 'time': '03:00 PM'},
    {'name': 'Faridabad', 'status': 'Closed', 'time': '04:30 PM'},
    {'name': 'Delhi Bazaar', 'status': 'Open', 'time': '04:00 PM'},
    {'name': 'Mumbai Bazaar', 'status': 'Upcoming', 'time': '05:00 PM'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top bar
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Row(
                  children: [
                    IconButton(onPressed: () {}, icon: const Icon(Icons.menu, color: AppColors.textSecondary)),
                    Expanded(child: Center(child: Text(AppStrings.appName, style: AppTextStyles.sectionHeading))),
                    IconButton(onPressed: () => context.push(RouteNames.notifications), icon: const Icon(Icons.notifications_outlined, color: AppColors.goldBright)),
                  ],
                ),
              ),

              // Points card
              Container(
                margin: const EdgeInsets.symmetric(vertical: 12),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: AppColors.cardGradient,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.border, width: 0.5),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(AppStrings.totalPoints, style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary)),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.stars_rounded, color: AppColors.goldBright, size: 24),
                            const SizedBox(width: 6),
                            Text('5,250', style: AppTextStyles.points),
                          ],
                        ),
                      ],
                    ),
                    ElevatedButton(
                      onPressed: () => context.push(RouteNames.points),
                      style: ElevatedButton(
                        backgroundColor: AppColors.gold,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ).copyWith(padding: WidgetStateProperty.all(const EdgeInsets.symmetric(horizontal: 20, vertical: 10))),
                      child: Text('+', style: AppTextStyles.caption.copyWith(fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                    ),
                  ],
                ),
              ),

              // Hero banner
              Container(
                height: 140,
                margin: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  gradient: AppColors.goldGradient,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [BoxShadow(color: AppColors.gold.withOpacity(0.2), blurRadius: 15, spreadRadius: 2)],
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('PLAY & EARN', style: AppTextStyles.heading.copyWith(color: AppColors.textPrimary, fontSize: 20)),
                      Text('POINTS', style: AppTextStyles.display.copyWith(color: AppColors.textPrimary, fontSize: 28)),
                    ],
                  ),
                ),
              ),

              // Quick actions
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _QuickAction(icon: Icons.casino_outlined, label: 'Games', onTap: () => context.push(RouteNames.games)),
                    _QuickAction(icon: Icons.storefront_outlined, label: 'Market', onTap: () {}),
                    _QuickAction(icon: Icons.card_giftcard_outlined, label: 'Bonus', onTap: () => context.push(RouteNames.bonuses)),
                    _QuickAction(icon: Icons.people_outline, label: 'Refer', onTap: () => context.push(RouteNames.referrals)),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _QuickAction(icon: Icons.headset_mic_outlined, label: 'Support', onTap: () => context.push(RouteNames.support)),
                  ],
                ),
              ),

              // Popular games
              Text(AppStrings.popularGames, style: AppTextStyles.sectionHeading),
              const SizedBox(height: 12),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, childAspectRatio: 1.4, crossAxisSpacing: 12, mainAxisSpacing: 12),
                itemCount: _popularGames.length,
                itemBuilder: (context, index) => GameCard(
                  name: _popularGames[index]['name']!,
                  time: _popularGames[index]['time'],
                  status: _popularGames[index]['status']!,
                  onTap: () {},
                ),
              ),

              const SizedBox(height: 80),
            ],
          ),
        ),
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _QuickAction({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Column(
        children: [
          Container(
            width: 52, height: 52,
            decoration: BoxDecoration(color: AppColors.cardSecondary, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border)),
            child: Icon(icon, color: AppColors.goldBright, size: 22),
          ),
          const SizedBox(height: 6),
          Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
        ],
      ),
    );
  }
}
