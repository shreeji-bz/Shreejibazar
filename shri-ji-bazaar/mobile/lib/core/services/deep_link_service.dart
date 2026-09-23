import 'package:app_links/app_links.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../features/authentication/presentation/controllers/auth_controller.dart';
import '../../features/referrals/presentation/controllers/referral_controller.dart';
import '../routes/route_names.dart';

class DeepLinkService {
  static final DeepLinkService _instance = DeepLinkService._internal();
  factory DeepLinkService() => _instance;
  DeepLinkService._internal();

  final AppLinks _appLinks = AppLinks();
  bool _initialized = false;

  Future<void> init(BuildContext context) async {
    if (_initialized) return;
    _initialized = true;

    _appLinks.uriLinkStream.listen((Uri uri) {
      _handleDeepLink(context, uri);
    });

    final initialUri = await _appLinks.getInitialLink();
    if (initialUri != null && context.mounted) {
      _handleDeepLink(context, initialUri);
    }
  }

  void _handleDeepLink(BuildContext context, Uri uri) {
    final path = uri.path;
    final queryParams = uri.queryParameters;

    if (path.contains('/register') && queryParams.containsKey('ref')) {
      final refCode = queryParams['ref'];
      final authController = Provider.of<AuthController>(context, listen: false);
      final referralController = Provider.of<ReferralController>(context, listen: false);

      referralController.referralCode = refCode;

      if (authController.isAuthenticated) {
        context.go(RouteNames.register);
      } else {
        context.go(RouteNames.login);
      }
    }
  }
}
