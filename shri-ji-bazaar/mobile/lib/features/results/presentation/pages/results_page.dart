import 'package:flutter/material.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';

class ResultsPage extends StatelessWidget {
  const ResultsPage({super.key});

  static const _placeholderResults = [
    {'game': 'Lucky 7', 'round': 'Round 12', 'time': 'Today, 9:00 PM', 'number': '7', 'color': 'green'},
    {'game': 'Golden Wheel', 'round': 'Round 8', 'time': 'Today, 6:00 PM', 'number': '3', 'color': 'red'},
    {'game': 'Diamond Rush', 'round': 'Round 5', 'time': 'Today, 3:00 PM', 'number': '9', 'color': 'violet'},
    {'game': 'Lucky 7', 'round': 'Round 11', 'time': 'Yesterday, 9:00 PM', 'number': '2', 'color': 'green'},
    {'game': 'Mega Draw', 'round': 'Round 3', 'time': 'Yesterday, 6:00 PM', 'number': '5', 'color': 'red'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Results')),
      body: SafeArea(
        child: ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: _placeholderResults.length,
          itemBuilder: (context, index) {
            final result = _placeholderResults[index];
            final resultColor = _getResultColor(result['color'] as String);
            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: ListTile(
                contentPadding: const EdgeInsets.all(16),
                title: Text(result['game'] as String, style: AppTextStyles.cardTitle),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 4),
                    Text(result['round'] as String, style: AppTextStyles.bodySmall),
                    const SizedBox(height: 4),
                    Text(result['time'] as String, style: AppTextStyles.caption),
                  ],
                ),
                trailing: Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: resultColor.withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(result['number'] as String, style: AppTextStyles.resultNumber.copyWith(color: resultColor, fontSize: 22)),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Color _getResultColor(String color) {
    switch (color) {
      case 'green':
        return const Color(0xFF25C85A);
      case 'red':
        return const Color(0xFFE53935);
      case 'violet':
        return const Color(0xFF9C27B0);
      default:
        return const Color(0xFFD89B18);
    }
  }
}
