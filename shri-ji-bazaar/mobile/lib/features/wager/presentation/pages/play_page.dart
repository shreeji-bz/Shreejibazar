import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../shared/widgets/custom_button.dart';
import '../controllers/wager_controller.dart';
import '../../domain/entities/wager_entity.dart';

class PlayPage extends StatefulWidget {
  final String gameId;
  final String gameName;
  final String roundId;

  const PlayPage({super.key, required this.gameId, this.gameName = '', this.roundId = ''});

  @override
  State<PlayPage> createState() => _PlayPageState();
}

class _PlayPageState extends State<PlayPage> {
  @override
  void initState() {
    super.initState();
    final controller = Provider.of<WagerController>(context, listen: false);
    controller.setGameContext(gameId: widget.gameId, roundId: widget.roundId);
    controller.loadHistory();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        title: Text(widget.gameName.isNotEmpty ? widget.gameName : 'Play', style: AppTextStyles.heading),
        leading: IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary)),
      ),
      body: Consumer<WagerController>(
        builder: (context, controller, _) {
          if (controller.isLoading && controller.wagerHistory.isEmpty) {
            return const Center(child: CircularProgressIndicator(color: AppColors.gold));
          }
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildPlayTypeSelector(controller),
                const SizedBox(height: 16),
                _buildNumberInput(controller),
                const SizedBox(height: 16),
                _buildStakeInput(controller),
                const SizedBox(height: 24),
                if (controller.errorMessage != null)
                  Padding(padding: const EdgeInsets.only(bottom: 16), child: Text(controller.errorMessage!, style: const TextStyle(color: AppColors.error))),
                CustomButton(label: 'Place Wager', onPressed: controller.canPlaceWager ? () => _placeWager(context, controller) : null, isLoading: controller.isPlacingWager),
                const SizedBox(height: 32),
                Text('Wager History', style: AppTextStyles.heading),
                const SizedBox(height: 12),
                if (controller.wagerHistory.isEmpty)
                  const Center(child: Padding(padding: EdgeInsets.all(32), child: Text('No wagers placed yet', style: TextStyle(color: AppColors.textSecondary))))
                else
                  ...controller.wagerHistory.map((w) => _WagerTile(wager: w)),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildPlayTypeSelector(WagerController controller) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Play Type', style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        Row(
          children: ['Single', 'Jodi', 'Panel', 'Double'].map((type) {
            final selected = controller.selectedPlayType == type;
            return Expanded(
              child: Padding(
                padding: const EdgeInsets.only(right: 8),
                child: GestureDetector(
                  onTap: () => controller.setPlayType(type),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      color: selected ? AppColors.gold : AppColors.cardSecondary,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(type, textAlign: TextAlign.center, style: TextStyle(color: selected ? AppColors.textPrimary : AppColors.textSecondary, fontWeight: selected ? FontWeight.bold : FontWeight.normal)),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildNumberInput(WagerController controller) {
    final digitCount = controller.selectedPlayType == 'Single' ? 1 : controller.selectedPlayType == 'Jodi' ? 2 : controller.selectedPlayType == 'Panel' ? 3 : 4;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Enter Number ($digitCount digits)', style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        TextField(
          maxLength: digitCount,
          keyboardType: TextInputType.number,
          decoration: InputDecoration(
            hintText: 'Enter ${digitCount}-digit number',
            filled: true,
            fillColor: AppColors.cardSecondary,
            counterText: '',
          ),
          onChanged: (v) => controller.setNumber(v),
        ),
      ],
    );
  }

  Widget _buildStakeInput(WagerController controller) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text('Stake Amount', style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600)),
            const Spacer(),
            Text('Balance: ${controller.balance} pts', style: AppTextStyles.bodySmall.copyWith(color: AppColors.goldBright)),
          ],
        ),
        const SizedBox(height: 8),
        TextField(
          keyboardType: TextInputType.number,
          decoration: InputDecoration(
            hintText: 'Min 10 points',
            filled: true,
            fillColor: AppColors.cardSecondary,
            suffixText: ' pts',
          ),
          onChanged: (v) => controller.setStake(v),
        ),
        if (controller.potentialPayout > 0)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text('Potential Payout: ${controller.potentialPayout} pts', style: AppTextStyles.bodySmall.copyWith(color: AppColors.goldBright)),
          ),
      ],
    );
  }

  Future<void> _placeWager(BuildContext context, WagerController controller) async {
    final wager = await controller.placeWager();
    if (wager != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Wager placed! ${controller.potentialPayout} pts potential'), backgroundColor: AppColors.gold));
      controller.resetForm();
    }
  }
}

class _WagerTile extends StatelessWidget {
  final WagerEntity wager;
  const _WagerTile({required this.wager});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: AppColors.cardSecondary, borderRadius: BorderRadius.circular(8)),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(wager.playType, style: AppTextStyles.bodySmall.copyWith(fontWeight: FontWeight.w600, color: AppColors.goldBright)),
                Text(wager.selection, style: AppTextStyles.bodySmall),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('${wager.pointsStaked} pts', style: AppTextStyles.bodySmall),
              Text(wager.status.toUpperCase(), style: AppTextStyles.bodySmall.copyWith(color: wager.status == 'won' ? AppColors.success : wager.status == 'lost' ? AppColors.error : AppColors.textSecondary)),
            ],
          ),
        ],
      ),
    );
  }
}
