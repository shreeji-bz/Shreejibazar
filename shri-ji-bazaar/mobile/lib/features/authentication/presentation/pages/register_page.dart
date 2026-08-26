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

class RegisterPage extends StatelessWidget {
  const RegisterPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AuthController(),
      child: const _RegisterPageContent(),
    );
  }
}

class _RegisterPageContent extends StatefulWidget {
  const _RegisterPageContent();

  @override
  State<_RegisterPageContent> createState() => _RegisterPageContentState();
}

class _RegisterPageContentState extends State<_RegisterPageContent> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _mobileController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _referralController = TextEditingController();
  bool _obscurePassword = true;

  @override
  Widget build(BuildContext context) {
    final authController = Provider.of<AuthController>(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(backgroundColor: AppColors.background, elevation: 0, title: const Text('Create Account', style: TextStyle(color: AppColors.goldBright))),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                const SizedBox(height: 16),
                CustomTextField(controller: _nameController, hintText: AppStrings.fullName, validator: (v) => v == null || v.length < 2 ? 'Name required' : null),
                const SizedBox(height: 12),
                CustomTextField(controller: _mobileController, hintText: AppStrings.mobileNumber, keyboardType: TextInputType.phone, validator: (v) => v == null || v.length != 10 ? 'Enter valid mobile' : null),
                const SizedBox(height: 12),
                CustomTextField(controller: _emailController, hintText: AppStrings.email, keyboardType: TextInputType.emailAddress, validator: (v) => v == null || v.contains('@') ? null : 'Enter valid email'),
                const SizedBox(height: 12),
                CustomTextField(controller: _passwordController, hintText: AppStrings.password, obscureText: _obscurePassword, validator: (v) => v == null || v.length < 6 ? 'Min 6 characters' : null),
                const SizedBox(height: 12),
                CustomTextField(controller: _confirmPasswordController, hintText: AppStrings.confirmPassword, obscureText: _obscurePassword, validator: (v) => v != _passwordController.text ? 'Passwords do not match' : null),
                const SizedBox(height: 12),
                CustomTextField(controller: _referralController, hintText: AppStrings.referralCode),
                if (authController.errorMessage != null) ...[
                  const SizedBox(height: 12),
                  Text(authController.errorMessage!, style: const TextStyle(color: AppColors.error, fontSize: 13)),
                ],
                const SizedBox(height: 24),
                CustomButton(
                  label: AppStrings.register,
                  isLoading: authController.status == AuthStatus.loading,
                  onPressed: () async {
                    if (!_formKey.currentState!.validate()) return;
                    await authController.register(
                      name: _nameController.text.trim(),
                      mobile: _mobileController.text.trim(),
                      password: _passwordController.text,
                      referralCode: _referralController.text.trim().isEmpty ? null : _referralController.text.trim(),
                    );
                    if (authController.status == AuthStatus.authenticated && mounted) {
                      context.go(RouteNames.home);
                    }
                  },
                ),
                const SizedBox(height: 16),
                TextButton(onPressed: () => context.pop(), child: const Text('Already have an account? Login', style: TextStyle(color: AppColors.textSecondary))),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _mobileController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _referralController.dispose();
    super.dispose();
  }
}
