import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import '../controllers/payment_controller.dart';

class WithdrawPage extends StatelessWidget {
  const WithdrawPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Withdraw')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 16),
              const _WithdrawForm(),
            ],
          ),
        ),
      ),
    );
  }
}

class _WithdrawForm extends StatefulWidget {
  const _WithdrawForm();

  @override
  State<_WithdrawForm> createState() => _WithdrawFormState();
}

class _WithdrawFormState extends State<_WithdrawForm> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _accountController = TextEditingController();
  final _ifscController = TextEditingController();
  final _holderController = TextEditingController();

  @override
  void dispose() {
    _amountController.dispose();
    _accountController.dispose();
    _ifscController.dispose();
    _holderController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Consumer<PaymentController>(
            builder: (context, paymentController, _) {
              final balance = paymentController.availableBalance;
              return Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF120C05),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Available Balance', style: AppTextStyles.bodySmall),
                    Text('\$${balance.toStringAsFixed(2)}', style: AppTextStyles.points.copyWith(fontSize: 16)),
                  ],
                ),
              );
            },
          ),
          const SizedBox(height: 20),
          TextFormField(
            controller: _amountController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'Withdrawal Amount',
              hintText: 'Enter amount to withdraw',
              prefixIcon: Icon(Icons.attach_money_rounded),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) return 'Please enter amount';
              final amount = double.tryParse(value);
              if (amount == null || amount <= 0) return 'Enter a valid amount';
              if (amount < 100) return 'Minimum withdrawal is \$100';
              return null;
            },
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _accountController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'Account Number',
              hintText: 'Enter bank account number',
              prefixIcon: Icon(Icons.account_balance_rounded),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) return 'Please enter account number';
              if (value.length < 8) return 'Enter a valid account number';
              return null;
            },
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _ifscController,
            keyboardType: TextInputType.text,
            decoration: const InputDecoration(
              labelText: 'IFSC Code',
              hintText: 'e.g. SBIN0001234',
              prefixIcon: Icon(Icons.code_rounded),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) return 'Please enter IFSC code';
              return null;
            },
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _holderController,
            keyboardType: TextInputType.name,
            decoration: const InputDecoration(
              labelText: 'Account Holder Name',
              hintText: 'Enter account holder name',
              prefixIcon: Icon(Icons.person_rounded),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) return 'Please enter account holder name';
              return null;
            },
          ),
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
                          final success = await paymentController.requestWithdrawal(
                            amount: double.parse(_amountController.text.trim()),
                            method: 'Bank Transfer',
                          );
                          if (success && context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Withdrawal request submitted!'), backgroundColor: Color(0xFF25C85A)),
                            );
                            _amountController.clear();
                            _accountController.clear();
                            _ifscController.clear();
                            _holderController.clear();
                          }
                        }
                      },
                      child: isLoading
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Text('Withdraw', style: TextStyle(fontSize: 16)),
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
}
