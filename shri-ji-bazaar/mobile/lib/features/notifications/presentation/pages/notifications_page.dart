import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import '../controllers/notification_controller.dart';

class NotificationsPage extends StatelessWidget {
  const NotificationsPage({super.key});

  static const _placeholderNotifications = [
    {'title': 'Welcome to Shri Ji Bazaar!', 'body': 'Start playing and win big. Check out the latest games.', 'time': '2 hours ago', 'read': false},
    {'title': 'Round Result', 'body': 'Lucky 7 Round 12 result is out. Check if you won!', 'time': '5 hours ago', 'read': false},
    {'title': 'Deposit Successful', 'body': 'Your deposit of \$500 has been processed.', 'time': '1 day ago', 'read': true},
    {'title': 'Referral Bonus', 'body': 'You earned 100 points from a referral!', 'time': '2 days ago', 'read': true},
    {'title': 'Weekend Special', 'body': 'Double points on all games this weekend.', 'time': '3 days ago', 'read': true},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Notifications')),
      body: SafeArea(
        child: Consumer<NotificationController>(
          builder: (context, notificationController, _) {
            final notifications = _placeholderNotifications;

            if (notifications.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.notifications_off_rounded, size: 64, color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.3)),
                    const SizedBox(height: 16),
                    Text('No notifications', style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 8),
                    Text('You\'re all caught up!', style: Theme.of(context).textTheme.bodySmall),
                  ],
                ),
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: notifications.length,
              itemBuilder: (context, index) {
                final notification = notifications[index];
                final isRead = notification['read'] as bool;
                return Card(
                  margin: const EdgeInsets.only(bottom: 10),
                  color: isRead ? Theme.of(context).colorScheme.surface : Theme.of(context).colorScheme.primary.withValues(alpha: 0.08),
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(14),
                    leading: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: isRead ? Colors.grey.withValues(alpha: 0.1) : Theme.of(context).colorScheme.primary.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        isRead ? Icons.notifications_rounded : Icons.markunread_rounded,
                        color: isRead ? Colors.grey : Theme.of(context).colorScheme.primary,
                      ),
                    ),
                    title: Text(
                      notification['title'] as String,
                      style: isRead ? AppTextStyles.body : AppTextStyles.cardTitle.copyWith(color: Theme.of(context).colorScheme.primary),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text(notification['body'] as String, style: AppTextStyles.bodySmall),
                        const SizedBox(height: 4),
                        Text(notification['time'] as String, style: AppTextStyles.caption),
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
