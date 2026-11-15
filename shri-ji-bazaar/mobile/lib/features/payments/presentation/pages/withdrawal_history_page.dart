import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import 'package:shri_ji_bazaar/core/widgets/sidebar_toggle.dart';
import '../../domain/entities/payment_entity.dart';
import '../controllers/payment_controller.dart';

/// Withdrawal history — the user's withdrawal requests with their
/// lifecycle status: Pending / Approved / Rejected / Expired.
///
/// Reads `PaymentController.history` filtered to withdrawals (the server
/// returns the request rows; statuses mirror the payments table).
class WithdrawalHistoryPage extends StatefulWidget {
  const WithdrawalHistoryPage({super.key});

  @override
  State<WithdrawalHistoryPage> createState() => _WithdrawalHistoryPageState();
}

class _WithdrawalHistoryPageState extends State<WithdrawalHistoryPage> {
  bool _loading = false;

  /// Withdrawal rows only, most recent first.
  List<PaymentEntity> _withdrawals = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final history = await context.read<PaymentController>().getWithdrawalHistory();
      setState(() => _withdrawals = history.where((p) => p.type == 'withdrawal').toList());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: const SidebarToggle(),
        title: const Text('Withdrawal History'),
        actions: [
          IconButton(onPressed: _loading ? null : _load, icon: const Icon(Icons.refresh_rounded)),
        ],
      ),
      body: _loading && _withdrawals.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : _withdrawals.isEmpty
              ? _empty(context)
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _withdrawals.length,
                  itemBuilder: (context, index) => _Tile(
                    payment: _withdrawals[index],
                    onRefresh: _load,
                  ),
                ),
    );
  }

  Widget _empty(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.account_balance_wallet_outlined, size: 56, color: Colors.white.withValues(alpha: 0.15)),
          const SizedBox(height: 14),
          Text('No withdrawals yet', style: AppTextStyles.heading.copyWith(fontSize: 20)),
          const SizedBox(height: 6),
          Text('Your withdrawal requests will appear here.', style: AppTextStyles.bodySmall),
        ],
      ),
    );
  }
}

class _Tile extends StatefulWidget {
  final PaymentEntity payment;
  final VoidCallback onRefresh;
  const _Tile({required this.payment, required this.onRefresh});

  @override
  State<_Tile> createState() => _TileState();
}

class _TileState extends State<_Tile> {
  // Status chip styles per lifecycle state.
  static const Map<String, Color> _color = {
    'pending': Color(0xFFFFA726),
    'approved': Color(0xFF25C85A),
    'completed': Color(0xFF25C85A),
    'rejected': Color(0xFFE53935),
    'expired': Color(0xFFE53935),
  };

  String _label(String status) =>
      status == 'completed' ? 'Approved' : status.toUpperCase();

  String _subline(PaymentEntity p) {
    final bits = <String>[];
    if (p.method.isNotEmpty) bits.add(p.method.toLowerCase());
    final ref = p.accountNumber ?? p.ifscCode ?? p.referenceId;
    if (ref != null && ref.isNotEmpty) bits.add(ref);
    bits.add(_format(p.createdAt));
    return bits.join(' · ');
  }

  String _format(DateTime d) =>
      '${d.day}/${d.month}/${d.year} ${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';

  @override
  Widget build(BuildContext context) {
    final p = widget.payment;
    final color = _color[p.status] ?? Colors.white54;
    final isPending = p.status == 'pending';
    // After 3-4s of pending, the user sees the "money is safe" note.
    final showPendingNotice = isPending && p.createdAt.difference(DateTime.now()) < const Duration(minutes: 30);

    // Rejection/decision reason (admin note or rejection reason).
    final reason = p.rejectionReason ?? p.adminNotes;
    final showReason = p.status == 'rejected' || p.status == 'expired';

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      color: const Color(0xFF120C05),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 40, height: 40,
                  decoration: BoxDecoration(color: color.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
                  child: Icon(
                    p.status == 'approved' || p.status == 'completed' ? Icons.check_circle_rounded
                        : isPending ? Icons.hourglass_empty_rounded
                        : Icons.close_rounded,
                    color: color,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Withdrawal', style: AppTextStyles.cardTitle),
                      const SizedBox(height: 2),
                      Text(_subline(p), style: AppTextStyles.bodySmall.copyWith(color: Colors.white54)),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text('-₹${p.amount.toStringAsFixed(0)}',
                        style: AppTextStyles.points.copyWith(color: color, fontSize: 15)),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
                      child: Text(_label(p.status),
                          style: AppTextStyles.caption.copyWith(color: color, fontSize: 10)),
                    ),
                  ],
                ),
              ],
            ),
            // Status-specific helper lines.
            if (showPendingNotice)
              Padding(
                padding: const EdgeInsets.only(top: 10),
                child: Text('Pending admin approval. Your money is safe in your wallet.',
                    style: AppTextStyles.bodySmall.copyWith(color: const Color(0xFFFFA726))),
              ),
            if (showReason && reason != null && reason.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 10),
                child: Text('Reason: $reason',
                    style: AppTextStyles.bodySmall.copyWith(color: const Color(0xFFE53935))),
              ),
          ],
        ),
      ),
    );
  }
}
