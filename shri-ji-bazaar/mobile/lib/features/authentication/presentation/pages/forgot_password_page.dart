import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/constants/app_strings.dart';
import '../../../core/routes/route_names.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/widgets/custom_text_field.dart';
import '../controllers/auth_controller.dart';

class ForgotPasswordPage extends StatelessWidget {
  const ForgotPasswordPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AuthController(),
      child: const _ForgotPasswordContent(),
    );
  }
}

class _ForgotPasswordContent extends StatefulWidget {
  const _ForgotPasswordContent();

  @override
  State<_ForgotPasswordContent> createState() => _ForgotPasswordContentState();
}

class _ForgotPasswordContentState extends State<_ForgotPasswordContent> {
  final _mobileController = TextEditingController();
  final _resetCodeController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscurePassword = true;
  int _step = 1;

  @override
  Widget build(BuildContext context) {
    final authController = Provider.of<AuthController>(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(backgroundColor: AppColors.background, elevation: 0, title: Text(_step == 1 ? 'Forgot Password' : 'Reset Password', style: const TextStyle(color: AppColors.goldBright))),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const SizedBox(height: 32),
              if (_step == 1) ...[
                Text('Enter your registered mobile number', style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
                const SizedBox(height: 24),
                CustomTextField(
                  controller: _mobileController,
                  hintText: AppStrings.mobileNumber,
                  keyboardType: TextInputType.phone,
                  validator: (v) => v == null || v.length != 10 ? 'Enter valid 10-digit mobile' : null,
                ),
                const SizedBox(height: 24),
                CustomButton(
                  label: 'Send Reset Code',
                  isLoading: authController.status == AuthStatus.loading,
                  onPressed: () async {
                    final mobile = _mobileController.text.trim();
                    if (mobile.length != 10) return;
                    await authController.forgotPassword(mobile);
                    if (authController.status == AuthStatus.unauthenticated && mounted) {
                      setState(() => _step = 2);
                    }
                  },
                ),
                if (authController.errorMessage != null) ...[
                  const SizedBox(height: 16),
                  Text(authController.errorMessage!, style: const TextStyle(color: AppColors.error, fontSize: 13)),
                ],
              ] else ...[
                Text('Enter the reset code and new password', style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
                const SizedBox(height: 24),
                CustomTextField(
                  controller: _resetCodeController,
                  hintText: 'Reset Code (6 digits)',
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  validator: (v) => v == null || v.length != 6 ? 'Enter 6-digit code' : null,
                ),
                const SizedBox(height: 12),
                CustomTextField(
                  controller: _newPasswordController,
                  hintText: 'New Password',
                  obscureText: _obscurePassword,
                  validator: (v) => v == null || v.length < 6 ? 'Min 6 characters' : null,
                ),
                const SizedBox(height: 12),
                CustomTextField(
                  controller: _confirmPasswordController,
                  hintText: 'Confirm New Password',
                  obscureText: _obscurePassword,
                  validator: (v) => v != _newPasswordController.text ? 'Passwords do not match' : null,
                ),
                const SizedBox(height: 24),
                CustomButton(
                  label: 'Reset Password',
                  isLoading: authController.status == AuthStatus.loading,
                  onPressed: () async {
                    final mobile = _mobileController.text.trim();
                    final code = _resetCodeController.text.trim();
                    final newPassword = _newPasswordController.text;
                    if (mobile.length != 10 || code.length != 6) return;
                    await authController.resetPassword(mobile: mobile, resetCode: code, newPassword: newPassword);
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Password reset successfully')));
                      context.go(RouteNames.login);
                    }
                  },
                ),
                if (authController.errorMessage != null) ...[
                  const SizedBox(height: 16),
                  Text(authController.errorMessage!, style: const TextStyle(color: AppColors.error, fontSize: 13)),
                ],
              ],
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _mobileController.dispose();
    _resetCodeController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }
}
