import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import 'package:shri_ji_bazaar/core/routes/route_names.dart';
import '../controllers/settings_controller.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: SafeArea(
        child: Consumer<SettingsController>(
          builder: (context, settingsController, _) {
            final language = 'English';
            final notificationsEnabled = true;
            final darkThemeEnabled = true;

            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _SettingsTile(
                  icon: Icons.language_rounded,
                  title: 'Language',
                  subtitle: language,
                  onTap: () => _showLanguageDialog(context),
                ),
                const Divider(height: 1),
                _SettingsTile(
                  icon: Icons.notifications_rounded,
                  title: 'Notifications',
                  trailing: Switch(
                    value: notificationsEnabled,
                    onChanged: (value) {},
                  ),
                ),
                const Divider(height: 1),
                _SettingsTile(
                  icon: Icons.dark_mode_rounded,
                  title: 'Dark Theme',
                  trailing: Switch(
                    value: darkThemeEnabled,
                    onChanged: (value) {},
                  ),
                ),
                const Divider(height: 1),
                _SettingsTile(
                  icon: Icons.info_outline_rounded,
                  title: 'About',
                  onTap: () => context.push(RouteNames.about),
                ),
                const Divider(height: 1),
                _SettingsTile(
                  icon: Icons.description_rounded,
                  title: 'Terms & Conditions',
                  onTap: () => _showPrivacyDialog(context),
                ),
                const Divider(height: 1),
                _SettingsTile(
                  icon: Icons.privacy_tip_rounded,
                  title: 'Privacy Policy',
                  onTap: () => _showPrivacyDialog(context),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  void _showLanguageDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Select Language'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: ['English', 'Hindi', 'Gujarati'].map((lang) {
              return RadioListTile<String>(
                title: Text(lang),
                value: lang,
                groupValue: lang == 'English' ? lang : null,
                onChanged: (value) {
                  if (value != null) context.pop();
                },
              );
            }).toList(),
          ),
        );
      },
    );
  }

  void _showPrivacyDialog(BuildContext context) {
    showAboutDialog(
      context: context,
      applicationName: 'Shri Ji Bazaar',
      applicationVersion: '1.0.0',
      applicationIcon: Icon(Icons.casino_rounded, color: Theme.of(context).colorScheme.primary, size: 48),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget? trailing;
  final VoidCallback? onTap;

  const _SettingsTile({required this.icon, required this.title, this.subtitle, this.trailing, this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: Theme.of(context).colorScheme.primary),
      title: Text(title, style: AppTextStyles.cardTitle),
      subtitle: subtitle != null ? Text(subtitle!, style: AppTextStyles.bodySmall) : null,
      trailing: trailing ?? (onTap != null ? const Icon(Icons.chevron_right_rounded) : null),
      onTap: onTap,
    );
  }
}
