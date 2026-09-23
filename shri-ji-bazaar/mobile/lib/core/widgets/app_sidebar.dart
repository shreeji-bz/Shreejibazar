import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:go_router/go_router.dart';
import 'package:shri_ji_bazaar/core/theme/app_colors.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import 'package:shri_ji_bazaar/core/routes/route_names.dart';
import '../../features/authentication/presentation/controllers/auth_controller.dart';

class AppSidebar extends StatelessWidget {
  const AppSidebar({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthController>(context, listen: false);
    final user = auth.user;

    return Drawer(
      backgroundColor: AppColors.cardSecondary,
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.fromLTRB(16, 48, 16, 20),
            decoration: const BoxDecoration(
              color: Color(0xFF0A8A4F),
            ),
            child: Row(
              children: [
                Container(
                  width: 54,
                  height: 54,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF4C430),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Center(
                    child: Text('जय', style: TextStyle(color: Color(0xFF0A8A4F), fontWeight: FontWeight.w900, fontSize: 20)),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user?.name ?? 'USER',
                        style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: Colors.white),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        user?.mobile ?? '',
                        style: const TextStyle(fontSize: 13, color: Colors.white70),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close_rounded, color: Colors.white, size: 26),
                ),
              ],
            ),
          ),

          // Menu items
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
              children: [
                _SidebarTile(
                  label: 'Change Password',
                  icon: Icons.lock_outline_rounded,
                  onTap: () {
                    Navigator.pop(context);
                    context.push(RouteNames.settings);
                  },
                ),
                _SidebarTile(
                  label: 'Add Money',
                  icon: Icons.account_balance_wallet_outlined,
                  onTap: () {
                    Navigator.pop(context);
                    context.push(RouteNames.deposit);
                  },
                ),
                _SidebarTile(
                  label: 'Withdraw Money',
                  icon: Icons.swap_vert_rounded,
                  onTap: () {
                    Navigator.pop(context);
                    context.push(RouteNames.withdraw);
                  },
                ),
                _SidebarTile(
                  label: 'Transaction',
                  icon: Icons.receipt_long_outlined,
                  onTap: () {
                    Navigator.pop(context);
                    context.push(RouteNames.paymentHistory);
                  },
                ),
                _SidebarTile(
                  label: 'Share Now',
                  icon: Icons.share_rounded,
                  onTap: () async {
                    Navigator.pop(context);
                    await _shareApp(context);
                  },
                ),
                _SidebarTile(
                  label: 'Contact Us',
                  icon: Icons.headset_mic_outlined,
                  onTap: () {
                    Navigator.pop(context);
                    context.push(RouteNames.support);
                  },
                ),
              ],
            ),
          ),

          // Referral Code section
          Container(
            margin: const EdgeInsets.fromLTRB(12, 0, 12, 12),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.cardSecondary,
              border: Border.all(color: const Color(0xFF0A8A4F), width: 2, style: BorderStyle.solid),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('Referral Code ', style: TextStyle(fontSize: 14, color: AppColors.textSecondary)),
                    IconButton(
                      onPressed: () {
                        final code = user?.referralCode ?? '';
                        if (code.isNotEmpty) {
                          Clipboard.setData(ClipboardData(text: code));
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Referral code copied'), backgroundColor: AppColors.success),
                          );
                        }
                      },
                      icon: const Icon(Icons.copy_rounded, size: 18, color: AppColors.textSecondary),
                      tooltip: 'Copy',
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  'Referral Code: ${user?.referralCode ?? '------'}',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),

          // Logout
          InkWell(
            onTap: () async {
              Navigator.pop(context);
              await auth.logout();
              if (context.mounted) {
                GoRouter.of(context).go(RouteNames.login);
              }
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              child: Row(
                children: [
                  const Icon(Icons.logout_rounded, color: Colors.redAccent, size: 22),
                  const SizedBox(width: 12),
                  Text('Logout', style: AppTextStyles.body.copyWith(color: Colors.redAccent, fontWeight: FontWeight.w700)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _shareApp(BuildContext context) async {
    final auth = Provider.of<AuthController>(context, listen: false);
    final code = auth.user?.referralCode ?? '';
    final baseUrl = const String.fromEnvironment('API_BASE_URL', defaultValue: 'http://10.97.119.19:3000');
    final link = '$baseUrl/register?ref=$code';

    await SharePlus.instance.share(
      ShareParams(
        text: 'Join Shri Ji Bazaar using my referral code $code and earn bonus points!\n\nRegister here: $link',
        subject: 'Join Shri Ji Bazaar',
      ),
    );
  }
}

class _SidebarTile extends StatelessWidget {
  final String label;
  final IconData icon;
  final VoidCallback onTap;

  const _SidebarTile({required this.label, required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 2),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        child: Row(
          children: [
            Icon(icon, size: 22, color: AppColors.textPrimary),
            const SizedBox(width: 14),
            Expanded(
              child: Text(label, style: AppTextStyles.body.copyWith(color: AppColors.textPrimary, fontWeight: FontWeight.w600)),
            ),
            Icon(Icons.chevron_right_rounded, color: AppColors.textSecondary, size: 20),
          ],
        ),
      ),
    );
  }
}
