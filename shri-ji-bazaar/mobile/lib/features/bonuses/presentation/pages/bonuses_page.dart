import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import 'package:shri_ji_bazaar/core/widgets/sidebar_toggle.dart';
import '../controllers/bonus_controller.dart';

class BonusesPage extends StatefulWidget {
  const BonusesPage({super.key});

  @override
  State<BonusesPage> createState() => _BonusesPageState();
}

class _BonusesPageState extends State<BonusesPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<BonusController>().loadBonuses();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: const SidebarToggle(),
        title: const Text('Bonuses'),
      ),
      body: SafeArea(
        child: Consumer<BonusController>(
          builder: (context, bonusController, _) {
            final bonuses = bonusController.bonuses;

            if (bonusController.isLoading && bonuses.isEmpty) {
              return const Center(child: CircularProgressIndicator());
            }

            if (bonuses.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.card_giftcard_rounded, size: 64, color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.3)),
                    const SizedBox(height: 16),
                    Text('No bonuses available', style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 8),
                    Text('Check back later for new bonuses!', style: Theme.of(context).textTheme.bodySmall),
                  ],
                ),
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: bonuses.length,
              itemBuilder: (context, index) {
                final bonus = bonuses[index];
                final claimed = bonus.claimed;
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
                              Text(bonus.name, style: AppTextStyles.cardTitle),
                              const SizedBox(height: 4),
                              Text(bonus.description, style: AppTextStyles.bodySmall, maxLines: 2, overflow: TextOverflow.ellipsis),
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
                                onPressed: () async {
                                  final success = await context.read<BonusController>().claimBonus(bonus.id);
                                  if (!mounted) return;
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(success ? '${bonus.name} claimed!' : 'Failed to claim bonus'),
                                      backgroundColor: success ? const Color(0xFF25C85A) : const Color(0xFFE53935),
                                    ),
                                  );
                                },
                                child: Text('+${bonus.points}', style: const TextStyle(fontSize: 12)),
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
