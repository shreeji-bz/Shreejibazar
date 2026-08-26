import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/constants/app_constants.dart';

class AboutPage extends StatelessWidget {
  const AboutPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(backgroundColor: AppColors.background, elevation: 0, title: const Text('About', style: TextStyle(color: AppColors.goldBright))),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            Container(width: 80, height: 80, decoration: BoxDecoration(shape: BoxShape.circle, gradient: AppColors.goldGradient), child: const Icon(Icons.auto_awesome, size: 40, color: AppColors.textPrimary)),
            const SizedBox(height: 20),
            Text(AppConstants.appName, style: AppTextStyles.display.copyWith(fontSize: 24)),
            const SizedBox(height: 8),
            Text('Version ${AppConstants.appVersion}', style: AppTextStyles.caption.copyWith(fontSize: 16)),
            const SizedBox(height: 12),
            Text('Your trusted platform for games and rewards.', textAlign: TextAlign.center, style: AppTextStyles.body.copyWith(color: AppColors.textSecondary)),
          ]),
        ),
      ),
    );
  }
}
