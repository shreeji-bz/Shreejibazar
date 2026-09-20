import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import 'package:shri_ji_bazaar/core/routes/route_names.dart';
import '../controllers/payment_controller.dart';

class WalletPage extends StatelessWidget {
  const WalletPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Wallet'),
        actions: [
          TextButton(onPressed: () => context.push(RouteNames.paymentHistory), child: const Text('History')),
        ],
      ),
      body: SafeArea(
        child: Consumer<PaymentController>(
          builder: (context, paymentController, _) {
            final balance = paymentController.availableBalance;

            return SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
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
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Wallet Balance', style: AppTextStyles.body.copyWith(color: Colors.white70)),
                        const SizedBox(height: 8),
                        Text('\$${balance.toStringAsFixed(2)}', style: AppTextStyles.display.copyWith(color: Colors.white)),
                        const SizedBox(height: 20),
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton(
                                onPressed: () => context.push(RouteNames.deposit),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.white,
                                foregroundColor: Theme.of(context).colorScheme.primary,
                                textStyle: const TextStyle(color: Colors.black),
                                iconColor: Theme.of(context).colorScheme.primary,
                                shadowColor: Colors.transparent,
                                surfaceTintColor: Colors.transparent,
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                ),
                                child: const Text('Deposit'),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: OutlinedButton(
                                onPressed: () => context.push(RouteNames.withdraw),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: Colors.white,
                                  side: const BorderSide(color: Colors.white54),
                                  textStyle: const TextStyle(color: Colors.white),
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                ),
                                child: const Text('Withdraw'),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 28),
                  Text('Recent Transactions', style: AppTextStyles.sectionHeading),
                  const SizedBox(height: 12),
                  if (paymentController.history.isEmpty)
                    Center(
                      child: Padding(
                        padding: const EdgeInsets.all(32),
                        child: Text('No transactions yet', style: AppTextStyles.body),
                      ),
                    )
                  else
                    ...List.generate(paymentController.history.length, (index) {
                      final tx = paymentController.history[index];
                      final isDeposit = tx.type == 'deposit';
                      return Card(
                        margin: const EdgeInsets.only(bottom: 10),
                        child: ListTile(
                          contentPadding: const EdgeInsets.all(14),
                          leading: Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: isDeposit ? const Color(0xFF25C85A).withValues(alpha: 0.15) : const Color(0xFFE53935).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(
                              isDeposit ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded,
                              color: isDeposit ? const Color(0xFF25C85A) : const Color(0xFFE53935),
                            ),
                          ),
                          title: Text(isDeposit ? 'Deposit' : 'Withdrawal', style: AppTextStyles.cardTitle),
                          subtitle: Text('${tx.method} - ${_formatDate(tx.createdAt)}', style: AppTextStyles.bodySmall),
                          trailing: Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                '${isDeposit ? '+' : '-'}\$${tx.amount.toStringAsFixed(2)}',
                                style: AppTextStyles.points.copyWith(
                                  color: isDeposit ? const Color(0xFF25C85A) : const Color(0xFFE53935),
                                  fontSize: 15,
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: tx.status == 'completed' || tx.status == 'success'
                                      ? const Color(0xFF25C85A).withValues(alpha: 0.1)
                                      : const Color(0xFFFFA726).withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  tx.status.toUpperCase(),
                                  style: AppTextStyles.caption.copyWith(
                                    color: tx.status == 'completed' || tx.status == 'success'
                                        ? const Color(0xFF25C85A)
                                        : const Color(0xFFFFA726),
                                    fontSize: 10,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);
    if (diff.inDays == 0) return 'Today, ${_formatTime(date)}';
    if (diff.inDays == 1) return 'Yesterday';
    if (diff.inDays < 7) return '${diff.inDays} days ago';
    return '${date.day}/${date.month}/${date.year}';
  }

  String _formatTime(DateTime date) {
    final h = date.hour > 12 ? date.hour - 12 : date.hour;
    final m = date.minute.toString().padLeft(2, '0');
    final period = date.hour >= 12 ? 'PM' : 'AM';
    return '$h:$m $period';
  }
}
