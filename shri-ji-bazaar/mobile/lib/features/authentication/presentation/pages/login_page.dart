import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../../core/routes/route_names.dart';
import '../../../../core/storage/secure_storage.dart';
import '../controllers/auth_controller.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 60),
              // App logo / Title
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Image.asset(
                  'assets/logos/logo.webp',
                  width: 80,
                  height: 80,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stack) =>
                      Container(width: 80, height: 80, decoration: BoxDecoration(color: Theme.of(context).colorScheme.primary, borderRadius: BorderRadius.circular(16))),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Shri Ji Bazaar',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Login to your account',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(height: 40),
              // Login Form
              Consumer<AuthController>(
                builder: (context, auth, _) {
                  if (auth.status == AuthStatus.error) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.red[50],
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.red[200]!),
                        ),
                        child: Text(
                          auth.errorMessage ?? 'Login failed',
                          style: TextStyle(color: Colors.red[700]),
                        ),
                      ),
                    );
                  }
                  return const SizedBox.shrink();
                },
              ),
              const _LoginForm(),
              const SizedBox(height: 24),
              // Register link
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    "Don't have an account? ",
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  TextButton(
                    onPressed: () => context.push(RouteNames.register),
                    child: const Text('Register'),
                  ),
                ],
              ),
              // Forgot password link
              TextButton(
                onPressed: () => context.push(RouteNames.forgotPassword),
                child: const Text('Forgot Password?'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _LoginForm extends StatefulWidget {
  const _LoginForm();

  @override
  State<_LoginForm> createState() => _LoginFormState();
}

class _LoginFormState extends State<_LoginForm> {
  final _formKey = GlobalKey<FormState>();
  final _identifierController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  String? _devOtp;
  bool _otpBusy = false;

  @override
  void initState() {
    super.initState();
    // Old users keep access: pre-fill the identifier they last used so they
    // don't have to re-type it. (New users register instead.)
    SecureStorage.readCredential().then((saved) {
      if (saved != null && saved.isNotEmpty && _identifierController.text.isEmpty) {
        _identifierController.text = saved;
      }
    });
  }

  @override
  void dispose() {
    _identifierController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _submit(BuildContext context) {
    if (_formKey.currentState!.validate()) {
      final auth = Provider.of<AuthController>(context, listen: false);
      // Unified identifier: 10-digit mobile OR email address.
      auth.login(
        mobile: _identifierController.text.trim(),
        password: _passwordController.text,
      );
    }
  }

  /// Fast dev-mode OTP: the code is generated instantly and shown right
  /// on screen (no SMS round-trip, no delay). Swappable with a real
  /// provider later without touching the UI.
  Future<void> _loginWithOtp(BuildContext context) async {
    final auth = Provider.of<AuthController>(context, listen: false);
    final identifier = _identifierController.text.trim();
    if (identifier.isEmpty) {
      _formKey.currentState?.validate();
      return;
    }
    setState(() {
      _otpBusy = true;
      _devOtp = null;
    });
    try {
      final code = await auth.requestOtp(identifier: identifier);
      if (!mounted) return;
      setState(() {
        _devOtp = code;
        _otpBusy = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _otpBusy = false;
        _devOtp = null;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
    }
  }

  Future<void> _verifyOtp(BuildContext context) async {
    final otp = _devOtp;
    if (otp == null) return;
    final auth = Provider.of<AuthController>(context, listen: false);
    await auth.verifyOtp(identifier: _identifierController.text.trim(), otp: otp);
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          // Mobile / Email
          TextFormField(
            controller: _identifierController,
            keyboardType: TextInputType.text,
            decoration: const InputDecoration(
              labelText: 'Mobile Number / Email',
              hintText: '10-digit mobile or email address',
              prefixIcon: Icon(Icons.person_outline_rounded),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) return 'Please enter mobile or email';
              final v = value.trim();
              final isEmail = v.contains('@') && v.contains('.');
              final isMobile = RegExp(r'^[6-9]\d{9}$').hasMatch(v);
              if (!isEmail && !isMobile) {
                return 'Enter a valid mobile number or email';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          // Password
          TextFormField(
            controller: _passwordController,
            obscureText: _obscurePassword,
            decoration: InputDecoration(
              labelText: 'Password',
              hintText: 'Enter your password',
              prefixIcon: const Icon(Icons.lock_rounded),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscurePassword ? Icons.visibility_off : Icons.visibility,
                ),
                onPressed: () {
                  setState(() => _obscurePassword = !_obscurePassword);
                },
              ),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter password';
              }
              if (value.length < 6) {
                return 'Password must be at least 6 characters';
              }
              return null;
            },
          ),
          const SizedBox(height: 24),
          // Login Button
          Consumer<AuthController>(
            builder: (context, auth, _) {
              final isLoading = auth.status == AuthStatus.loading;
              return SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: isLoading ? null : () => _submit(context),
                  child: isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text(
                          'Login',
                          style: TextStyle(fontSize: 16),
                        ),
                ),
              );
            },
          ),
          const SizedBox(height: 12),
          // Fast OTP login (code shown on screen, no delay)
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('Or login with ', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.grey[600])),
              TextButton(
                onPressed: _otpBusy ? null : () => _loginWithOtp(context),
                child: _otpBusy
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('OTP', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          if (_devOtp != null) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.green[50],
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.green[300]!),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('Your OTP: ', style: TextStyle(color: Colors.green)),
                  Text(
                    _devOtp!,
                    style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 6,
                        color: Colors.green),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              height: 46,
              child: ElevatedButton.icon(
                icon: const Icon(Icons.verified_rounded),
                label: const Text('Verify OTP'),
                onPressed: () => _verifyOtp(context),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
