import '../../domain/entities/payment_entity.dart';

class PaymentModel extends PaymentEntity {
  PaymentModel({
    required super.id,
    required super.userId,
    required super.type,
    required super.amount,
    required super.currency,
    required super.method,
    required super.status,
    super.referenceId,
    super.notes,
    super.adminNotes,
    super.balanceBefore,
    super.balanceAfter,
    super.approvedAt,
    super.completedAt,
    required super.createdAt,
  });

  factory PaymentModel.fromJson(Map<String, dynamic> json) {
    return PaymentModel(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      type: json['type'] as String,
      amount: (json['amount'] as num).toDouble(),
      currency: json['currency'] as String? ?? 'INR',
      method: json['method'] as String,
      status: json['status'] as String,
      referenceId: json['reference_id'] as String?,
      notes: json['notes'] as String?,
      adminNotes: json['admin_notes'] as String?,
      balanceBefore: json['balance_before'] != null ? (json['balance_before'] as num).toDouble() : null,
      balanceAfter: json['balance_after'] != null ? (json['balance_after'] as num).toDouble() : null,
      approvedAt: json['approved_at'] != null ? DateTime.parse(json['approved_at'] as String) : null,
      completedAt: json['completed_at'] != null ? DateTime.parse(json['completed_at'] as String) : null,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  @override
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'type': type,
      'amount': amount,
      'currency': currency,
      'method': method,
      'status': status,
      if (referenceId != null) 'reference_id': referenceId,
      if (notes != null) 'notes': notes,
      if (adminNotes != null) 'admin_notes': adminNotes,
      if (balanceBefore != null) 'balance_before': balanceBefore,
      if (balanceAfter != null) 'balance_after': balanceAfter,
      if (approvedAt != null) 'approved_at': approvedAt!.toIso8601String(),
      if (completedAt != null) 'completed_at': completedAt!.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
    };
  }

  PaymentModel copyWith({
    String? id,
    String? userId,
    String? type,
    double? amount,
    String? currency,
    String? method,
    String? status,
    String? referenceId,
    String? notes,
    String? adminNotes,
    double? balanceBefore,
    double? balanceAfter,
    DateTime? approvedAt,
    DateTime? completedAt,
    DateTime? createdAt,
  }) {
    return PaymentModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      type: type ?? this.type,
      amount: amount ?? this.amount,
      currency: currency ?? this.currency,
      method: method ?? this.method,
      status: status ?? this.status,
      referenceId: referenceId ?? this.referenceId,
      notes: notes ?? this.notes,
      adminNotes: adminNotes ?? this.adminNotes,
      balanceBefore: balanceBefore ?? this.balanceBefore,
      balanceAfter: balanceAfter ?? this.balanceAfter,
      approvedAt: approvedAt ?? this.approvedAt,
      completedAt: completedAt ?? this.completedAt,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
