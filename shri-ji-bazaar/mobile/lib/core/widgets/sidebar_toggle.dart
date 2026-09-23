import 'package:flutter/material.dart';
import 'main_shell.dart';

class SidebarToggle extends StatelessWidget {
  const SidebarToggle({super.key});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => MainShell.openDrawer(context),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(8),
        child: const Icon(Icons.menu_rounded, color: Colors.white, size: 26),
      ),
    );
  }
}
