import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shri_ji_bazaar/core/routes/route_names.dart';
import 'package:shri_ji_bazaar/core/theme/app_colors.dart';

class BottomNav extends StatelessWidget {
  final int currentIndex;

  const BottomNav({super.key, required this.currentIndex});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        border: const Border(top: BorderSide(color: AppColors.border)),
      ),
      child: BottomNavigationBar(
        backgroundColor: AppColors.card,
        type: BottomNavigationBarType.fixed,
        currentIndex: currentIndex,
        onTap: (index) {
          switch (index) {
            case 0:
              context.go(RouteNames.myPlays);
              break;
            case 1:
              context.go(RouteNames.wallet);
              break;
            case 2:
              context.go(RouteNames.games);
              break;
            case 3:
              context.go(RouteNames.results);
              break;
            case 4:
              context.go(RouteNames.referrals);
              break;
          }
        },
        items: [
          BottomNavigationBarItem(
            icon: Icon(Icons.history_rounded, color: AppColors.textSecondary),
            activeIcon: Icon(Icons.history, color: AppColors.success),
            label: 'Bids',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.account_balance_wallet_outlined, color: AppColors.textSecondary),
            activeIcon: Icon(Icons.account_balance_wallet, color: AppColors.success),
            label: 'Wallet',
          ),
          BottomNavigationBarItem(
            icon: _PlayIcon(isActive: false),
            activeIcon: _PlayIcon(isActive: true),
            label: 'Play',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.show_chart_rounded, color: AppColors.textSecondary),
            activeIcon: Icon(Icons.show_chart, color: AppColors.success),
            label: 'Chart',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.share_rounded, color: AppColors.textSecondary),
            activeIcon: Icon(Icons.share, color: AppColors.success),
            label: 'Refer & Earn',
          ),
        ],
      ),
    );
  }
}

class _PlayIcon extends StatelessWidget {
  final bool isActive;

  const _PlayIcon({required this.isActive});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 52,
      height: 52,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: AppColors.success,
        boxShadow: isActive
            ? [
                BoxShadow(
                  color: AppColors.success.withValues(alpha: 0.5),
                  blurRadius: 14,
                  spreadRadius: 3,
                ),
              ]
            : [
                BoxShadow(
                  color: AppColors.success.withValues(alpha: 0.3),
                  blurRadius: 12,
                  spreadRadius: 2,
                ),
              ],
      ),
      child: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 36),
    );
  }
}
