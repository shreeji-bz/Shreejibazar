import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shri_ji_bazaar/core/theme/app_colors.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import '../controllers/result_controller.dart';
import '../../domain/entities/result_entity.dart';

class ChartPage extends StatefulWidget {
  const ChartPage({super.key});

  @override
  State<ChartPage> createState() => _ChartPageState();
}

class _ChartPageState extends State<ChartPage> {
  DateTime _selectedDate = DateTime.now();

  static const _markets = ['DELH', 'SHRE', 'FARI', 'GHAZ', 'GALI', 'DESA', 'NEPA', 'NEPA'];

  static const _marketColors = {
    'DELH': Color(0xFFE8D5F5),
    'SHRE': Color(0xFFD4E8D0),
    'FARI': Color(0xFFF5E6D3),
    'GHAZ': Color(0xFFD4E8E8),
    'GALI': Color(0xFFE8F5D4),
    'DESA': Color(0xFFF5D4D4),
    'NEPA': Color(0xFFF5F0D4),
  };

  static const _textColors = {
    'DELH': Color(0xFF8B5A9E),
    'SHRE': Color(0xFF4A7C4F),
    'FARI': Color(0xFFB87A3D),
    'GHAZ': Color(0xFF4A7C8C),
    'GALI': Color(0xFF6B8E3A),
    'DESA': Color(0xFF8C4A4A),
    'NEPA': Color(0xFF8C7A3D),
  };

  String _gameNameToMarket(String gameName) {
    final upper = gameName.toUpperCase();
    if (upper.contains('DELHI') || upper.contains('DELH')) return 'DELH';
    if (upper.contains('SHREE') || upper.contains('SHRE')) return 'SHRE';
    if (upper.contains('FARID') || upper.contains('FARI')) return 'FARI';
    if (upper.contains('GHAZI') || upper.contains('GHAZ')) return 'GHAZ';
    if (upper.contains('GALI')) return 'GALI';
    if (upper.contains('DESA') || upper.contains('DESH')) return 'DESA';
    if (upper.contains('NEPA')) return 'NEPA';
    return upper;
  }

  @override
  void initState() {
    super.initState();
    _loadResults();
  }

  Future<void> _loadResults() async {
    final controller = Provider.of<ResultController>(context, listen: false);
    await controller.loadResults();
  }

  String _getMonthName(DateTime date) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[date.month - 1];
  }

  Future<void> _selectMonth(BuildContext context) async {
    final now = DateTime.now();
    final initialDate = DateTime(_selectedDate.year, _selectedDate.month);
    final picked = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: DateTime(2020),
      lastDate: now,
      helpText: 'Select Month',
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.dark(
              primary: AppColors.gold,
              surface: AppColors.card,
              onSurface: AppColors.textPrimary,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null && mounted) {
      setState(() {
        _selectedDate = DateTime(picked.year, picked.month);
      });
    }
  }

  Map<int, Map<String, String>> _buildChartData(List<ResultEntity> results) {
    final data = <int, Map<String, String>>{};
    final monthStart = DateTime(_selectedDate.year, _selectedDate.month, 1);
    final monthEnd = DateTime(_selectedDate.year, _selectedDate.month + 1, 0);

    for (final result in results) {
      final resultDate = result.resultTime;
      if (resultDate.isBefore(monthStart) || resultDate.isAfter(monthEnd)) continue;

      final day = resultDate.day;
      final market = _gameNameToMarket(result.gameName);

      if (!data.containsKey(day)) {
        data[day] = {};
      }

      // Keep the last result for each market on each day
      data[day]![market] = result.result;
    }

    return data;
  }

  @override
  Widget build(BuildContext context) {
    final daysInMonth = DateTime(_selectedDate.year, _selectedDate.month + 1, 0).day;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: AppColors.card,
              border: const Border(bottom: BorderSide(color: AppColors.border)),
            ),
            child: Row(
              children: [
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.arrow_back_rounded, color: AppColors.textPrimary),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Chart',
                    style: AppTextStyles.heading.copyWith(fontSize: 22),
                  ),
                ),
              ],
            ),
          ),

          // Month/Year selector with search
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.card,
              border: const Border(bottom: BorderSide(color: AppColors.border)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () => _selectMonth(context),
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        border: Border.all(color: AppColors.border),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          Text(_getMonthName(_selectedDate), style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600)),
                          const Icon(Icons.arrow_drop_down_rounded, color: AppColors.textSecondary),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      border: Border.all(color: AppColors.border),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        Text('${_selectedDate.year}', style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600)),
                        const Icon(Icons.arrow_drop_down_rounded, color: AppColors.textSecondary),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: AppColors.cardSecondary,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: IconButton(
                    onPressed: _loadResults,
                    icon: const Icon(Icons.search_rounded, color: AppColors.textPrimary, size: 22),
                  ),
                ),
              ],
            ),
          ),

          // Chart title
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Text(
              'Chart for ${_getMonthName(_selectedDate)} ${_selectedDate.year}',
              style: AppTextStyles.sectionHeading,
            ),
          ),

          // Chart table
          Expanded(
            child: Consumer<ResultController>(
              builder: (context, controller, _) {
                final chartData = _buildChartData(controller.results);

                return SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Column(
                    children: [
                      // Header row
                      Container(
                        decoration: const BoxDecoration(
                          border: Border(bottom: BorderSide(color: AppColors.border, width: 1.5)),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 40,
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              alignment: Alignment.center,
                              child: Text('Date', style: AppTextStyles.caption.copyWith(fontWeight: FontWeight.w700, fontSize: 11), textAlign: TextAlign.center),
                            ),
                            ..._markets.map((market) {
                              return Expanded(
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                  alignment: Alignment.center,
                                  child: Text(market, style: AppTextStyles.caption.copyWith(fontWeight: FontWeight.w700, fontSize: 10), textAlign: TextAlign.center),
                                ),
                              );
                            }).toList(),
                          ],
                        ),
                      ),

                      // Data rows
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: daysInMonth,
                        itemBuilder: (context, index) {
                          final day = index + 1;
                          final dayData = chartData[day] ?? {};

                          return Container(
                            decoration: BoxDecoration(
                              border: Border(bottom: BorderSide(color: AppColors.border.withValues(alpha: 0.3), width: 0.5)),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 40,
                                  padding: const EdgeInsets.symmetric(vertical: 8),
                                  alignment: Alignment.center,
                                  decoration: const BoxDecoration(
                                    border: Border(right: BorderSide(color: AppColors.border, width: 1)),
                                  ),
                                  child: Text('$day', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: AppColors.textPrimary), textAlign: TextAlign.center),
                                ),
                                ..._markets.map((market) {
                                  final value = dayData[market];
                                  final bgColor = value != null ? _marketColors[market] : Colors.transparent;
                                  final textColor = value != null ? _textColors[market] : AppColors.textSecondary;

                                  return Expanded(
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(vertical: 8),
                                      alignment: Alignment.center,
                                      decoration: BoxDecoration(
                                        border: Border(right: BorderSide(color: AppColors.border.withValues(alpha: 0.3), width: 0.5)),
                                        color: bgColor,
                                      ),
                                      child: Text(value ?? '--', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: textColor), textAlign: TextAlign.center),
                                    ),
                                  );
                                }).toList(),
                              ],
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
