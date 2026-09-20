import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import '../controllers/bonus_controller.dart';

class BonusesPage extends StatelessWidget {
  const BonusesPage({super.key});

  static const _placeholderBonuses = [
    {'title': 'Welcome Bonus', 'desc': 'Get 200 bonus points on your first deposit!', 'points': 200, 'claimed': false},
    {'title': 'Daily Login', 'desc': 'Claim 50 points for logging in today.', 'points': 50, 'claimed': false},
    {'title': 'Referral Bonus', 'desc': 'Earn 100 points for each friend who joins.', 'points': 100, 'claimed': false},
    {'title': 'Weekend Special', 'desc': 'Double points on all games this weekend!', 'points': 300, 'claimed': true},
    {'title': 'First Win Bonus', 'desc': 'Extra 150 points for your first game win.', 'points': 150, 'claimed': false},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Bonuses')),
      body: SafeArea(
        child: Consumer<BonusController>(
          builder: (context, bonusController, _) {
            final bonuses = _placeholderBonuses;

            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: bonuses.length,
              itemBuilder: (context, index) {
                final bonus = bonuses[index];
                final claimed = bonus['claimed'] as bool;
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Container(
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
                          child: const Icon(Icons.card_giftcard_rounded, color: Colors.white, size: 24),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(bonus['title'] as String, style: AppTextStyles.cardTitle),
                              const SizedBox(height: 4),
                              Text(bonus['desc'] as String, style: AppTextStyles.bodySmall, maxLines: 2, overflow: TextOverflow.ellipsis),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        claimed
                            ? Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF25C85A).withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text('Claimed', style: AppTextStyles.caption.copyWith(color: const Color(0xFF25C85A))),
                              )
                            : ElevatedButton(
                                onPressed: () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text('${bonus['title']} claimed!'), backgroundColor: const Color(0xFF25C85A)),
                                  );
                                },
                                child: Text('+${bonus['points']}', style: const TextStyle(fontSize: 12)),
                              ),
                      ],
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}
