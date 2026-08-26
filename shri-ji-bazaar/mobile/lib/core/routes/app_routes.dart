import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../features/splash/presentation/pages/splash_page.dart';
import '../features/authentication/presentation/pages/login_page.dart';
import '../features/authentication/presentation/pages/register_page.dart';
import '../features/authentication/presentation/pages/forgot_password_page.dart';
import '../features/home/presentation/pages/home_page.dart';
import '../features/games/presentation/pages/games_page.dart';
import '../features/game_details/presentation/pages/game_details_page.dart';
import '../features/results/presentation/pages/results_page.dart';
import '../features/my_activity/presentation/pages/my_activity_page.dart';
import '../features/points/presentation/pages/points_page.dart';
import '../features/bonuses/presentation/pages/bonuses_page.dart';
import '../features/referrals/presentation/pages/referrals_page.dart';
import '../features/notifications/presentation/pages/notifications_page.dart';
import '../features/profile/presentation/pages/profile_page.dart';
import '../features/support/presentation/pages/support_page.dart';
import '../features/settings/presentation/pages/settings_page.dart';
import '../features/settings/presentation/pages/about_page.dart';
import '../core/constants/app_keys.dart';
import '../core/widgets/main_shell.dart';

class AppRouter extends ChangeNotifier {
  final GoRouter _router;

  AppRouter(this._router);

  GoRouter get value => _router;
}

GoRouter createRouter(BuildContext context) {
  return GoRouter(
    initialLocation: RouteNames.splash,
    redirect: (context, state) {
      final auth = Provider.of<AuthController>(context, listen: false);
      final isLoggedIn = auth.isAuthenticated;
      final isAuthRoute = state.matchedLocation == RouteNames.login ||
          state.matchedLocation == RouteNames.register ||
          state.matchedLocation == RouteNames.forgotPassword ||
          state.matchedLocation == RouteNames.otpVerification ||
          state.matchedLocation == RouteNames.splash;

      if (!isLoggedIn && !isAuthRoute) return RouteNames.login;
      if (isLoggedIn && isAuthRoute && state.matchedLocation != RouteNames.splash) return RouteNames.home;
      return null;
    },
    routes: [
      GoRoute(path: RouteNames.splash, builder: (_, __) => const SplashPage()),
      GoRoute(path: RouteNames.login, builder: (_, __) => const LoginPage()),
      GoRoute(path: RouteNames.register, builder: (_, __) => const RegisterPage()),
      GoRoute(path: RouteNames.forgotPassword, builder: (_, __) => const ForgotPasswordPage()),
      GoRoute(
        path: RouteNames.otpVerification,
        builder: (context, state) => OtpVerificationPage(mobile: state.uri.queryParameters['mobile'] ?? ''),
      ),
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(path: RouteNames.home, builder: (_, __) => const HomePage()),
          GoRoute(path: RouteNames.games, builder: (_, __) => const GamesPage()),
          GoRoute(path: '${RouteNames.gameDetails}/:id', builder: (context, state) {
            final id = state.pathParameters['id'] ?? '';
            return GameDetailsPage(gameId: id);
          }),
          GoRoute(path: RouteNames.results, builder: (_, __) => const ResultsPage()),
          GoRoute(path: RouteNames.myPlays, builder: (_, __) => const MyActivityPage()),
          GoRoute(path: RouteNames.points, builder: (_, __) => const PointsPage()),
          GoRoute(path: RouteNames.bonuses, builder: (_, __) => const BonusesPage()),
          GoRoute(path: RouteNames.referrals, builder: (_, __) => const ReferralsPage()),
          GoRoute(path: RouteNames.notifications, builder: (_, __) => const NotificationsPage()),
          GoRoute(path: RouteNames.profile, builder: (_, __) => const ProfilePage()),
          GoRoute(path: RouteNames.support, builder: (_, __) => const SupportPage()),
          GoRoute(path: RouteNames.settings, builder: (_, __) => const SettingsPage()),
          GoRoute(path: RouteNames.about, builder: (_, __) => const AboutPage()),
        ],
      ),
    ],
  );
}
