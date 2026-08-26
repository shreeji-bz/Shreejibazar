import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/constants/app_strings.dart';
import '../../../shared/widgets/custom_button.dart';

class GameDetailsPage extends StatefulWidget {
  final String gameId;
  const GameDetailsPage({super.key, required this.gameId});

  @override
  State<GameDetailsPage> createState() => _GameDetailsPageState();
}

class _GameDetailsPageState extends State<GameDetailsPage> {
  final List<Map<String, String>> _playOptions = ['Single', 'Jodi', 'Panel', 'Double'];
  String _selectedOption = 'Single';
  final _numberController = TextEditingController();
  int _points = 100;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        title: Text('Ghaziabad', style: AppTextStyles.sectionHeading),
        leading: IconButton(onPressed: () => context.pop(), icon: const Icon(Icons.arrow_back, color: AppColors.goldBright)),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(gradient: AppColors.cardGradient, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
                child: Column(
                  children: [
                    Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                      Column(children: [const Text('Opening', style: TextStyle(fontSize: 12, color: AppColors.textMuted)), const SizedBox(height: 4), Text('04:00 PM', style: AppTextStyles.cardTitle)]),
                      Column(children: [const Text('Closing', style: TextStyle(fontSize: 12, color: AppColors.textMuted)), const SizedBox(height: 4), Text('06:00 PM', style: AppTextStyles.cardTitle)]),
                      Column(children: [const Text('Result', style: TextStyle(fontSize: 12, color: AppColors.textMuted)), const SizedBox(height: 4), Text('06:15 PM', style: AppTextStyles.cardTitle)]),
                    ]),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                      decoration: BoxDecoration(color: AppColors.success.withOpacity(0.15), borderRadius: BorderRadius.circular(8), border: Border.all(color: AppColors.success.withOpacity(0.3))),
                      child: Text('PLAYING', style: TextStyle(color: AppColors.success, fontWeight: FontWeight.w600, fontSize: 13)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              Text('Play Type', style: AppTextStyles.sectionHeading),
              const SizedBox(height: 10),
              Wrap(spacing: 8, runSpacing: 8, children: _playOptions.map((opt) => ChoiceChip(
                label: Text(opt, style: TextStyle(fontSize: 13, color: _selectedOption == opt ? AppColors.textPrimary : AppColors.textSecondary)),
                selected: _selectedOption == opt,
                onSelected: (v) => setState(() => _selectedOption = opt),
                selectedColor: AppColors.goldDark,
                backgroundColor: AppColors.cardSecondary,
                side: BorderSide(color: _selectedOption == opt ? AppColors.gold : AppColors.border),
              )).toList()),
              const SizedBox(height: 20),
              Text('Your Number', style: AppTextStyles.sectionHeading),
              const SizedBox(height: 8),
              Container(
                decoration: BoxDecoration(color: AppColors.cardSecondary, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
                child: TextField(
                  controller: _numberController,
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 18, letterSpacing: 4),
                  textAlign: TextAlign.center,
                  maxLength: 4,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(counterText: '', hintText: '0000', hintStyle: TextStyle(color: AppColors.textMuted), border: InputBorder.none, contentPadding: EdgeInsets.symmetric(vertical: 16)),
                ),
              ),
              const SizedBox(height: 20),
              Text('Points', style: AppTextStyles.sectionHeading),
              const SizedBox(height: 8),
              Row(
                children: [
                  IconButton(onPressed: () => setState(() => _points = _points > 10 ? _points - 10 : _points), icon: Icon(Icons.remove_circle_outline, color: AppColors.goldBright, size: 28)),
                  Expanded(child: Center(child: Text('$_points', style: AppTextStyles.points))),
                  IconButton(onPressed: () => setState(() => _points = _points < 1000 ? _points + 10 : _points), icon: Icon(Icons.add_circle_outline, color: AppColors.goldBright, size: 28)),
                ],
              ),
              const SizedBox(height: 30),
              Center(child: CustomButton(text: AppStrings.playNow, width: MediaQuery.of(context).size.width - 48, onPressed: _handlePlay)),
              const SizedBox(height: 16),
              Center(child: TextButton(onPressed: () {}, child: const Text('HOW TO PLAY >', style: TextStyle(color: AppColors.textMuted, fontSize: 12)))),
              const SizedBox(height: 80),
            ],
          ),
        ),
      ),
    );
  }

  void _handlePlay() {
    if (_numberController.text.length != 4) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Enter a valid 4-digit number'), backgroundColor: AppColors.error));
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Play submitted: ${_numberController.text} | $_points pts'), backgroundColor: AppColors.success));
    context.pop();
  }

  @override
  void dispose() {
    _numberController.dispose();
    super.dispose();
  }
}
