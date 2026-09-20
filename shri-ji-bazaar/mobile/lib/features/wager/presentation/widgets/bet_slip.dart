import 'package:flutter/material.dart';
import 'package:shri_ji_bazaar/core/theme/app_colors.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import 'package:shri_ji_bazaar/shared/widgets/custom_button.dart';

class BetSlipWidget extends StatelessWidget {
  final String playType;
  final String selection;
  final String stake;
  final int potentialPayout;
  final String gameName;
  final String roundId;
  final VoidCallback onConfirm;
  final bool isSubmitting;

  const BetSlipWidget({
    super.key,
    required this.playType,
    required this.selection,
    required this.stake,
    required this.potentialPayout,
    required this.gameName,
    required this.roundId,
    required this.onConfirm,
    this.isSubmitting = false,
  });

  Color _getPlayTypeColor(String type) {
    switch (type.toLowerCase()) {
      case 'single':
        return AppColors.info;
      case 'jodi':
        return AppColors.success;
      case 'panel':
        return AppColors.warning;
      case 'double':
        return AppColors.resultViolet;
      default:
        return AppColors.gold;
    }
  }

  @override
  Widget build(BuildContext context) {
    final playTypeColor = _getPlayTypeColor(playType);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildDetailRow(
          label: 'Play Type',
          value: playType,
          badge: true,
          badgeColor: playTypeColor,
        ),
        const SizedBox(height: 12),
        _buildDetailRow(
          label: 'Selection',
          value: selection,
        ),
        const SizedBox(height: 12),
        _buildDetailRow(
          label: 'Stake',
          value: '$stake pts',
          valueColor: AppColors.goldBright,
        ),
        const SizedBox(height: 12),
        _buildDetailRow(
          label: 'Potential Payout',
          value: '$potentialPayout pts',
          valueColor: AppColors.success,
        ),
        if (gameName.isNotEmpty) ...[
          const SizedBox(height: 12),
          _buildDetailRow(
            label: 'Game',
            value: gameName,
          ),
        ],
        if (roundId.isNotEmpty) ...[
          const SizedBox(height: 12),
          _buildDetailRow(
            label: 'Round',
            value: roundId,
          ),
        ],
        const SizedBox(height: 20),
        Divider(color: AppColors.border, height: 1),
        const SizedBox(height: 20),
        SizedBox(
          width: double.infinity,
          child: CustomButton(
            label: 'CONFIRM BET',
            isLoading: isSubmitting,
            onPressed: isSubmitting ? null : onConfirm,
          ),
        ),
      ],
    );
  }

  Widget _buildDetailRow({
    required String label,
    required String value,
    bool badge = false,
    Color? badgeColor,
    Color? valueColor,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: AppTextStyles.body.copyWith(
            color: AppColors.textMuted,
          ),
        ),
        if (badge && value.isNotEmpty)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: (badgeColor ?? AppColors.gold).withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(
                color: (badgeColor ?? AppColors.gold).withValues(alpha: 0.4),
                width: 1,
              ),
            ),
            child: Text(
              value,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: badgeColor ?? AppColors.goldBright,
                letterSpacing: 0.5,
              ),
            ),
          )
        else
          Text(
            value,
            style: AppTextStyles.body.copyWith(
              color: valueColor ?? AppColors.textPrimary,
              fontWeight: FontWeight.w600,
            ),
          ),
      ],
    );
  }
}
