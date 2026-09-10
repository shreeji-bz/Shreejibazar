class PaymentEntity {
  final String id;
  final String userId;
  final String type; // 'deposit' or 'withdrawal'
  final double amount;
  final String currency;
  final String method; // 'upi', 'bank_transfer', 'paytm', 'phonepe'
  final String status; // 'pending', 'approved', 'completed', 'rejected', 'failed'
  final String? referenceId;
  final String? notes;
  final String? adminNotes;
  final double? balanceBefore;
  final double? balanceAfter;
  final DateTime? approvedAt;
  final DateTime? completedAt;
  final DateTime createdAt;

  PaymentEntity({
    required this.id,
    required this.userId,
    required this.type,
    required this.amount,
    required this.currency,
    required this.method,
    required this.status,
    this.referenceId,
    this.notes,
    this.adminNotes,
    this.balanceBefore,
    this.balanceAfter,
    this.approvedAt,
    this.completedAt,
    required this.createdAt,
  });
}
