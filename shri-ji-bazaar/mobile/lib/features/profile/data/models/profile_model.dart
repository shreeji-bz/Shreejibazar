import '../../domain/entities/profile_entity.dart';

class ProfileModel extends ProfileEntity {
  const ProfileModel({
    required super.id,
    required super.name,
    required super.mobile,
    required super.email,
    super.avatar,
    required super.points,
    required super.referralCode,
    required super.referredBy,
    required super.status,
    super.lastLogin,
    required super.createdAt,
    required super.updatedAt,
  });

  factory ProfileModel.fromJson(Map<String, dynamic> json) {
    return ProfileModel(
      id: json['id'] as String,
      name: json['name'] as String,
      mobile: json['mobile'] as String,
      email: json['email'] as String? ?? '',
      avatar: json['avatar'] as String?,
      points: (json['points'] as num?)?.toInt() ?? 0,
      referralCode: json['referral_code'] as String? ?? json['referralCode'] as String,
      referredBy: json['referred_by'] as String? ?? json['referredBy'] as String?,
      status: json['status'] as String? ?? 'active',
      lastLogin: json['last_login'] != null ? DateTime.tryParse(json['last_login']) : null,
      createdAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updated_at'] ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'mobile': mobile,
      'email': email,
      'avatar': avatar,
      'points': points,
      'referral_code': referralCode,
      'referred_by': referredBy,
      'status': status,
      'last_login': lastLogin?.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
