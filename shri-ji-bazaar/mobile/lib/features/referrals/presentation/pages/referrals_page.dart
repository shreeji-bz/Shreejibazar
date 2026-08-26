import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/constants/app_strings.dart';
import '../../../shared/widgets/bottom_nav.dart';
import '../../../shared/widgets/custom_button.dart';

class ReferralsPage extends StatefulWidget {
  const ReferralsPage({super.key});

  @override
  State<ReferralsPage> createState() => _ReferralsPageState();
}

class _ReferralsPageState extends State<ReferralsPage> {
  final List<Map<String, String>> _referrals = [
    {'name': 'Rahul', 'mobile': '+91 98765****', 'date': '2 days ago'},
    {'name': 'Priya', 'mobile': '+91 87654****', 'date': '5 days ago'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(children: [
          Padding(padding: const EdgeInsets.all(16), child: Text('Refer & Earn', style: AppTextStyles.sectionHeading)),
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(gradient: AppColors.goldGradient, borderRadius: BorderRadius.circular(16)),
            child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Your Code', style: TextStyle(color: AppColors.textPrimary.withOpacity(0.8))),
                const SizedBox(height: 4),
                Text('SHRI1234', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.textPrimary, letterSpacing: 3)),
              ]),
              IconButton(onPressed: () {}, icon: const Icon(Icons.copy, color: AppColors.textPrimary, size: 24)),
            ]),
          ),
          const SizedBox(height: 20),
          Padding(padding: const EdgeInsets.symmetric(horizontal: 16), child: CustomButton(text: 'INVITE FRIENDS', isOutlined: true, onPressed: () {})),
          const SizedBox(height: 20),
          Padding(padding: const EdgeInsets.symmetric(horizontal: 16), child: Align(alignment: Alignment.centerLeft, child: Text('Total Referrals: ${_referrals.length}', style: AppTextStyles.sectionHeading.copyWith(fontSize: 14)))),
          const SizedBox(height: 12),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _referrals.length,
              itemBuilder: (context, index) {
                final ref = _referrals[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(color: AppColors.cardSecondary, borderRadius: BorderRadius.circular(12)),
                  child: Row(children: [
                    Container(width: 36, height: 36, decoration: BoxDecoration(shape: BoxShape.circle, color: AppColors.gold.withOpacity(0.15)), child: Icon(Icons.person, color: AppColors.goldBright, size: 18)),
                    const SizedBox(width: 12),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(ref['name']!, style: AppTextStyles.cardTitle), Text(ref['mobile']!, style: AppTextStyles.caption)])),
                    Text(ref['date']!, style: AppTextStyles.caption),
                  ]),
                );
              },
            ),
          ),
        ]),
      ),
    );
  }
}
