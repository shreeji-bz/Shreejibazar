import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/constants/app_strings.dart';
import '../../../core/routes/route_names.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/widgets/custom_text_field.dart';
import '../controllers/auth_controller.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AuthController(),
      child: const _LoginPageContent(),
    );
  }
}

class _LoginPageContent extends StatefulWidget {
  const _LoginPageContent();

  @override
  State<_LoginPageContent> createState() => _LoginPageContentState();
}

class _LoginPageContentState extends State<_LoginPageContent> {
  final _formKey = GlobalKey<FormState>();
  final _mobileController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  Widget build(BuildContext context) {
    final authController = Provider.of<AuthController>(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: 60),
                Container(
                  width: 80, height: 80,
                  decoration: BoxDecoration(shape: BoxShape.circle, gradient: AppColors.goldGradient, boxShadow: [BoxShadow(color: AppColors.gold.withOpacity(0.3), blurRadius: 20)]),
                  child: const Icon(Icons.auto_awesome, size: 40, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 24),
                Text(AppStrings.appName, style: AppTextStyles.display),
                const SizedBox(height: 8),
                Text(AppStrings.welcomeBack, style: AppTextStyles.sectionHeading),
                const SizedBox(height: 48),
                CustomTextField(controller: _mobileController, hintText: AppStrings.mobileNumber, keyboardType: TextInputType.phone, validator: (v) => v == null || v.length != 10 ? 'Enter valid 10-digit mobile' : null),
                const SizedBox(height: 16),
                CustomTextField(
                  controller: _passwordController,
                  hintText: AppStrings.password,
                  obscureText: _obscurePassword,
                  suffixIcon: IconButton(icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility, color: AppColors.textMuted), onPressed: () => setState(() => _obscurePassword = !_obscurePassword)),
                  validator: (v) => v == null || v.length < 6 ? 'Password must be at least 6 characters' : null,
                ),
                const SizedBox(height: 8),
                Align(alignment: Alignment.centerRight, child: TextButton(onPressed: () => context.push(RouteNames.forgotPassword), child: const Text(AppStrings.forgotPassword, style: TextStyle(color: AppColors.gold)))),
                if (authController.errorMessage != null) ...[
                  const SizedBox(height: 12),
                  Text(authController.errorMessage!, style: const TextStyle(color: AppColors.error, fontSize: 13)),
                ],
                const SizedBox(height: 24),
                CustomButton(
                  label: AppStrings.login,
                  isLoading: authController.status == AuthStatus.loading,
                  onPressed: () async {
                    if (!_formKey.currentState!.validate()) return;
                    await authController.login(
                      mobile: _mobileController.text.trim(),
                      password: _passwordController.text,
                    );
                    if (authController.status == AuthStatus.authenticated && mounted) {
                      context.go(RouteNames.home);
                    }
                  },
                ),
                const SizedBox(height: 16),
                TextButton(onPressed: () => context.push(RouteNames.register), child: const Text('Don\'t have an account? Sign Up', style: TextStyle(color: AppColors.textSecondary))),
                const SizedBox(height: 48),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _mobileController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}
