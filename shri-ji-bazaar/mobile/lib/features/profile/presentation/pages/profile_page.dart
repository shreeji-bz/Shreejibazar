import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/constants/app_strings.dart';
import '../../../core/routes/route_names.dart';
import '../../../shared/widgets/custom_button.dart';
import '../controllers/profile_controller.dart';
import '../widgets/profile_header.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => ProfileController(
        GetProfileUseCase(ProfileRepository(ProfileDatasource())),
        UpdateProfileUseCase(ProfileRepository(ProfileDatasource())),
        Provider.of<AuthController>(context, listen: false),
      )..loadProfile(),
      child: const _ProfilePageContent(),
    );
  }
}

class _ProfilePageContent extends StatelessWidget {
  const _ProfilePageContent();

  @override
  Widget build(BuildContext context) {
    final profileController = Provider.of<ProfileController>(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () => profileController.loadProfile(),
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              children: [
                const SizedBox(height: 12),
                const ProfileHeader(),
                const SizedBox(height: 16),
                _buildStats(context, profileController),
                const SizedBox(height: 16),
                _buildMenuItems(context, profileController),
                const SizedBox(height: 20),
                if (profileController.errorMessage != null)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Text(profileController.errorMessage!, style: const TextStyle(color: AppColors.error, fontSize: 13)),
                  ),
                const SizedBox(height: 80),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStats(BuildContext context, ProfileController controller) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: AppColors.cardGradient,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border, width: 0.5),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _StatItem(label: 'Points', value: controller.displayPoints.toString()),
          _StatItem(label: 'Status', value: controller.profile?.status == 'active' ? 'Active' : 'Inactive'),
          _StatItem(label: 'Referral', value: controller.displayReferralCode.isEmpty ? 'N/A' : controller.displayReferralCode),
        ],
      ),
    );
  }

  Widget _buildMenuItems(BuildContext context, ProfileController controller) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: AppColors.cardSecondary,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border, width: 0.5),
      ),
      child: Column(
        children: [
          _MenuTile(
            icon: Icons.person_outline,
            label: AppStrings.editProfile,
            onTap: () => context.push(RouteNames.editProfile),
          ),
          const Divider(height: 1, indent: 56, endIndent: 16, color: AppColors.divider),
          _MenuTile(
            icon: Icons.star_outline,
            label: AppStrings.bonuses,
            onTap: () => context.push(RouteNames.bonuses),
          ),
          const Divider(height: 1, indent: 56, endIndent: 16, color: AppColors.divider),
          _MenuTile(
            icon: Icons.history_outlined,
            label: AppStrings.myPlays,
            onTap: () => context.push(RouteNames.myPlays),
          ),
          const Divider(height: 1, indent: 56, endIndent: 16, color: AppColors.divider),
          _MenuTile(
            icon: Icons.headset_mic_outlined,
            label: AppStrings.support,
            onTap: () => context.push(RouteNames.support),
          ),
          const Divider(height: 1, indent: 56, endIndent: 16, color: AppColors.divider),
          _MenuTile(
            icon: Icons.settings_outlined,
            label: AppStrings.settings,
            onTap: () => context.push(RouteNames.settings),
          ),
          const Divider(height: 1, indent: 56, endIndent: 16, color: AppColors.divider),
          _MenuTile(
            icon: Icons.info_outline,
            label: AppStrings.about,
            onTap: () => context.push(RouteNames.about),
          ),
        ],
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final String value;

  const _StatItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.goldBright)),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
      ],
    );
  }
}

class _MenuTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _MenuTile({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
        child: Row(
          children: [
            Icon(icon, color: AppColors.goldBright, size: 22),
            const SizedBox(width: 14),
            Text(label, style: const TextStyle(fontSize: 15, color: AppColors.textPrimary)),
            const Spacer(),
            Icon(Icons.chevron_right, color: AppColors.textMuted, size: 20),
          ],
        ),
      ),
    );
  }
}
