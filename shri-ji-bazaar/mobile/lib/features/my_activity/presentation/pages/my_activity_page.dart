import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import 'package:shri_ji_bazaar/core/widgets/sidebar_toggle.dart';
import '../controllers/activity_controller.dart';

class MyActivityPage extends StatefulWidget {
  const MyActivityPage({super.key});

  @override
  State<MyActivityPage> createState() => _MyActivityPageState();
}

class _MyActivityPageState extends State<MyActivityPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ActivityController>().loadActivities();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: const SidebarToggle(),
        title: const Text('My Activity'),
      ),
      body: SafeArea(
        child: Consumer<ActivityController>(
          builder: (context, activityController, _) {
            final activities = activityController.activities;

            if (activityController.isLoading && activities.isEmpty) {
              return const Center(child: CircularProgressIndicator());
            }

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
                final isPositive = activity.pointsChange >= 0;
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
                            color: isPositive
                                ? const Color(0xFF25C85A).withValues(alpha: 0.15)
                                : const Color(0xFFE53935).withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            isPositive ? Icons.trending_up_rounded : Icons.trending_down_rounded,
                            color: isPositive ? const Color(0xFF25C85A) : const Color(0xFFE53935),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                activity.gameName ?? activity.description,
                                style: AppTextStyles.cardTitle,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 2),
                              Text(
                                activity.roundNumber != null
                                    ? 'Round ${activity.roundNumber}'
                                    : activity.activityType.toUpperCase(),
                                style: AppTextStyles.bodySmall,
                              ),
                            ],
                          ),
                        ),
                        Text(
                          '${isPositive ? '+' : ''}${activity.pointsChange}',
                          style: AppTextStyles.points.copyWith(
                            color: isPositive ? const Color(0xFF25C85A) : const Color(0xFFE53935),
                            fontSize: 15,
                          ),
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
