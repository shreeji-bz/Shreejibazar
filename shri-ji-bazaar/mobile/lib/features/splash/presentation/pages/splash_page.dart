import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/config/env.dart';
import '../../../../core/routes/route_names.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../features/authentication/presentation/controllers/auth_controller.dart';
import '../../../../features/splash/domain/entities/splash_entity.dart';
import '../controllers/splash_controller.dart';

class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage> {
  @override
  void initState() {
    super.initState();
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    // Minimum splash display time — kept short so the loader never feels long.
    await Future.delayed(const Duration(milliseconds: 400));

    if (!mounted) return;

    final splashController = Provider.of<SplashController>(context, listen: false);
    final auth = Provider.of<AuthController>(context, listen: false);

    // Wait for the auth check, but NEVER spin the loader forever: when the
    // backend is unreachable the auth check can stall (30s x3 retries +
    // refresh). Cap the wait at 3s and fall through to login/home with
    // whatever state we have, so a slow/dead backend is not felt.
    final authTimer = Stopwatch()..start();
    while (auth.status == AuthStatus.loading || auth.status == AuthStatus.initial) {
      if (authTimer.elapsed > const Duration(seconds: 3)) break;
      await Future.delayed(const Duration(milliseconds: 100));
      if (!mounted) return;
    }

    if (!mounted) return;

    // Check maintenance + update status before routing. A hard timeout
    // guarantees the splash never blocks routing on a slow/dead backend —
    // on timeout we just skip the checks and route normally (2s cap).
    SplashEntity? entity;
    try {
      entity = await splashController
          .getSettings()
          .timeout(const Duration(seconds: 2), onTimeout: () => null);
    } catch (_) {
      // If the status fetch fails, continue normally
    }

    if (entity != null) {
      // Maintenance gate (existing behaviour).
      if (entity.maintenanceMode && mounted) {
        context.go(RouteNames.maintenance);
        return;
      }
      // "Update App" gate: if the admin published a newer APK version via
      // Apk Manager, offer to download it before entering the app.
      if (_isNewerVersion(entity.latestVersion, AppEnv.APP_VERSION) &&
          entity.apkUrl != null &&
          mounted) {
        await _showUpdateDialog(entity);
      }
    }

    if (!mounted) return;

    if (auth.isAuthenticated) {
      context.go(RouteNames.home);
    } else {
      context.go(RouteNames.login);
    }
  }

  /// Semver-ish comparison: a > b per dotted part (missing parts = 0).
  bool _isNewerVersion(String candidate, String current) {
    List<int> parse(String v) =>
        v.split('.').map((p) => int.tryParse(p.trim()) ?? 0).toList();
    final a = parse(candidate);
    final b = parse(current);
    for (int i = 0; i < 3; i++) {
      final x = i < a.length ? a[i] : 0;
      final y = i < b.length ? b[i] : 0;
      if (x != y) return x > y;
    }
    return false;
  }

  /// "Update App" dialog driven by the admin's Apk Manager settings.
  /// Download opens the public APK URL; "Later" is hidden when the admin
  /// has forced the update.
  Future<void> _showUpdateDialog(SplashEntity entity) async {
    final apkUrl = entity.apkUrl!;
    final result = await showDialog<Object?>(
      context: context,
      barrierDismissible: !entity.forceUpdate,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.card,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          'Update to v${entity.latestVersion}',
          style: AppTextStyles.heading.copyWith(color: AppColors.gold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (entity.apkChangelog != null && entity.apkChangelog!.isNotEmpty) ...[
              Text(entity.apkChangelog!, style: AppTextStyles.body),
              const SizedBox(height: 12),
            ] else ...[
              Text(
                'A newer version of the app is available.',
                style: AppTextStyles.body,
              ),
              const SizedBox(height: 12),
            ],
            if (entity.forceUpdate)
              Text('This update is required to continue.',
                  style: AppTextStyles.bodySmall.copyWith(color: AppColors.error)),
          ],
        ),
        actions: [
          if (!entity.forceUpdate)
            TextButton(
              onPressed: () => Navigator.pop(context, 'later'),
              child: Text('Later', style: AppTextStyles.bodySmall),
            ),
          FilledButton(
            onPressed: () => Navigator.pop(context, 'download'),
            child: Text('Download', style: AppTextStyles.bodySmall),
          ),
        ],
      ),
    );

    if (result == 'download') {
      try {
        await launchUrl(Uri.parse(apkUrl), mode: LaunchMode.externalApplication);
      } catch (_) {
        // Fallback: try browser launch (some devices block direct .apk).
        try {
          await launchUrl(Uri.parse(apkUrl), mode: LaunchMode.inAppWebView);
        } catch (_) {}
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Image.asset('assets/logos/logo.webp', width: 96, height: 96, fit: BoxFit.cover),
            ),
            const SizedBox(height: 20),
            Text('SHREEJI BAZAAR', style: AppTextStyles.appName.copyWith(color: AppColors.gold)),
            const SizedBox(height: 16),
            SizedBox(
              width: 22,
              height: 22,
              child: CircularProgressIndicator(strokeWidth: 2.5, color: AppColors.gold),
            ),
          ],
        ),
      ),
    );
  }
}
