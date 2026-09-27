import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';

class AboutPage extends StatelessWidget {
  const AboutPage({super.key});

  static const _appName = 'Shri Ji Bazaar';
  static const _version = '1.0.0';
  static const _buildNumber = '1';
  static const _description = 'Your ultimate gaming platform for exciting draws and big wins.';

  Future<void> _openLink(BuildContext context, String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not open $url'), backgroundColor: const Color(0xFFE53935)),
        );
      }
    }
  }

  void _showPrivacyDialog(BuildContext context) {
    showAboutDialog(
      context: context,
      applicationName: _appName,
      applicationVersion: _version,
      applicationIcon: Icon(Icons.casino_rounded, color: Theme.of(context).colorScheme.primary, size: 48),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('About')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 40),
              Center(
                child: Container(
                  width: 100,
                  height: 100,
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Color(0xFF8A5A00), Color(0xFFD89B18), Color(0xFF8A5A00)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.all(Radius.circular(28)),
                  ),
                  child: const Icon(Icons.casino_rounded, size: 48, color: Colors.white),
                ),
              ),
              const SizedBox(height: 24),
              Center(child: Text(_appName, style: Theme.of(context).textTheme.headlineMedium)),
              const SizedBox(height: 8),
              Center(
                child: Text('Version $_version (Build $_buildNumber)', style: Theme.of(context).textTheme.bodySmall),
              ),
              const SizedBox(height: 12),
              Center(
                child: Text(_description, textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyMedium),
              ),
              const SizedBox(height: 40),
              Card(
                child: Column(
                  children: [
                    const ListTile(title: Text('Developer', style: AppTextStyles.cardTitle), subtitle: Text('Shri Ji Bazaar Team')),
                    const Divider(height: 1),
                    ListTile(
                      title: const Text('Website', style: AppTextStyles.cardTitle),
                      subtitle: const Text('www.shrijibazaar.com', style: AppTextStyles.bodySmall),
                      trailing: const Icon(Icons.open_in_new_rounded, size: 18),
                      onTap: () => _openLink(context, 'https://www.shrijibazaar.com'),
                    ),
                    const Divider(height: 1),
                    ListTile(
                      title: const Text('Email', style: AppTextStyles.cardTitle),
                      subtitle: const Text('support@shrijibazaar.com', style: AppTextStyles.bodySmall),
                      trailing: const Icon(Icons.open_in_new_rounded, size: 18),
                      onTap: () => _openLink(context, 'mailto:support@shrijibazaar.com'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              TextButton.icon(
                onPressed: () => _showPrivacyDialog(context),
                icon: const Icon(Icons.privacy_tip_rounded, size: 18),
                label: const Text('Privacy Policy'),
              ),
              const SizedBox(height: 40),
              Center(child: Text('© 2026 Shri Ji Bazaar. All rights reserved.', style: AppTextStyles.caption)),
            ],
          ),
        ),
      ),
    );
  }
}
