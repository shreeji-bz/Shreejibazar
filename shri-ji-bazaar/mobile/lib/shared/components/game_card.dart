import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';

class GameCard extends StatelessWidget {
  final String name;
  final String? time;
  final String status;
  final VoidCallback? onTap;
  final bool isPlayable;

  const GameCard({
    super.key,
    required this.name,
    this.time,
    required this.status,
    this.onTap,
    this.isPlayable = true,
  });

  Color get _statusColor {
    switch (status.toLowerCase()) {
      case 'open':
      case 'active':
        return AppColors.success;
      case 'closed':
      case 'inactive':
        return AppColors.error;
      case 'upcoming':
        return AppColors.warning;
      case 'maintenance':
        return AppColors.gold;
      default:
        return AppColors.textMuted;
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: AppColors.cardGradient,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border, width: 0.5),
          boxShadow: [
            BoxShadow(color: AppColors.goldDark.withValues(alpha: 0.1), blurRadius: 8, offset: const Offset(0, 2)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(name, style: AppTextStyles.cardTitle),
            const SizedBox(height: 8),
            if (time != null) Text(time!, style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary)),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: _statusColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: _statusColor.withValues(alpha: 0.3)),
                  ),
                  child: Text(status.toUpperCase(), style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: _statusColor)),
                ),
                if (isPlayable)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                    decoration: BoxDecoration(
                      gradient: AppColors.goldGradient,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text('PLAY', style: AppTextStyles.caption.copyWith(fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
