import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import '../controllers/activity_controller.dart';

class MyActivityPage extends StatelessWidget {
  const MyActivityPage({super.key});

  static const _placeholderActivities = [
    {'game': 'Lucky 7', 'round': 'Round 12', 'bet': '7', 'result': '7', 'won': true, 'amount': 350},
    {'game': 'Golden Wheel', 'round': 'Round 8', 'bet': '3', 'result': '5', 'won': false, 'amount': 100},
    {'game': 'Diamond Rush', 'round': 'Round 5', 'bet': '9', 'result': '9', 'won': true, 'amount': 500},
    {'game': 'Lucky 7', 'round': 'Round 11', 'bet': '2', 'result': '7', 'won': false, 'amount': 50},
    {'game': 'Mega Draw', 'round': 'Round 3', 'bet': '5', 'result': '8', 'won': false, 'amount': 200},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Activity')),
      body: SafeArea(
        child: Consumer<ActivityController>(
          builder: (context, activityController, _) {
            final activities = _placeholderActivities;

            if (activities.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.history_rounded, size: 64, color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.3)),
                    const SizedBox(height: 16),
                    Text('No plays yet', style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 8),
                    Text('Start playing games to see your activity here.',
                        style: Theme.of(context).textTheme.bodySmall, textAlign: TextAlign.center),
                  ],
                ),
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: activities.length,
              itemBuilder: (context, index) {
                final activity = activities[index];
                final won = activity['won'] as bool;
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: won ? const Color(0xFF25C85A).withValues(alpha: 0.15) : const Color(0xFFE53935).withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            won ? Icons.check_circle_rounded : Icons.cancel_rounded,
                            color: won ? const Color(0xFF25C85A) : const Color(0xFFE53935),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(activity['game'] as String, style: AppTextStyles.cardTitle),
                              const SizedBox(height: 2),
                              Text('${activity['round']} - Bet: ${activity['bet']}', style: AppTextStyles.bodySmall),
                            ],
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              won ? '+${activity['amount']}' : '-${activity['amount']}',
                              style: AppTextStyles.points.copyWith(
                                color: won ? const Color(0xFF25C85A) : const Color(0xFFE53935),
                                fontSize: 15,
                              ),
                            ),
                            Text('Result: ${activity['result']}', style: AppTextStyles.caption),
                          ],
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
