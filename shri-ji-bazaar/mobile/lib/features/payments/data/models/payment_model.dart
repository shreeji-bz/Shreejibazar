import '../../domain/entities/payment_entity.dart';

class PaymentModel extends PaymentEntity {
  PaymentModel({
    required super.id,
    required super.userId,
    super.processedBy,
    required super.type,
    required super.amount,
    required super.currency,
    required super.method,
    required super.status,
    super.referenceId,
    super.referenceType,
    super.notes,
    super.adminNotes,
    super.balanceBefore,
    super.balanceAfter,
    super.approvedAt,
    super.completedAt,
    required super.createdAt,
    super.updatedAt,
    super.txnId,
    super.utrNumber,
    super.screenshotUrl,
    super.provider,
    super.rejectionReason,
    super.bankName,
    super.accountNumber,
    super.ifscCode,
    super.accountHolderName,
  });

  /// A JSON value that may arrive in snake_case (DB/legacy) or camelCase
  /// (the user payment endpoints serialize the mapped entity).
  static String? _text(Map<String, dynamic> json, String snake, String camel) =>
      (json[snake] ?? json[camel]) as String?;

  static DateTime? _date(Map<String, dynamic> json, String snake, String camel) {
    final raw = json[snake] ?? json[camel];
    if (raw == null) return null;
    final d = DateTime.tryParse(raw.toString());
    return d?.toLocal() ?? null;
  }

  static double? _num(Map<String, dynamic> json, String snake, String camel) {
    final raw = json[snake] ?? json[camel];
    return (raw as num?)?.toDouble();
  }

  factory PaymentModel.fromJson(Map<String, dynamic> json) {
    return PaymentModel(
      id: json['id'] as String? ?? '',
      userId: (json['user_id'] ?? json['userId']) as String? ?? '',
      processedBy: _text(json, 'processed_by', 'processedBy'),
      type: (json['type'] as String? ?? 'deposit'),
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      currency: json['currency'] as String? ?? 'INR',
      method: (json['method'] as String? ?? 'upi'),
      status: (json['status'] as String? ?? 'pending'),
      referenceId: _text(json, 'reference_id', 'referenceId'),
      referenceType: _text(json, 'reference_type', 'referenceType'),
      notes: json['notes'] as String?,
      adminNotes: _text(json, 'admin_notes', 'adminNotes'),
      balanceBefore: _num(json, 'balance_before', 'balanceBefore'),
      balanceAfter: _num(json, 'balance_after', 'balanceAfter'),
      approvedAt: _date(json, 'approved_at', 'approvedAt'),
      completedAt: _date(json, 'completed_at', 'completedAt'),
      createdAt: _date(json, 'created_at', 'createdAt') ?? DateTime.now(),
      updatedAt: _date(json, 'updated_at', 'updatedAt'),
      txnId: _text(json, 'txn_id', 'txnId'),
      utrNumber: _text(json, 'utr_number', 'utrNumber'),
      screenshotUrl: _text(json, 'screenshot_url', 'screenshotUrl'),
      provider: _text(json, 'provider', 'provider') ?? 'manual',
      // Rejection reasons / bank details matter on the Withdrawal History
      // screen; the user history API returns camelCase. The page falls back
      // to adminNotes when rejectionReason is absent.
      rejectionReason: _text(json, 'rejection_reason', 'rejectionReason'),
      bankName: _text(json, 'bank_name', 'bankName'),
      accountNumber: _text(json, 'account_number', 'accountNumber'),
      ifscCode: _text(json, 'ifsc_code', 'ifscCode'),
      accountHolderName: _text(json, 'account_holder_name', 'accountHolderName'),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      if (processedBy != null) 'processed_by': processedBy,
      'type': type,
      'amount': amount,
      'currency': currency,
      'method': method,
      'status': status,
      if (referenceId != null) 'reference_id': referenceId,
      if (referenceType != null) 'reference_type': referenceType,
      if (notes != null) 'notes': notes,
      if (adminNotes != null) 'admin_notes': adminNotes,
      if (balanceBefore != null) 'balance_before': balanceBefore,
      if (balanceAfter != null) 'balance_after': balanceAfter,
      if (approvedAt != null) 'approved_at': approvedAt!.toIso8601String(),
      if (completedAt != null) 'completed_at': completedAt!.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      if (updatedAt != null) 'updated_at': updatedAt!.toIso8601String(),
      if (txnId != null) 'txn_id': txnId,
      if (utrNumber != null) 'utr_number': utrNumber,
      if (screenshotUrl != null) 'screenshot_url': screenshotUrl,
      'provider': provider ?? 'manual',
      if (rejectionReason != null) 'rejection_reason': rejectionReason,
      if (bankName != null) 'bank_name': bankName,
      if (accountNumber != null) 'account_number': accountNumber,
      if (ifscCode != null) 'ifsc_code': ifscCode,
      if (accountHolderName != null) 'account_holder_name': accountHolderName,
    };
  }

  PaymentModel copyWith({
    String? id,
    String? userId,
    String? processedBy,
    String? type,
    double? amount,
    String? currency,
    String? method,
    String? status,
    String? referenceId,
    String? referenceType,
    String? notes,
    String? adminNotes,
    double? balanceBefore,
    double? balanceAfter,
    DateTime? approvedAt,
    DateTime? completedAt,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? txnId,
    String? utrNumber,
    String? screenshotUrl,
    String? provider,
    String? rejectionReason,
    String? bankName,
    String? accountNumber,
    String? ifscCode,
    String? accountHolderName,
  }) {
    return PaymentModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      processedBy: processedBy ?? this.processedBy,
      type: type ?? this.type,
      amount: amount ?? this.amount,
      currency: currency ?? this.currency,
      method: method ?? this.method,
      status: status ?? this.status,
      referenceId: referenceId ?? this.referenceId,
      referenceType: referenceType ?? this.referenceType,
      notes: notes ?? this.notes,
      adminNotes: adminNotes ?? this.adminNotes,
      balanceBefore: balanceBefore ?? this.balanceBefore,
      balanceAfter: balanceAfter ?? this.balanceAfter,
      approvedAt: approvedAt ?? this.approvedAt,
      completedAt: completedAt ?? this.completedAt,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      txnId: txnId ?? this.txnId,
      utrNumber: utrNumber ?? this.utrNumber,
      screenshotUrl: screenshotUrl ?? this.screenshotUrl,
      provider: provider ?? this.provider,
      rejectionReason: rejectionReason ?? this.rejectionReason,
      bankName: bankName ?? this.bankName,
      accountNumber: accountNumber ?? this.accountNumber,
      ifscCode: ifscCode ?? this.ifscCode,
      accountHolderName: accountHolderName ?? this.accountHolderName,
    );
  }
}
