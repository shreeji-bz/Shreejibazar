import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import '../controllers/referral_controller.dart';

class ReferralsPage extends StatefulWidget {
  const ReferralsPage({super.key});

  @override
  State<ReferralsPage> createState() => _ReferralsPageState();
}

class _ReferralsPageState extends State<ReferralsPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<ReferralController>().loadReferralData();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Referrals')),
      body: SafeArea(
        child: Consumer<ReferralController>(
          builder: (context, referralController, _) {
            final referralCode = referralController.referralCode ?? 'SJB2026';

            return SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(24),
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Color(0xFF8A5A00), Color(0xFFD89B18), Color(0xFF8A5A00)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.all(Radius.circular(20)),
                    ),
                    child: Column(
                      children: [
                        Text('Your Referral Code', style: AppTextStyles.body.copyWith(color: Colors.white70)),
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.3),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            referralCode,
                            style: AppTextStyles.display.copyWith(color: Colors.white, letterSpacing: 4),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: () {
                                  final code = referralController.referralCode;
                                  if (code != null && code.isNotEmpty) {
                                    Clipboard.setData(ClipboardData(text: code));
                                    if (mounted) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(content: Text('Referral code copied!'), backgroundColor: Color(0xFF25C85A)),
                                      );
                                    }
                                  }
                                },
                                icon: const Icon(Icons.copy_rounded, size: 18),
                                label: const Text('Copy Code'),
                                style: ElevatedButton.styleFrom(backgroundColor: Colors.white.withValues(alpha: 0.2)),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: referralController.shareReferralLink,
                                icon: const Icon(Icons.share_rounded, size: 18),
                                label: const Text('Share'),
                                style: ElevatedButton.styleFrom(backgroundColor: Colors.white.withValues(alpha: 0.2)),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Expanded(child: _StatCard(icon: Icons.people_rounded, label: 'Referrals', value: '${referralController.totalReferrals}')),
                      const SizedBox(width: 12),
                      Expanded(child: _StatCard(icon: Icons.stars_rounded, label: 'Points Earned', value: '${referralController.totalPointsEarned}')),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Text('How It Works', style: AppTextStyles.sectionHeading),
                  const SizedBox(height: 12),
                  _StepItem(step: 1, title: 'Share your code', desc: 'Send your referral code to friends.'),
                  _StepItem(step: 2, title: 'Friend registers', desc: 'Your friend signs up using your code.'),
                  _StepItem(step: 3, title: 'Earn bonus points', desc: 'Both of you get bonus points instantly.'),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _StatCard({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(icon, size: 28, color: Theme.of(context).colorScheme.primary),
            const SizedBox(height: 8),
            Text(value, style: AppTextStyles.points),
            Text(label, style: AppTextStyles.caption),
          ],
        ),
      ),
    );
  }
}

class _StepItem extends StatelessWidget {
  final int step;
  final String title;
  final String desc;

  const _StepItem({required this.step, required this.title, required this.desc});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Center(child: Text('$step', style: AppTextStyles.sectionHeading.copyWith(fontSize: 14))),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppTextStyles.cardTitle),
                Text(desc, style: AppTextStyles.bodySmall),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
