import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import 'package:shri_ji_bazaar/core/routes/route_names.dart';
import '../controllers/points_controller.dart';

class PointsPage extends StatelessWidget {
  const PointsPage({super.key});

  static const _placeholderHistory = [
    {'type': 'Won - Lucky 7', 'round': 'Round 12', 'amount': 350, 'time': 'Today, 9:05 PM'},
    {'type': 'Entry - Lucky 7', 'round': 'Round 12', 'amount': -50, 'time': 'Today, 9:00 PM'},
    {'type': 'Won - Diamond Rush', 'round': 'Round 5', 'amount': 500, 'time': 'Today, 3:05 PM'},
    {'type': 'Entry - Diamond Rush', 'round': 'Round 5', 'amount': -100, 'time': 'Today, 3:00 PM'},
    {'type': 'Welcome Bonus', 'round': '-', 'amount': 200, 'time': 'Yesterday'},
    {'type': 'Lost - Golden Wheel', 'round': 'Round 8', 'amount': -100, 'time': 'Yesterday'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Points')),
      body: SafeArea(
        child: Consumer<PointsController>(
          builder: (context, pointsController, _) {
            final balance = 1250;

            return SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(24),
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Color(0xFF8A5A00), Color(0xFFD89B18), Color(0xFF8A5A00)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.all(Radius.circular(20)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Total Points', style: AppTextStyles.body.copyWith(color: Colors.white70)),
                        const SizedBox(height: 8),
                        Text('$balance', style: AppTextStyles.display.copyWith(color: Colors.white)),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton(
                                onPressed: () => context.push(RouteNames.wallet),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.white,
                                foregroundColor: Theme.of(context).colorScheme.primary,
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                shadowColor: Colors.transparent,
                                  surfaceTintColor: Colors.transparent,
                                ),
                                child: const Text('Add Points'),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: OutlinedButton(
                                onPressed: () => context.push(RouteNames.bonuses),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: Colors.white,
                                  side: const BorderSide(color: Colors.white),
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                ),
                                child: const Text('Bonuses'),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 28),
                  Text('Points History', style: AppTextStyles.sectionHeading),
                  const SizedBox(height: 12),
                  ...List.generate(_placeholderHistory.length, (index) {
                    final entry = _placeholderHistory[index];
                    final amount = entry['amount'] as int;
                    final isPositive = amount >= 0;
                    return Card(
                      margin: const EdgeInsets.only(bottom: 10),
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(14),
                        title: Text(entry['type'] as String, style: AppTextStyles.cardTitle),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (entry['round'] != '-' && entry['round'] != null)
                              Text(entry['round'] as String, style: AppTextStyles.bodySmall),
                            Text(entry['time'] as String, style: AppTextStyles.caption),
                          ],
                        ),
                        trailing: Text(
                          '${isPositive ? '+' : ''}$amount',
                          style: AppTextStyles.points.copyWith(
                            color: isPositive ? const Color(0xFF25C85A) : const Color(0xFFE53935),
                            fontSize: 16,
                          ),
                        ),
                      ),
                    );
                  }),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
