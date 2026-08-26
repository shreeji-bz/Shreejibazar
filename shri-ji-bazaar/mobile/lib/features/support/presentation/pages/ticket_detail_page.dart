import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

class TicketDetailPage extends StatelessWidget {
  final String ticketId;
  const TicketDetailPage({super.key, required this.ticketId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(backgroundColor: AppColors.background, appBar: AppBar(backgroundColor: AppColors.background, elevation: 0, title: const Text('Ticket', style: TextStyle(color: AppColors.goldBright))), body: const Center(child: Text('Ticket detail coming soon', style: TextStyle(color: AppColors.textMuted))));
  }
}
