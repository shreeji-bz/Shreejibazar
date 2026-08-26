import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/constants/app_strings.dart';

class MyActivityPage extends StatefulWidget {
  const MyActivityPage({super.key});

  @override
  State<MyActivityPage> createState() => _MyActivityPageState();
}

class _MyActivityPageState extends State<MyActivityPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final List<String> _tabs = ['PENDING', 'WON', 'LOST'];

  final List<Map<String, String>> _plays = [
    {'game': 'Ghaziabad', 'type': 'Single', 'number': '428', 'points': '100', 'status': 'Pending', 'time': 'Today 04:00 PM'},
    {'game': 'Gali', 'type': 'Jodi', 'number': '73', 'points': '200', 'status': 'Won', 'time': 'Yesterday 04:15 PM'},
    {'game': 'Disawar', 'type': 'Single', 'number': '100', 'points': '50', 'status': 'Lost', 'time': 'Yesterday 03:00 PM'},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  IconButton(onPressed: () {}, icon: const Icon(Icons.menu, color: AppColors.textSecondary)),
                  Expanded(child: Center(child: Text(AppStrings.myActivity, style: AppTextStyles.sectionHeading))),
                  IconButton(onPressed: () {}, icon: const Icon(Icons.filter_list_outlined, color: AppColors.goldBright)),
                ],
              ),
            ),
            const SizedBox(height: 12),
            _buildTabs(),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: _tabs.map((tab) {
                  final filtered = _plays.where((play) => play['status']!.toLowerCase() == tab.toLowerCase()).toList();
                  return _buildPlaysList(filtered);
                }).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTabs() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: AppColors.cardSecondary,
        borderRadius: BorderRadius.circular(12),
      ),
      child: TabBar(
        controller: _tabController,
        indicator: BoxDecoration(
          gradient: AppColors.goldGradient,
          borderRadius: BorderRadius.circular(12),
        ),
        labelColor: AppColors.textPrimary,
        unselectedLabelColor: AppColors.textMuted,
        labelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
        dividerColor: Colors.transparent,
        tabs: _tabs.map((t) => Tab(text: t)).toList(),
      ),
    );
  }

  Widget _buildPlaysList(List<Map<String, String>> plays) {
    if (plays.isEmpty) {
      return const Center(child: Text('No plays yet', style: TextStyle(color: AppColors.textMuted)));
    }
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      itemCount: plays.length,
      itemBuilder: (context, index) {
        final play = plays[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardSecondary,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border, width: 0.5),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(play['game']!, style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: _statusColor(play['status']!).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(play['status']!, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: _statusColor(play['status']!))),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _PlayDetail(label: 'Type', value: play['type']!),
                  _PlayDetail(label: 'Number', value: play['number']!),
                  _PlayDetail(label: 'Points', value: play['points']!),
                ],
              ),
              const SizedBox(height: 8),
              Text(play['time']!, style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
            ],
          ),
        );
      },
    );
  }

  Color _statusColor(String status) {
    switch (status.toLowerCase()) {
      case 'won': return AppColors.success;
      case 'lost': return AppColors.error;
      default: return AppColors.warning;
    }
  }
}

class _PlayDetail extends StatelessWidget {
  final String label;
  final String value;

  const _PlayDetail({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
        const SizedBox(height: 2),
        Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
      ],
    );
  }
}
