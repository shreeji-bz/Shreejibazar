import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/constants/app_strings.dart';
import '../../../shared/widgets/custom_button.dart';

class SupportPage extends StatefulWidget {
  const SupportPage({super.key});

  @override
  State<SupportPage> createState() => _SupportPageState();
}

class _SupportPageState extends State<SupportPage> {
  final List<Map<String, String>> _tickets = [
    {'subject': 'Points not credited', 'status': 'Resolved', 'date': '2 days ago'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(backgroundColor: AppColors.background, elevation: 0, title: Text(AppStrings.support, style: AppTextStyles.sectionHeading)),
      body: Column(
        children: [
          Padding(padding: const EdgeInsets.all(16), child: CustomButton(text: AppStrings.createTicket, onPressed: () {})),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _tickets.length,
              itemBuilder: (context, index) {
                final ticket = _tickets[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(color: AppColors.cardSecondary, borderRadius: BorderRadius.circular(12)),
                  child: Row(children: [
                    Icon(Icons.quiz_outlined, color: AppColors.goldBright, size: 22),
                    const SizedBox(width: 14),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(ticket['subject']!, style: AppTextStyles.cardTitle),
                      Text(ticket['date']!, style: AppTextStyles.caption),
                    ])),
                    Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: AppColors.success.withOpacity(0.15), borderRadius: BorderRadius.circular(6)), child: Text(ticket['status']!, style: const TextStyle(fontSize: 10, color: AppColors.success))),
                  ]),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
