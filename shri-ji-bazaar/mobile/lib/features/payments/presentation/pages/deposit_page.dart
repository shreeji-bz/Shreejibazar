import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import 'package:shri_ji_bazaar/core/widgets/sidebar_toggle.dart';
import '../controllers/payment_controller.dart';

class DepositPage extends StatelessWidget {
  const DepositPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: const SidebarToggle(),
        title: const Text('Recharge'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 16),
              const _RechargeForm(),
            ],
          ),
        ),
      ),
    );
  }
}

const _AMOUNT_CHIPS = [50, 100, 200, 300, 500, 1000, 5000, 10000];

class _RechargeForm extends StatefulWidget {
  const _RechargeForm();

  @override
  State<_RechargeForm> createState() => _RechargeFormState();
}

class _RechargeFormState extends State<_RechargeForm> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _utrController = TextEditingController();
  int? _selectedChip;
  bool _showQr = false;

  @override
  void dispose() {
    _amountController.dispose();
    _utrController.dispose();
    super.dispose();
  }

  void _pickChip(int value) {
    setState(() {
      _selectedChip = value;
      _amountController.text = value.toString();
    });
  }

  @override
  Widget build(BuildContext context) {
    final amountText = _amountController.text.trim();
    final amount = double.tryParse(amountText);

    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // ---- Amount ----
          Text('Enter Amount (Min 20)', style: AppTextStyles.bodySmall),
          const SizedBox(height: 8),
          TextFormField(
            controller: _amountController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              hintText: 'Amount',
              border: OutlineInputBorder(),
              contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            ),
            onChanged: (v) => setState(() => _selectedChip =
                _AMOUNT_CHIPS.firstWhere((c) => c.toString() == v.trim(), orElse: () => -1)),
            validator: (value) {
              if (value == null || value.isEmpty) return 'Enter amount';
              final a = double.tryParse(value);
              if (a == null || a <= 0) return 'Enter a valid amount';
              if (a < 20) return 'Minimum recharge is ₹20';
              return null;
            },
          ),
          const SizedBox(height: 12),
          // ---- Quick amount chips (reference layout) ----
          Column(
            children: [
              for (final row in [
                _AMOUNT_CHIPS.sublist(0, 4),
                _AMOUNT_CHIPS.sublist(4),
              ])
                Row(
                  children: [
                    for (final value in row) ...[
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.all(4),
                          child: InkWell(
                            onTap: () => _pickChip(value),
                            borderRadius: BorderRadius.circular(8),
                            child: Container(
                              alignment: Alignment.center,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              decoration: BoxDecoration(
                                color: _selectedChip == value
                                    ? const Color(0xFF25C85A)
                                    : const Color(0xFF1A1005),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: _selectedChip == value
                                      ? const Color(0xFF25C85A)
                                      : const Color(0xFF2A1F10),
                                ),
                              ),
                              child: Text(
                                '₹$value',
                                style: TextStyle(
                                  color: _selectedChip == value ? Colors.white : Colors.white70,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
            ],
          ),
          const SizedBox(height: 16),
          // ---- UPI QR (dummy) ----
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF120C05),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF2A1F10)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF25C85A),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text('UPI',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
                    ),
                    const SizedBox(width: 10),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('SHREEJI BAZAAR',
                              style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                          Text('Scan & pay instantly',
                              style: TextStyle(color: Colors.white54, fontSize: 12)),
                        ],
                      ),
                    ),
                    const Text('SECURE',
                        style: TextStyle(color: Color(0xFF25C85A), fontSize: 11, fontWeight: FontWeight.w700)),
                  ],
                ),
                const SizedBox(height: 12),
                Center(
                  child: Container(
                    // Dummy UPI QR placeholder — real merchant QR will be
                    // generated by the payment provider later.
                    width: 160,
                    height: 160,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.qr_code_scanner, size: 90, color: Colors.black),
                  ),
                ),
                const SizedBox(height: 8),
                Center(
                  child: Text(
                    'UPI ID: shrijibazaar@upi',
                    style: TextStyle(color: Colors.white54, fontSize: 12),
                  ),
                ),
                if (amount != null && amount > 0)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Align(
                      alignment: Alignment.centerRight,
                      child: Text(
                        'Amount: ₹${amount.toStringAsFixed(2)}',
                        style: const TextStyle(color: Color(0xFF25C85A), fontWeight: FontWeight.w700),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // ---- UTR confirmation after paying ----
          Text('UTR / Transaction ID (optional, after paying)', style: AppTextStyles.bodySmall),
          const SizedBox(height: 8),
          TextFormField(
            controller: _utrController,
            keyboardType: TextInputType.number,
            maxLength: 12,
            decoration: const InputDecoration(
              hintText: 'Enter 12-digit UTR',
              border: OutlineInputBorder(),
              counterText: '',
            ),
          ),
          const SizedBox(height: 20),
          // ---- Actions ----
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
                      onPressed:
                          (amount == null || amount <= 0 || isLoading) ? null : () async {
                        if (_formKey.currentState!.validate()) {
                          final success = await paymentController.requestDeposit(
                            amount: amount,
                            method: 'upi',
                            utrNumber: _utrController.text.trim().isEmpty ? null : _utrController.text.trim(),
                            screenshotUrl: null,
                          );
                          if (success && context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                  content: Text('Recharge submitted! Points will be added after verification.'),
                                  backgroundColor: Color(0xFF25C85A)),
                            );
                            _amountController.clear();
                            _utrController.clear();
                            setState(() {
                              _selectedChip = null;
                              _showQr = false;
                            });
                          }
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF25C85A),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: isLoading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Text('Proceed To Pay', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: () {
                      // Watch Deposit Video — plays the URL set in admin (app.video_url).
                      _showQr = true;
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Deposit video coming soon — see support chat for help.')),
                      );
                    },
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF25C85A),
                      side: const BorderSide(color: Color(0xFF25C85A)),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    icon: const Icon(Icons.play_arrow_rounded),
                    label: const Text('Watch Deposit Video', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
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
