import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/routes/route_names.dart';
import '../../authentication/presentation/controllers/auth_controller.dart';

class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle.light(statusBarColor: AppColors.background));

    _animationController = AnimationController(duration: const Duration(milliseconds: 1800), vsync: this);
    _scaleAnimation = Tween<double>(begin: 0.6, end: 1.0).animate(CurvedAnimation(parent: _animationController, curve: Curves.easeOutCubic));
    _opacityAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(CurvedAnimation(parent: _animationController, curve: const Interval(0.2, 0.8, curve: Curves.easeIn)));

    _animationController.forward();
    _navigateAfterDelay();
  }

  Future<void> _navigateAfterDelay() async {
    await Future.delayed(const Duration(seconds: 3));
    if (mounted) {
      final authController = Provider.of<AuthController>(context, listen: false);
      final target = authController.isAuthenticated ? RouteNames.home : RouteNames.login;
      if (mounted) context.go(target);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Center(
        child: AnimatedBuilder(
          animation: _animationController,
          builder: (context, child) {
            return Opacity(
              opacity: _opacityAnimation.value,
              child: Transform.scale(
                scale: _scaleAnimation.value,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: AppColors.goldGradient,
                        boxShadow: [BoxShadow(color: AppColors.gold.withOpacity(0.4), blurRadius: 30, spreadRadius: 5)],
                      ),
                      child: const Icon(Icons.auto_awesome, size: 60, color: AppColors.textPrimary),
                    ),
                    const SizedBox(height: 24),
                    Text('Shri Ji Bazaar', style: AppTextStyles.display),
                    const SizedBox(height: 12),
                    Text('Play. Earn. Win.', style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }
}
