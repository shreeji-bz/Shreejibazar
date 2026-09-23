import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import 'package:shri_ji_bazaar/core/routes/route_names.dart';
import '../controllers/payment_controller.dart';

class DepositPage extends StatelessWidget {
  const DepositPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Deposit')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 16),
              const _DepositForm(),
            ],
          ),
        ),
      ),
    );
  }
}

class _DepositForm extends StatefulWidget {
  const _DepositForm();

  @override
  State<_DepositForm> createState() => _DepositFormState();
}

class _DepositFormState extends State<_DepositForm> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  String _selectedMethod = 'UPI';

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextFormField(
            controller: _amountController,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: const InputDecoration(
              labelText: 'Amount (INR)',
              hintText: 'Enter deposit amount',
              prefixIcon: Icon(Icons.currency_rupee_rounded),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) return 'Please enter amount';
              final amount = double.tryParse(value);
              if (amount == null || amount <= 0) return 'Enter a valid amount';
              if (amount < 1) return 'Minimum deposit is ₹1';
              return null;
            },
          ),
          const SizedBox(height: 24),
          Text('Payment Method', style: AppTextStyles.sectionHeading),
          const SizedBox(height: 12),
          ...['UPI', 'IMPS (IMB)', 'Bank Transfer'].map((method) {
            final isSelected = _selectedMethod == method;
            return GestureDetector(
              onTap: () {
                setState(() => _selectedMethod = method);
              },
              child: Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isSelected ? Theme.of(context).colorScheme.primary : Theme.of(context).colorScheme.primary.withValues(alpha: 0.1),
                    width: isSelected ? 2 : 1,
                  ),
                ),
                child: Row(
                  children: [
                    Icon(_methodIcon(method), color: isSelected ? Theme.of(context).colorScheme.primary : Colors.grey),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(method, style: AppTextStyles.body),
                          if (method == 'IMPS (IMB)')
                            Text('Instant bank transfer via IMB', style: AppTextStyles.caption),
                        ],
                      ),
                    ),
                    if (isSelected) Icon(Icons.check_circle_rounded, color: Theme.of(context).colorScheme.primary),
                  ],
                ),
              ),
            );
          }),
          const SizedBox(height: 32),
          Consumer<PaymentController>(
            builder: (context, paymentController, _) {
              final isLoading = paymentController.isProcessing;
              final errorMessage = paymentController.error;
              return Column(
                children: [
                  if (errorMessage != null)
                    Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE53935).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFE53935)),
                      ),
                      child: Text(errorMessage, style: AppTextStyles.body.copyWith(color: const Color(0xFFE53935))),
                    ),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: isLoading ? null : () async {
                        if (_formKey.currentState!.validate()) {
                          final amount = double.parse(_amountController.text.trim());

                          if (_selectedMethod == 'IMPS (IMB)') {
                            // Create IMB order first, then open WebView
                            final controller = Provider.of<PaymentController>(context, listen: false);
                            final result = await controller.initiateImbPayment(amount);

                            if (result == null || !mounted) return;

                            final paymentUrl = result['paymentUrl'] as String? ?? '';
                            final orderId = result['orderId'] as String? ?? '';

                            if (paymentUrl.isEmpty) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Failed to create payment order. Please try again.'),
                                  backgroundColor: Color(0xFFE53935),
                                ),
                              );
                              return;
                            }

                            final webViewResult = await context.push<bool>(RouteNames.imbPayment, extra: {
                              'paymentUrl': paymentUrl,
                              'orderId': orderId,
                              'amount': amount,
                            });

                            if (webViewResult == true && context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Deposit successful!'),
                                  backgroundColor: Color(0xFF25C85A),
                                ),
                              );
                              _amountController.clear();
                              await controller.loadHistory();
                            }
                          } else {
                            // Standard manual deposit
                            final success = await paymentController.requestDeposit(
                              amount: amount,
                              method: _selectedMethod,
                            );
                            if (success && context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Deposit request submitted!'),
                                  backgroundColor: Color(0xFF25C85A),
                                ),
                              );
                              _amountController.clear();
                            }
                          }
                        }
                      },
                      child: isLoading
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : Text(_selectedMethod == 'IMPS (IMB)' ? 'Pay Now' : 'Deposit', style: const TextStyle(fontSize: 16)),
                    ),
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  IconData _methodIcon(String method) {
    switch (method) {
      case 'UPI':
        return Icons.payment_rounded;
      case 'IMPS (IMB)':
        return Icons.account_balance_rounded;
      case 'Bank Transfer':
        return Icons.account_balance_wallet_rounded;
      default:
        return Icons.payment_rounded;
    }
  }
}
