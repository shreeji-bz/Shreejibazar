import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final bool showBackButton;
  final List<Widget>? actions;
  final VoidCallback? onBack;

  const CustomAppBar({
    super.key,
    required this.title,
    this.showBackButton = false,
    this.actions,
    this.onBack,
  });

  @override
  Size get preferredSize => const Size.fromHeight(56);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: AppColors.background,
      elevation: 0,
      automaticallyImplyLeading: showBackButton,
      leading: showBackButton
          ? IconButton(onPressed: onBack ?? () => Navigator.pop(context), icon: const Icon(Icons.arrow_back, color: AppColors.goldBright))
          : null,
      title: Text(title, style: AppTextStyles.sectionHeading),
      centerTitle: true,
      actions: actions,
    );
  }
}
