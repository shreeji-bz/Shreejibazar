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
    if (location == RouteNames.myPlays) return 0;
    if (location == RouteNames.wallet) return 1;
    if (location == RouteNames.home) return 2;
    if (location == RouteNames.results) return 3;
    if (location == RouteNames.referrals) return 4;
    return 0;
  }

  /// Toggles the sidebar open/closed. Calling it while the drawer is open
  /// closes it, so the hamburger icon behaves like a proper switch.
  static void toggleDrawer(BuildContext context) {
    final state = mainShellKey.currentState;
    if (state == null) return;
    if (state.isDrawerOpen) {
      state.closeDrawer();
    } else {
      state.openDrawer();
    }
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
