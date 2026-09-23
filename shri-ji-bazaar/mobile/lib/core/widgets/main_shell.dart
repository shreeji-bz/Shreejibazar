import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/routes/route_names.dart';
import '../../shared/widgets/bottom_nav.dart';
import 'app_sidebar.dart';

final GlobalKey<ScaffoldState> mainShellKey = GlobalKey<ScaffoldState>(debugLabel: 'mainShell');

class MainShell extends StatelessWidget {
  final Widget child;

  const MainShell({super.key, required this.child});

  int _calculateIndex(GoRouterState state) {
    final location = state.matchedLocation;
    if (location == RouteNames.myPlays || location == RouteNames.resultDetail) return 0;
    if (location == RouteNames.wallet) return 1;
    if (location == RouteNames.games || location.startsWith('${RouteNames.games}/')) return 2;
    if (location == RouteNames.results) return 3;
    if (location == RouteNames.referrals) return 4;
    return 0;
  }

  static void openDrawer(BuildContext context) {
    mainShellKey.currentState?.openDrawer();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: mainShellKey,
      drawer: const AppSidebar(),
      body: child,
      bottomNavigationBar: BottomNav(
        currentIndex: _calculateIndex(GoRouterState.of(context)),
      ),
    );
  }
}
