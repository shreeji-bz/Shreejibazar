class PaymentEntity {
  final String id;
  final String userId;
  final String? processedBy;
  final String type;
  final double amount;
  final String currency;
  final String method;
  final String status;
  final String? referenceId;
  final String? referenceType;
  final String? notes;
  final String? adminNotes;
  final double? balanceBefore;
  final double? balanceAfter;
  final DateTime? approvedAt;
  final DateTime? completedAt;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final String? txnId;
  final String? utrNumber;
  final String? screenshotUrl;
  final String? provider;
  final String? rejectionReason;
  final String? bankName;
  final String? accountNumber;
  final String? ifscCode;
  final String? accountHolderName;

  PaymentEntity({
    required this.id,
    required this.userId,
    this.processedBy,
    required this.type,
    required this.amount,
    required this.currency,
    required this.method,
    required this.status,
    this.referenceId,
    this.referenceType,
    this.notes,
    this.adminNotes,
    this.balanceBefore,
    this.balanceAfter,
    this.approvedAt,
    this.completedAt,
    required this.createdAt,
    this.updatedAt,
    this.txnId,
    this.utrNumber,
    this.screenshotUrl,
    this.provider,
    this.rejectionReason,
    this.bankName,
    this.accountNumber,
    this.ifscCode,
    this.accountHolderName,
  });
}
