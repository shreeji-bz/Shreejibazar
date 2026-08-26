import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/constants/app_strings.dart';
import '../../../shared/widgets/custom_button.dart';

class PointsPage extends StatefulWidget {
  const PointsPage({super.key});

  @override
  State<PointsPage> createState() => _PointsPageState();
}

class _PointsPageState extends State<PointsPage> {
  final List<Map<String, String>> _transactions = [
    {'type': 'credit', 'desc': 'Welcome bonus', 'points': '+100', 'date': 'Today'},
    {'type': 'debit', 'desc': 'Play - Ghaziabad', 'points': '-100', 'date': 'Today'},
    {'type': 'credit', 'desc': 'Referral bonus', 'points': '+50', 'date': 'Yesterday'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            Padding(padding: const EdgeInsets.all(16), child: Text(AppStrings.points, style: AppTextStyles.sectionHeading)),
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(gradient: AppColors.goldGradient, borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: AppColors.gold.withOpacity(0.3), blurRadius: 20)]),
              child: Column(children: [
                Text('Available Points', style: AppTextStyles.body.copyWith(color: AppColors.textPrimary.withOpacity(0.9))),
                const SizedBox(height: 8),
                Text('5,250', style: AppTextStyles.display.copyWith(color: AppColors.textPrimary, fontSize: 36)),
              ]),
            ),
            const SizedBox(height: 16),
            Row(children: [
              Expanded(child: Padding(padding: const EdgeInsets.symmetric(horizontal: 16), child: CustomButton(text: 'EARN POINTS', isOutlined: true, onPressed: () {}))),
              const SizedBox(width: 12),
              Expanded(child: Padding(padding: const EdgeInsets.symmetric(horizontal: 16), child: CustomButton(text: 'HISTORY', isOutlined: true, onPressed: () {}))),
            ]),
            const SizedBox(height: 20),
            Padding(padding: const EdgeInsets.symmetric(horizontal: 16), child: Align(alignment: Alignment.centerLeft, child: Text('Recent Transactions', style: AppTextStyles.sectionHeading.copyWith(fontSize: 14)))),
            const SizedBox(height: 12),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: _transactions.length,
                itemBuilder: (context, index) {
                  final tx = _transactions[index];
                  final isCredit = tx['type'] == 'credit';
                  return Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(color: AppColors.cardSecondary, borderRadius: BorderRadius.circular(12)),
                    child: Row(children: [
                      Container(width: 36, height: 36, decoration: BoxDecoration(color: (isCredit ? AppColors.success : AppColors.error).withOpacity(0.15), borderRadius: BorderRadius.circular(10)), child: Icon(isCredit ? Icons.add : Icons.remove, color: isCredit ? AppColors.success : AppColors.error, size: 18)),
                      const SizedBox(width: 12),
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(tx['desc']!, style: AppTextStyles.body), Text(tx['date']!, style: AppTextStyles.caption)])),
                      Text(tx['points']!, style: TextStyle(color: isCredit ? AppColors.success : AppColors.error, fontWeight: FontWeight.w600, fontSize: 14)),
                    ]),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
