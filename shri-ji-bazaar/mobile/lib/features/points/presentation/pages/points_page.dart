import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import 'package:shri_ji_bazaar/core/widgets/sidebar_toggle.dart';
import 'package:shri_ji_bazaar/core/routes/route_names.dart';
import '../controllers/points_controller.dart';

class PointsPage extends StatefulWidget {
  const PointsPage({super.key});

  @override
  State<PointsPage> createState() => _PointsPageState();
}

class _PointsPageState extends State<PointsPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PointsController>().loadPoints();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: const SidebarToggle(),
        title: const Text('Points'),
      ),
      body: SafeArea(
        child: Consumer<PointsController>(
          builder: (context, pointsController, _) {
            final balance = pointsController.balance;
            final transactions = pointsController.transactions;

            if (pointsController.isLoading && transactions.isEmpty) {
              return const Center(child: CircularProgressIndicator());
            }

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
                  if (transactions.isEmpty)
                    Center(
                      child: Text('No transactions yet', style: AppTextStyles.body.copyWith(color: Colors.grey)),
                    )
                  else
                    ...transactions.map((tx) {
                      final isPositive = tx.amount >= 0;
                      return Card(
                        margin: const EdgeInsets.only(bottom: 10),
                        child: ListTile(
                          contentPadding: const EdgeInsets.all(14),
                          title: Text(tx.description, style: AppTextStyles.cardTitle),
                          subtitle: Text(
                            '${tx.type.toUpperCase()} - ${tx.createdAt.day}/${tx.createdAt.month}/${tx.createdAt.year}',
                            style: AppTextStyles.bodySmall,
                          ),
                          trailing: Text(
                            '${isPositive ? '+' : ''}${tx.amount}',
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
