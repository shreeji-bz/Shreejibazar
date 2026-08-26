import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';

class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool isOutlined;
  final double? width;
  final Color? color;

  const CustomButton({
    super.key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.isOutlined = false,
    this.width,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final buttonColor = color ?? AppColors.gold;
    final effectiveWidth = width ?? MediaQuery.of(context).size.width - 48;

    if (isOutlined) {
      return SizedBox(
        width: effectiveWidth,
        height: 52,
        child: OutlinedButton(
          onPressed: isLoading ? null : onPressed,
          style: OutlinedButton.styleFrom(
            side: BorderSide(color: buttonColor, width: 1.5),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          child: isLoading
              ? SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: buttonColor))
              : Text(text, style: AppTextStyles.button.copyWith(color: buttonColor)),
        ),
      );
    }

    return SizedBox(
      width: effectiveWidth,
      height: 52,
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: buttonColor,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        child: isLoading
            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.textPrimary))
            : Text(text, style: AppTextStyles.button),
      ),
    );
  }
}
