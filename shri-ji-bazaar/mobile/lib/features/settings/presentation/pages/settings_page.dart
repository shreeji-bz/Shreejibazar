import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/custom_button.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(backgroundColor: AppColors.background, elevation: 0, title: const Text('Settings', style: TextStyle(color: AppColors.goldBright))),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _SettingsTile(icon: Icons.person_outline, label: 'Edit Profile', onTap: () => context.push('/edit-profile')),
          _SettingsTile(icon: Icons.notifications_outlined, label: 'Notifications', onTap: () {}),
          _SettingsTile(icon: Icons.lock_outline, label: 'Change Password', onTap: () {}),
          _SettingsTile(icon: Icons.language_outlined, label: 'Language', trailing: 'English'),
          _SettingsTile(icon: Icons.help_outline, label: 'Help & FAQ', onTap: () {}),
          _SettingsTile(icon: Icons.info_outline, label: 'About', onTap: () => context.push('/about')),
          _SettingsTile(icon: Icons.description_outlined, label: 'Terms & Conditions', onTap: () => context.push('/terms')),
          const SizedBox(height: 20),
          Center(child: CustomButton(text: 'LOGOUT', isOutlined: true, onPressed: () {}, color: AppColors.error)),
        ],
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String? trailing;
  final VoidCallback? onTap;

  const _SettingsTile({required this.icon, required this.label, this.trailing, this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 1),
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 4),
        decoration: const BoxDecoration(color: AppColors.cardSecondary),
        child: Row(children: [
          Icon(icon, color: AppColors.goldBright, size: 22),
          const SizedBox(width: 14),
          Text(label, style: const TextStyle(fontSize: 15, color: AppColors.textPrimary)),
          const Spacer(),
          if (trailing != null) Text(trailing!, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
          if (onTap != null) Icon(Icons.chevron_right, color: AppColors.textMuted, size: 20),
        ]),
      ),
    );
  }
}
