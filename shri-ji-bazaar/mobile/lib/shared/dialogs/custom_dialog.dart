import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class CustomDialog extends StatelessWidget {
  final String title;
  final String message;
  final String? confirmText;
  final String? cancelText;
  final VoidCallback? onConfirm;
  final VoidCallback? onCancel;

  const CustomDialog({
    super.key,
    required this.title,
    required this.message,
    this.confirmText,
    this.cancelText,
    this.onConfirm,
    this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: AppColors.card,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: const BorderSide(color: AppColors.border)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.goldBright)),
            const SizedBox(height: 12),
            Text(message, textAlign: TextAlign.center, style: const TextStyle(color: AppColors.textSecondary, fontSize: 14)),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                if (cancelText != null)
                  TextButton(onPressed: onCancel, child: Text(cancelText!, style: const TextStyle(color: AppColors.textSecondary))),
                if (confirmText != null)
                  ElevatedButton(onPressed: onConfirm, style: ElevatedButton.styleFrom(backgroundColor: AppColors.gold), child: Text(confirmText!)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  static void show(BuildContext context, {required String title, required String message, String? confirmText, VoidCallback? onConfirm}) {
    showDialog(context: context, builder: (ctx) => CustomDialog(title: title, message: message, confirmText: confirmText ?? 'OK', onConfirm: onConfirm ?? () => Navigator.pop(ctx)));
  }
}
