import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/constants/app_strings.dart';
import '../../../shared/widgets/bottom_nav.dart';
import '../../../shared/widgets/custom_button.dart';

class BonusesPage extends StatefulWidget {
  const BonusesPage({super.key});

  @override
  State<BonusesPage> createState() => _BonusesPageState();
}

class _BonusesPageState extends State<BonusesPage> {
  final List<Map<String, dynamic>> _bonuses = [
    {'title': 'Daily Check-in', 'points': 50, 'claimed': false, 'type': 'Daily'},
    {'title': 'Weekly Streak', 'points': 200, 'claimed': true, 'type': 'Weekly'},
    {'title': 'First Play Bonus', 'points': 100, 'claimed': false, 'type': 'Achievement'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(backgroundColor: AppColors.background, elevation: 0, title: Text('Bonuses', style: AppTextStyles.sectionHeading)),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _bonuses.length,
              itemBuilder: (context, index) {
                final bonus = _bonuses[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(gradient: AppColors.cardGradient, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border)),
                  child: Row(children: [
                    Container(width: 44, height: 44, decoration: BoxDecoration(color: AppColors.gold.withOpacity(0.15), borderRadius: BorderRadius.circular(12)), child: Icon(Icons.card_giftcard, color: AppColors.goldBright, size: 22)),
                    const SizedBox(width: 14),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(bonus['title'], style: AppTextStyles.cardTitle),
                      Text(bonus['type'], style: AppTextStyles.caption),
                    ])),
                    Column(children: [
                      Text('+${bonus['points']} pts', style: const TextStyle(color: AppColors.goldBright, fontWeight: FontWeight.w600, fontSize: 14)),
                      const SizedBox(height: 6),
                      if (bonus['claimed'])
                        Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3), decoration: BoxDecoration(color: AppColors.textMuted.withOpacity(0.2), borderRadius: BorderRadius.circular(6), border: Border.all(color: AppColors.textMuted.withOpacity(0.3))), child: const Text('Claimed', style: TextStyle(fontSize: 10, color: AppColors.textMuted)))
                      else
                        CustomButton(text: 'CLAIM', onPressed: () {}, width: 70, height: 32),
                    ]),
                  ]),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
