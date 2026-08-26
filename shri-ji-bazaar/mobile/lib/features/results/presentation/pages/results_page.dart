import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/constants/app_strings.dart';
import '../../../shared/widgets/custom_text_field.dart';

class ResultsPage extends StatefulWidget {
  const ResultsPage({super.key});

  @override
  State<ResultsPage> createState() => _ResultsPageState();
}

class _ResultsPageState extends State<ResultsPage> with SingleTickerStateMixin {
  late TabController _tabController;
  final _searchController = TextEditingController();
  final List<String> _tabs = ['ALL GAMES', 'MY PLAYS'];

  final List<Map<String, String>> _results = [
    {'game': 'Ghaziabad', 'result': '428', 'date': 'Today 04:00 PM'},
    {'game': 'Gali', 'result': '739', 'date': 'Today 04:15 PM'},
    {'game': 'Disawar', 'result': '156', 'date': 'Today 03:00 PM'},
    {'game': 'Faridabad', 'result': '890', 'date': 'Yesterday 04:30 PM'},
    {'game': 'Delhi Bazaar', 'result': '247', 'date': 'Yesterday 04:00 PM'},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Text('Results', style: AppTextStyles.sectionHeading),
                  const Spacer(),
                  Icon(Icons.search, color: AppColors.textMuted),
                ],
              ),
            ),
            TabBar(
              controller: _tabController,
              tabs: _tabs.map((t) => Tab(child: Text(t, style: const TextStyle(fontSize: 12)))).toList(),
              labelColor: AppColors.goldBright,
              unselectedLabelColor: AppColors.textMuted,
              indicatorColor: AppColors.gold,
            ),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildResultsList(_results),
                  _buildResultsList(_results.sublist(0, 2)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResultsList(List<Map<String, String>> results) {
    if (results.isEmpty) {
      return const Center(child: Text('No results yet', style: TextStyle(color: AppColors.textMuted)));
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: results.length,
      itemBuilder: (context, index) {
        final result = results[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: AppColors.cardGradient,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.border, width: 0.5),
          ),
          child: Row(
            children: [
              Container(
                width: 48, height: 48,
                decoration: BoxDecoration(shape: BoxShape.circle, color: AppColors.gold.withOpacity(0.15)),
                child: Icon(Icons.casino, color: AppColors.goldBright, size: 24),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(result['game']!, style: AppTextStyles.cardTitle),
                    Text(result['date']!, style: AppTextStyles.caption),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(gradient: AppColors.goldGradient, borderRadius: BorderRadius.circular(10)),
                child: Text(result['result']!, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary, letterSpacing: 3)),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }
}
