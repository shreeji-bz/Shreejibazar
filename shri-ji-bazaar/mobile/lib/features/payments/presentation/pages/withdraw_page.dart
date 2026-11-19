import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import 'package:shri_ji_bazaar/core/widgets/sidebar_toggle.dart';
import 'package:image_picker/image_picker.dart';
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
            children: const [
              SizedBox(height: 16),
              _WithdrawForm(),
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

  // Bank fields
  final _accountController = TextEditingController();
  final _ifscController = TextEditingController();
  final _holderController = TextEditingController();

  // UPI field
  final _upiIdController = TextEditingController();

  // QR
  File? _qrImage;

  // Selected method: 'upi' | 'qr' | 'bank_transfer'
  String _selectedMethod = 'bank_transfer';

  // Image picker
  final _imagePicker = ImagePicker();

  @override
  void dispose() {
    _amountController.dispose();
    _accountController.dispose();
    _ifscController.dispose();
    _holderController.dispose();
    _upiIdController.dispose();
    super.dispose();
  }

  Future<void> _pickQrImage() async {
    final XFile? picked = await _imagePicker.pickImage(source: ImageSource.gallery);
    if (picked != null) {
      setState(() {
        _qrImage = File(picked.path);
      });
    }
  }

  Widget _buildMethodTabs() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1A1208),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Expanded(
            child: _MethodTab(
              label: 'UPI',
              icon: Icons.account_balance_wallet_rounded,
              selected: _selectedMethod == 'upi',
              onTap: () => setState(() => _selectedMethod = 'upi'),
            ),
          ),
          Expanded(
            child: _MethodTab(
              label: 'QR',
              icon: Icons.qr_code_2_rounded,
              selected: _selectedMethod == 'qr',
              onTap: () => setState(() => _selectedMethod = 'qr'),
            ),
          ),
          Expanded(
            child: _MethodTab(
              label: 'Bank',
              icon: Icons.account_balance_rounded,
              selected: _selectedMethod == 'bank_transfer',
              onTap: () => setState(() => _selectedMethod = 'bank_transfer'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUpiFields() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: 16),
        TextFormField(
          controller: _upiIdController,
          keyboardType: TextInputType.emailAddress,
          decoration: const InputDecoration(
            labelText: 'UPI ID',
            hintText: 'e.g. name@upi',
            prefixIcon: Icon(Icons.account_balance_wallet_rounded),
          ),
          validator: (value) {
            if (_selectedMethod == 'upi') {
              if (value == null || value.isEmpty) return 'Please enter UPI ID';
            }
            return null;
          },
        ),
      ],
    );
  }

  Widget _buildQrFields() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: 16),
        ElevatedButton.icon(
          onPressed: _pickQrImage,
          icon: const Icon(Icons.upload_file_rounded),
          label: Text(_qrImage == null ? 'Upload QR Image' : 'Change QR Image'),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF1A1208),
            foregroundColor: const Color(0xFFD4A853),
            side: const BorderSide(color: Color(0xFF3A3020)),
            padding: const EdgeInsets.symmetric(vertical: 14),
            elevation: 0,
          ),
        ),
        if (_qrImage != null) ...[
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFF1A1208),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF3A3020)),
            ),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.file(
                    _qrImage!,
                    width: 60,
                    height: 60,
                    fit: BoxFit.cover,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'QR image selected',
                    style: AppTextStyles.bodySmall,
                  ),
                ),
                IconButton(
                  onPressed: () => setState(() => _qrImage = null),
                  icon: const Icon(Icons.close_rounded, size: 20, color: Color(0xFFE53935)),
                  visualDensity: VisualDensity.compact,
                ),
              ],
            ),
          ),
        ],
        const SizedBox(height: 16),
        TextFormField(
          controller: _upiIdController,
          keyboardType: TextInputType.emailAddress,
          decoration: const InputDecoration(
            labelText: 'UPI ID (optional)',
            hintText: 'e.g. name@upi',
            prefixIcon: Icon(Icons.account_balance_wallet_rounded),
          ),
        ),
      ],
    );
  }

  Widget _buildBankFields() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
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
            if (_selectedMethod == 'bank_transfer') {
              if (value == null || value.isEmpty) return 'Please enter account number';
              if (value.length < 8) return 'Enter a valid account number';
            }
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
            if (_selectedMethod == 'bank_transfer') {
              if (value == null || value.isEmpty) return 'Please enter IFSC code';
            }
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
            if (_selectedMethod == 'bank_transfer') {
              if (value == null || value.isEmpty) return 'Please enter account holder name';
            }
            return null;
          },
        ),
      ],
    );
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
          _buildMethodTabs(),
          const SizedBox(height: 16),
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
          if (_selectedMethod == 'upi') _buildUpiFields(),
          if (_selectedMethod == 'qr') _buildQrFields(),
          if (_selectedMethod == 'bank_transfer') _buildBankFields(),
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
                          Map<String, String>? bankDetails;
                          String? upiId;
                          File? qrImage;

                          switch (_selectedMethod) {
                            case 'bank_transfer':
                              bankDetails = {
                                'bankName': '',
                                'accountNumber': _accountController.text.trim(),
                                'ifscCode': _ifscController.text.trim(),
                                'accountHolderName': _holderController.text.trim(),
                              };
                              break;
                            case 'upi':
                              upiId = _upiIdController.text.trim();
                              break;
                            case 'qr':
                              qrImage = _qrImage;
                              if (_upiIdController.text.trim().isNotEmpty) {
                                upiId = _upiIdController.text.trim();
                              }
                              break;
                          }

                          final success = await paymentController.requestWithdrawal(
                            amount: amount,
                            method: _selectedMethod,
                            bankDetails: bankDetails,
                            upiId: upiId,
                            qrImage: qrImage,
                          );
                          if (success != null && context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Withdrawal request submitted!'), backgroundColor: Color(0xFF25C85A)),
                            );
                            _amountController.clear();
                            _accountController.clear();
                            _ifscController.clear();
                            _holderController.clear();
                            _upiIdController.clear();
                            _qrImage = null;
                            setState(() {});
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

class _MethodTab extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  const _MethodTab({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final bg = selected ? const Color(0xFFD4A853).withValues(alpha: 0.15) : Colors.transparent;
    final fg = selected ? const Color(0xFFD4A853) : const Color(0xFF8A8070);
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 18, color: fg),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
                color: fg,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
