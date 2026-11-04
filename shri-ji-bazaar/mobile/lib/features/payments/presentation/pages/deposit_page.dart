import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:provider/provider.dart';
import 'package:shri_ji_bazaar/core/routes/route_names.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import 'package:shri_ji_bazaar/core/widgets/sidebar_toggle.dart';
import '../controllers/payment_controller.dart';

/// Merchant UPI ID. Replace with the real receiving VPA before go-live.
const _UPI_VPA = 'shrijibazaar@upi';
const _UPI_PAYER_NAME = 'SHREEJI BAZAAR';

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

/// Builds the standard UPI "collect request" deep link (pa/pn/am/tn/mc) that
/// Paytm / GPay / PhonePe / BHIM all understand when opened or scanned.
String _upiLink(double amount, {String? txnNote}) {
  final am = amount.toStringAsFixed(2);
  final pn = Uri.encodeComponent(_UPI_PAYER_NAME);
  final tn = Uri.encodeComponent(txnNote ?? 'Deposit $am');
  return 'upi://pay?pa=$_UPI_VPA&pn=$pn&am=$am&tn=$tn&mc=INR';
}

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

  /// "Pay with UPI App" — opens the user's own UPI app (Paytm/GPay/PhonePe)
  /// with the exact amount pre-filled, exactly like normal payment apps.
  Future<void> _payWithUpiApp(BuildContext context, double amount) async {
    final link = _upiLink(amount);
    try {
      await launchUrl(Uri.parse(link), mode: LaunchMode.externalApplication);
    } catch (_) {
      // No UPI app registered for upi:// — tell them to scan the QR instead.
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('No UPI app found. Scan the QR with your UPI app to pay.'),
        ));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final amountText = _amountController.text.trim();
    final amount = double.tryParse(amountText);
    final valid = amount != null && amount > 0;

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
            onChanged: (v) =>
                setState(() => _selectedChip = _AMOUNT_CHIPS
                    .firstWhere((c) => c.toString() == v.trim(), orElse: () => -1)),
            validator: (value) {
              if (value == null || value.isEmpty) return 'Enter amount';
              final a = double.tryParse(value);
              if (a == null || a <= 0) return 'Enter a valid amount';
              if (a < 20) return 'Minimum recharge is ₹20';
              return null;
            },
          ),
          const SizedBox(height: 12),
          // ---- Quick amount chips ----
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
                                  color: _selectedChip == value
                                      ? Colors.white
                                      : Colors.white70,
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
          // ---- UPI card: real scannable QR (amount pre-filled) ----
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
                          style: TextStyle(
                              color: Colors.white, fontWeight: FontWeight.w800)),
                    ),
                    const SizedBox(width: 10),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(_UPI_PAYER_NAME,
                              style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w700)),
                          Text('Scan & pay instantly',
                              style: TextStyle(color: Colors.white54, fontSize: 12)),
                        ],
                      ),
                    ),
                    const Text('SECURE',
                        style: TextStyle(
                            color: Color(0xFF25C85A),
                            fontSize: 11,
                            fontWeight: FontWeight.w700)),
                  ],
                ),
                const SizedBox(height: 12),
                Center(
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    // Real, scannable UPI QR. Encodes the upi:// collect link
                    // with the chosen amount so the recipient's bank app
                    // pre-fills the payment on scan.
                    child: valid
                        ? QrImageView(
                            data: _upiLink(amount),
                            version: QrVersions.auto,
                            size: 150,
                            backgroundColor: Colors.white,
                            dataModuleStyle:
                                const QrDataModuleStyle(color: Colors.black),
                          )
                        : SizedBox(
                            width: 150,
                            height: 150,
                            child: Center(
                              child: Text('₹\n—\n\nenter amount',
                                  style: const TextStyle(
                                      color: Colors.grey, fontSize: 13)),
                            ),
                          ),
                  ),
                ),
                const SizedBox(height: 8),
                Center(
                  child: Text('UPI ID: $_UPI_VPA',
                      style: TextStyle(color: Colors.white54, fontSize: 12)),
                ),
                if (valid)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Align(
                      alignment: Alignment.centerRight,
                      child: Text(
                        'Amount: ₹${amount.toStringAsFixed(2)}',
                        style: const TextStyle(
                            color: Color(0xFF25C85A),
                            fontWeight: FontWeight.w700),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // ---- UTR confirmation after paying ----
          Text('UTR / Transaction ID (after you pay)', style: AppTextStyles.bodySmall),
          const SizedBox(height: 8),
          TextFormField(
            controller: _utrController,
            keyboardType: TextInputType.number,
            maxLength: 12,
            decoration: const InputDecoration(
              hintText: 'Enter 12-digit UTR from your UPI app',
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
                        color:
                            const Color(0xFFE53935).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFE53935)),
                      ),
                      child: Text(
                          errorMessage,
                          style: AppTextStyles.body.copyWith(
                              color: const Color(0xFFE53935))),
                    ),
                  // Primary: Live Payment via the IMB gateway (in-app WebView,
                  // real charge through the live gateway key).
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton.icon(
                      onPressed: (valid && !isLoading)
                          ? () async {
                              if (!_formKey.currentState!.validate()) return;
                              final res =
                                  await paymentController.initiateImbPayment(amount);
                              if (res == null) return; // error already surfaced
                              if (!context.mounted) return;
                              context.push(RouteNames.imbPayment,
                                  extra: {
                                    'paymentUrl': res['paymentUrl'],
                                    'orderId': res['orderId'],
                                    'amount': amount,
                                  });
                            }
                          : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF25C85A),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10)),
                      ),
                      icon: const Icon(Icons.bolt_rounded, color: Colors.white),
                      label: const Text('Live Payment',
                          style: TextStyle(
                              fontSize: 16, fontWeight: FontWeight.w700)),
                    ),
                  ),
                  const SizedBox(height: 10),
                  // Fallback: open the user's own UPI app with the amount ready.
                  ElevatedButton.icon(
                    onPressed:
                        (valid && !isLoading) ? () => _payWithUpiApp(context, amount) : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFE5A000),
                      minimumSize: const Size.fromHeight(52),
                      shape:
                          RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10)),
                    ),
                    icon: const Icon(Icons.qr_code_scanner_rounded),
                    label: const Text('Pay with UPI App',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  ),
                  const SizedBox(height: 10),
                  // Confirm the paid amount -> credits the wallet.
                  ElevatedButton(
                    onPressed: (valid && !isLoading)
                        ? () async {
                            if (_formKey.currentState!.validate()) {
                              final success = await paymentController
                                  .requestDeposit(
                                amount: amount,
                                method: 'upi',
                                utrNumber: _utrController.text.trim().isEmpty
                                    ? null
                                    : _utrController.text.trim(),
                              );
                              if (success && context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                      content: Text(
                                          'Amount added to your wallet!'),
                                      backgroundColor: Color(0xFF25C85A)),
                                );
                                _amountController.clear();
                                _utrController.clear();
                                setState(() => _selectedChip = null);
                              }
                            }
                          }
                        : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFE5A000),
                      minimumSize: const Size.fromHeight(50),
                      shape:
                          RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10)),
                    ),
                    child: isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: Colors.white))
                        : const Text('Add to Wallet',
                            style: TextStyle(
                                fontSize: 15, fontWeight: FontWeight.w700)),
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
