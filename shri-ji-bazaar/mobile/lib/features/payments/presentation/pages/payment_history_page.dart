import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import '../controllers/payment_controller.dart';

class PaymentHistoryPage extends StatelessWidget {
  const PaymentHistoryPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Payment History')),
      body: SafeArea(
        child: Consumer<PaymentController>(
          builder: (context, paymentController, _) {
            final transactions = paymentController.history;

            if (transactions.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.receipt_long_rounded, size: 64, color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.3)),
                    const SizedBox(height: 16),
                    Text('No transactions yet', style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 8),
                    Text('Your payment history will appear here.', style: Theme.of(context).textTheme.bodySmall, textAlign: TextAlign.center),
                  ],
                ),
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: transactions.length,
              itemBuilder: (context, index) {
                final tx = transactions[index];
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
                          '${isDeposit ? '+' : ''}\$${tx.amount.toStringAsFixed(2)}',
                          style: AppTextStyles.points.copyWith(
                            color: isDeposit ? const Color(0xFF25C85A) : const Color(0xFFE53935),
                            fontSize: 15,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: tx.status == 'success'
                                ? const Color(0xFF25C85A).withValues(alpha: 0.1)
                                : const Color(0xFFFFA726).withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            tx.status.toUpperCase(),
                            style: AppTextStyles.caption.copyWith(
                              color: tx.status == 'success' ? const Color(0xFF25C85A) : const Color(0xFFFFA726),
                              fontSize: 10,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);
    if (diff.inDays == 0) return 'Today';
    if (diff.inDays == 1) return 'Yesterday';
    if (diff.inDays < 7) return '${diff.inDays} days ago';
    return '${date.day}/${date.month}/${date.year}';
  }
}
