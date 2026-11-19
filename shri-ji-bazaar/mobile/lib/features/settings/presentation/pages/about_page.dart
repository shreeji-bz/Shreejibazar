import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import 'package:shri_ji_bazaar/core/widgets/sidebar_toggle.dart';
import 'package:shri_ji_bazaar/features/settings/presentation/controllers/settings_controller.dart';
import 'package:shri_ji_bazaar/features/settings/domain/usecases/get_settings.dart';
import 'package:shri_ji_bazaar/features/settings/data/repositories/settings_repository.dart';
import 'package:shri_ji_bazaar/features/settings/data/datasources/settings_datasource.dart';

class AboutPage extends StatelessWidget {
  const AboutPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) =>
          SettingsController(
            GetSettings(SettingsRepository(SettingsDatasource())),
            SettingsDatasource(),
          )..loadContact(),
      child: const _AboutContent(),
    );
  }
}

class _AboutContent extends StatelessWidget {
  const _AboutContent();

  Future<void> _openLink(BuildContext context, String? url) async {
    if (url == null || url.isEmpty) return;
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not open $url'), backgroundColor: const Color(0xFFE53935)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final settings = context.watch<SettingsController>();
    final whatsapp = settings.whatsApp;
    final telegram = settings.telegram;
    final email = settings.email;
    final supportUrl = settings.supportUrl;
    final appName = settings.appName.isNotEmpty ? settings.appName : 'Shri Ji Bazaar';
    final description = settings.description.isNotEmpty ? settings.description : 'Your ultimate gaming platform for exciting draws and big wins.';

    return Scaffold(
      appBar: AppBar(
        leading: const SidebarToggle(),
        title: Text(appName),
      ),
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
              Center(child: Text(appName, style: Theme.of(context).textTheme.headlineMedium)),
              const SizedBox(height: 8),
              Center(
                child: Text(description, textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyMedium),
              ),
              const SizedBox(height: 40),
              Card(
                child: Column(
                  children: [
                    if (whatsapp != null && whatsapp.isNotEmpty)
                      ListTile(
                        title: Text('WhatsApp', style: AppTextStyles.cardTitle),
                        subtitle: Text(whatsapp, style: AppTextStyles.bodySmall),
                        trailing: const Icon(Icons.open_in_new_rounded, size: 18),
                        onTap: () => _openLink(context, 'https://wa.me/${whatsapp.replaceAll(RegExp(r'[^0-9+]'), '')}'),
                      )
                    else
                      const ListTile(title: Text('WhatsApp'), subtitle: Text('Not set')),
                    const Divider(height: 1),
                    if (telegram != null && telegram.isNotEmpty)
                      ListTile(
                        title: Text('Telegram', style: AppTextStyles.cardTitle),
                        subtitle: Text(telegram, style: AppTextStyles.bodySmall),
                        trailing: const Icon(Icons.open_in_new_rounded, size: 18),
                        onTap: () => _openLink(context, telegram.startsWith('http') ? telegram : 'https://t.me/${telegram.replaceFirst("@", "")}'),
                      )
                    else
                      const ListTile(title: Text('Telegram'), subtitle: Text('Not set')),
                    const Divider(height: 1),
                    if (email != null && email.isNotEmpty)
                      ListTile(
                        title: Text('Email', style: AppTextStyles.cardTitle),
                        subtitle: Text(email, style: AppTextStyles.bodySmall),
                        trailing: const Icon(Icons.open_in_new_rounded, size: 18),
                        onTap: () => _openLink(context, 'mailto:$email'),
                      )
                    else
                      const ListTile(title: Text('Email'), subtitle: Text('Not set')),
                    const Divider(height: 1),
                    if (supportUrl != null && supportUrl.isNotEmpty)
                      ListTile(
                        title: Text('Support', style: AppTextStyles.cardTitle),
                        subtitle: Text(supportUrl, style: AppTextStyles.bodySmall),
                        trailing: const Icon(Icons.open_in_new_rounded, size: 18),
                        onTap: () => _openLink(context, supportUrl),
                      )
                    else
                      const ListTile(title: Text('Support'), subtitle: Text('Not set')),
                  ],
                ),
              ),
              const SizedBox(height: 40),
              Center(child: Text('© 2026 $appName. All rights reserved.', style: AppTextStyles.caption)),
            ],
          ),
        ),
      ),
    );
  }
}
