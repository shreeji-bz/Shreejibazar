import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../../core/routes/route_names.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../features/authentication/presentation/controllers/auth_controller.dart';
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

    // Check maintenance mode before routing. A hard timeout guarantees the
    // splash never blocks routing on a slow/dead backend — on timeout we just
    // skip the check and route normally. Kept short (2s) for a snappy launch.
    try {
      final entity = await splashController
          .getSettings()
          .timeout(const Duration(seconds: 2), onTimeout: () => null);
      if (entity?.maintenanceMode == true && mounted) {
        context.go(RouteNames.maintenance);
        return;
      }
    } catch (_) {
      // If settings fetch fails, continue normally
    }

    if (auth.isAuthenticated) {
      context.go(RouteNames.home);
    } else {
      context.go(RouteNames.login);
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
