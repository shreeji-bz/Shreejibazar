import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import 'package:shri_ji_bazaar/core/widgets/sidebar_toggle.dart';
import '../controllers/payment_controller.dart';

class WithdrawPage extends StatelessWidget {
  const WithdrawPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: const SidebarToggle(),
        title: const Text('Withdraw'),
      ),
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

/// Payment methods offered at withdraw (UI labels -> API method keys).
const _METHODS = <Map<String, dynamic>>[
  {'label': 'QR Code', 'method': 'qr', 'icon': Icons.qr_code_rounded},
  {'label': 'Bank', 'method': 'bank_transfer', 'icon': Icons.account_balance_rounded},
  {'label': 'Paytm', 'method': 'paytm', 'icon': Icons.credit_card_rounded},
  {'label': 'Google Pay', 'method': 'gpay', 'icon': Icons.payments_rounded},
  {'label': 'PhonePe', 'method': 'phonepe', 'icon': Icons.smartphone_rounded},
];

class _WithdrawFormState extends State<_WithdrawForm> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _accountController = TextEditingController();
  final _ifscController = TextEditingController();
  final _holderController = TextEditingController();
  final _vpaController = TextEditingController();
  String _selectedMethod = 'qr';

  /// Withdrawals only accepted 6:00 AM -> 1:00 PM local time (backend mirrors).
  static bool get inWindow {
    final h = DateTime.now().hour;
    return h >= 6 && h < 13;
  }

  /// Configurable minimum (server settings), falling back to the app default
  /// so the form label stays correct before the config has loaded.
  double _minFrom(BuildContext context) {
    final min = context.read<PaymentController>().minWithdrawal;
    return min > 0 ? min.toDouble() : 480;
  }

  @override
  void initState() {
    super.initState();
    // Pull the server-driven withdrawal rules (min amount, messages, ...)
    // and the current reservation so the form validates correctly.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final controller = context.read<PaymentController>();
      controller.loadWithdrawalConfig();
      controller.loadBalance();
    });
  }

  @override
  void dispose() {
    _amountController.dispose();
    _accountController.dispose();
    _ifscController.dispose();
    _holderController.dispose();
    _vpaController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final windowOpen = inWindow;
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Consumer<PaymentController>(
            builder: (context, paymentController, _) {
              final balance = paymentController.availableBalance;
              final pending = paymentController.pendingWithdrawal;
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
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text('\$${balance.toStringAsFixed(2)}', style: AppTextStyles.points.copyWith(fontSize: 16)),
                        if (pending > 0)
                          Text('Reserved: \$${pending.toStringAsFixed(2)}',
                              style: const TextStyle(color: Color(0xFFFFA726), fontSize: 11)),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _amountController,
            keyboardType: TextInputType.number,
            enabled: windowOpen,
            decoration: InputDecoration(
              labelText: 'Enter Amount (Min \$${_minFrom(context)})',
              hintText: 'Enter withdrawal amount',
              prefixIcon: const Icon(Icons.attach_money_rounded),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) return 'Please enter amount';
              final amount = double.tryParse(value);
              if (amount == null || amount <= 0) return 'Enter a valid amount';
              final min = _minFrom(context);
              if (amount < min) return 'Minimum withdrawal is \$${min.round()}';
              return null; // full validation (available balance etc.) runs server-side too
            },
          ),
          const SizedBox(height: 16),
          // ---- Method selector ----
          Text('Select Method', style: AppTextStyles.bodySmall),
          const SizedBox(height: 8),
          ..._METHODS.map((m) {
            final String mLabel = m['label'] as String;
            final String mMethod = m['method'] as String;
            final IconData mIcon = m['icon'] as IconData;
            final selected = _selectedMethod == mMethod;
            final needsBank = mMethod == 'bank_transfer';
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Container(
                decoration: BoxDecoration(
                  color: selected ? const Color(0xFF1A1005) : const Color(0xFF120C05),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: selected ? const Color(0xFF25C85A) : Colors.transparent,
                  ),
                ),
                child: Column(
                  children: [
                    ListTile(
                      enabled: windowOpen,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      tileColor: Colors.transparent,
                      leading: Radio<String>(
                        value: mMethod,
                        groupValue: _selectedMethod,
                        onChanged: windowOpen ? (v) => setState(() => _selectedMethod = v as String) : null,
                      ),
                      title: Row(
                        children: [
                          Icon(mIcon, size: 20, color: selected ? const Color(0xFF25C85A) : Colors.white70),
                          const SizedBox(width: 10),
                          Text(mLabel, style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ),
                    // Bank details / VPA inputs inline under their method.
                    if (selected && needsBank)
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 50, vertical: 8),
                        child: Column(
                          children: [
                            TextFormField(
                              controller: _accountController,
                              keyboardType: TextInputType.number,
                              enabled: windowOpen,
                              decoration: const InputDecoration(hintText: 'Account Number'),
                              validator: (v) =>
                                  (v == null || v.isEmpty) ? 'Enter account number' : (v.length < 8 ? 'Enter a valid account number' : null),
                            ),
                            const SizedBox(height: 8),
                            TextFormField(
                              controller: _ifscController,
                              enabled: windowOpen,
                              decoration: const InputDecoration(hintText: 'IFSC Code'),
                              validator: (v) => (v == null || v.isEmpty) ? 'Enter IFSC code' : null,
                            ),
                            const SizedBox(height: 8),
                            TextFormField(
                              controller: _holderController,
                              enabled: windowOpen,
                              decoration: const InputDecoration(hintText: 'Account Holder Name'),
                              validator: (v) => (v == null || v.isEmpty) ? 'Enter holder name' : null,
                            ),
                          ],
                        ),
                      ),
                    if (selected && (mMethod == 'qr' || mMethod == 'gpay'))
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 50, vertical: 8),
                        child: TextFormField(
                          controller: _vpaController,
                          enabled: windowOpen,
                          decoration: InputDecoration(
                            hintText: mMethod == 'gpay' ? 'Google Pay UPI ID (e.g. name@paytm)' : 'UPI ID (e.g. name@ybl)',
                          ),
                          validator: (v) => (v == null || v.isEmpty) ? 'Enter UPI ID' : null,
                        ),
                      ),
                  ],
                ),
              ),
            );
          }),
          // ---- 6AM-1PM window notice ----
          if (!windowOpen)
            Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFFFA726).withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFFFA726)),
              ),
              child: Row(
                children: const [
                  Icon(Icons.schedule_rounded, color: Color(0xFFFFA726), size: 18),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Withdrawals are available 6:00 AM – 1:00 PM. Please try again within that window.',
                      style: TextStyle(color: Color(0xFFFFA726), fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
          const SizedBox(height: 16),
          Consumer<PaymentController>(
            builder: (context, paymentController, _) {
              final isLoading = paymentController.isProcessing;
              final errorMessage = paymentController.error;
              final pendingRequest = paymentController.pendingRequest;
              final noticeShown = paymentController.pendingNoticeShown;
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
                  // Post-submit notice: after the configured delay (3-4s) with
                  // no admin action yet, tell the user the request is pending
                  // and their money is safe. Text is server-configured.
                  if (pendingRequest != null && noticeShown)
                    Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFA726).withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFFFA726)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.hourglass_empty_rounded, color: Color(0xFFFFA726), size: 18),
                          const SizedBox(width: 10),
                          Expanded(child: Text(paymentController.msgPending, style: const TextStyle(color: Color(0xFFFFA726), fontSize: 12))),
                        ],
                      ),
                    ),
                  // One open request at a time — block new ones while pending.
                  if (pendingRequest != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Text(
                        'You have a pending withdrawal of \$${pendingRequest.amount.toStringAsFixed(2)}. '
                        'It will be processed before a new one can be made.',
                        style: const TextStyle(color: Colors.white54, fontSize: 12),
                      ),
                    ),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      // Disable while one is already pending (no duplicates).
                      onPressed: (windowOpen && !isLoading && pendingRequest == null) ? () async {
                        if (_formKey.currentState!.validate()) {
                          // Pass the bank details / UPI id as reference notes.
                          final referenceId = _selectedMethod == 'bank_transfer'
                              ? _ifscController.text.trim()
                              : _vpaController.text.trim();
                          final created = await paymentController.requestWithdrawal(
                            amount: double.parse(_amountController.text.trim()),
                            method: _selectedMethod,
                            referenceId: referenceId.isEmpty ? null : referenceId,
                          );
                          if (created != null && context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Withdrawal request submitted!'), backgroundColor: Color(0xFF25C85A)),
                            );
                            _amountController.clear();
                            _accountController.clear();
                            _ifscController.clear();
                            _holderController.clear();
                            _vpaController.clear();
                          }
                        }
                      } : null,
                      child: isLoading
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Text('Withdraw', style: TextStyle(fontSize: 16)),
                    ),
                  ),
                  // Admin response window, from server config (not hardcoded).
                  Text(
                    'Admins respond within ${paymentController.adminTimeoutHours}h. Unresolved requests expire and your amount is released automatically.',
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.white38, fontSize: 11),
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
