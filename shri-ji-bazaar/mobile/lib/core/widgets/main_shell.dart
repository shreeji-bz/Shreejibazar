import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/routes/route_names.dart';
import '../../shared/widgets/bottom_nav.dart';

class MainShell extends StatelessWidget {
  final Widget child;

  const MainShell({super.key, required this.child});

  int _calculateIndex(GoRouterState state) {
    final location = state.matchedLocation;
    if (location == RouteNames.home) return 0;
    if (location.startsWith(RouteNames.games)) return 1;
    if (location == RouteNames.myPlays || location == RouteNames.resultDetail) return 2;
    if (location == RouteNames.points) return 3;
    if (location == RouteNames.profile || location.startsWith('/profile')) return 4;
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNav(
        currentIndex: _calculateIndex(GoRouterState.of(context)),
      ),
    );
  }
}
