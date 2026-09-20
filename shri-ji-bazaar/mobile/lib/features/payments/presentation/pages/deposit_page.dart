import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
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
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'Amount',
              hintText: 'Enter deposit amount',
              prefixIcon: Icon(Icons.attach_money_rounded),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) return 'Please enter amount';
              final amount = double.tryParse(value);
              if (amount == null || amount <= 0) return 'Enter a valid amount';
              if (amount < 50) return 'Minimum deposit is \$50';
              return null;
            },
          ),
          const SizedBox(height: 24),
          Text('Payment Method', style: AppTextStyles.sectionHeading),
          const SizedBox(height: 12),
          ...['UPI', 'Bank Transfer', 'Credit Card', 'Debit Card'].map((method) {
            final isSelected = _selectedMethod == method;
            return GestureDetector(
              onTap: () => setState(() => _selectedMethod = method),
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
                    Expanded(child: Text(method, style: AppTextStyles.body)),
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
                          final success = await paymentController.requestDeposit(
                            amount: double.parse(_amountController.text.trim()),
                            method: _selectedMethod,
                          );
                          if (success && context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Deposit request submitted!'), backgroundColor: Color(0xFF25C85A)),
                            );
                            _amountController.clear();
                          }
                        }
                      },
                      child: isLoading
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Text('Deposit', style: TextStyle(fontSize: 16)),
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
      case 'Bank Transfer':
        return Icons.account_balance_rounded;
      case 'Credit Card':
        return Icons.credit_card_rounded;
      case 'Debit Card':
        return Icons.credit_score_rounded;
      default:
        return Icons.payment_rounded;
    }
  }
}
