import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import 'package:shri_ji_bazaar/core/widgets/sidebar_toggle.dart';
import '../controllers/notification_controller.dart';

class NotificationsPage extends StatefulWidget {
  const NotificationsPage({super.key});

  @override
  State<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends State<NotificationsPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<NotificationController>().loadNotifications();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: const SidebarToggle(),
        title: const Text('Notifications'),
      ),
      body: SafeArea(
        child: Consumer<NotificationController>(
          builder: (context, notificationController, _) {
            final notifications = notificationController.notifications;

            if (notificationController.isLoading && notifications.isEmpty) {
              return const Center(child: CircularProgressIndicator());
            }

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
                final isRead = notification.isRead;
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
                      notification.title,
                      style: isRead ? AppTextStyles.body : AppTextStyles.cardTitle.copyWith(color: Theme.of(context).colorScheme.primary),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text(notification.message, style: AppTextStyles.bodySmall),
                        const SizedBox(height: 4),
                        Text(_formatDate(notification.createdAt), style: AppTextStyles.caption),
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

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes} min ago';
    if (diff.inHours < 24) return '${diff.inHours} hours ago';
    if (diff.inDays < 7) return '${diff.inDays} days ago';
    return '${date.day}/${date.month}/${date.year}';
  }
}
