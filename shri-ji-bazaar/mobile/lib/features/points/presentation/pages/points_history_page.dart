import 'package:flutter/material.dart';
import '../../../../../core/theme/app_colors.dart';

class PointsHistoryPage extends StatelessWidget {
  const PointsHistoryPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(backgroundColor: AppColors.background, elevation: 0, title: const Text('Points History', style: TextStyle(color: AppColors.goldBright))),
      body: const Center(child: Text('Points history coming soon', style: TextStyle(color: AppColors.textMuted))),
    );
  }
}
