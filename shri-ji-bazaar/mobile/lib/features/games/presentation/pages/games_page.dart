import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/constants/app_strings.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/components/game_card.dart';

class GamesPage extends StatefulWidget {
  const GamesPage({super.key});

  @override
  State<GamesPage> createState() => _GamesPageState();
}

class _GamesPageState extends State<GamesPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final List<String> _tabs = ['ALL', 'TODAY', 'POPULAR', 'FAVOURITE'];
  final List<Map<String, String>> _games = [
    {'name': 'Ghaziabad', 'status': 'Open', 'time': '04:00 PM'},
    {'name': 'Gali', 'status': 'Open', 'time': '04:15 PM'},
    {'name': 'Disawar', 'status': 'Open', 'time': '03:00 PM'},
    {'name': 'Faridabad', 'status': 'Closed', 'time': '04:30 PM'},
    {'name': 'Delhi Bazaar', 'status': 'Open', 'time': '04:00 PM'},
    {'name': 'Mumbai Bazaar', 'status': 'Upcoming', 'time': '05:00 PM'},
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
                  Text('Games', style: AppTextStyles.sectionHeading),
                  const Spacer(),
                  CustomButton(text: 'All', isOutlined: true, onPressed: () {}, width: 80),
                ],
              ),
            ),
            TabBar(
              controller: _tabController,
              tabs: _tabs.map((t) => Tab(child: Text(t, style: const TextStyle(fontSize: 12)))).toList(),
              labelColor: AppColors.goldBright,
              unselectedLabelColor: AppColors.textMuted,
              indicatorColor: AppColors.gold,
              dividerColor: Colors.transparent,
              labelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
            ),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: _tabs.map((tab) {
                  final games = tab == 'POPULAR' ? _games.where((g) => g['status'] == 'Open').toList() : _games;
                  return GridView.builder(
                    padding: const EdgeInsets.all(16),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, childAspectRatio: 1.4, crossAxisSpacing: 12, mainAxisSpacing: 12),
                    itemCount: games.length,
                    itemBuilder: (context, index) => GameCard(
                      name: games[index]['name']!,
                      time: games[index]['time'],
                      status: games[index]['status']!,
                      onTap: () {},
                    ),
                  );
                }).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
