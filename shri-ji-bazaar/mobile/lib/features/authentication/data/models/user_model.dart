import '../../domain/entities/user_entity.dart';

class AuthResponse {
  final UserEntity user;
  final String token;

  AuthResponse({required this.user, required this.token});
}

class UserModel extends UserEntity {
  UserModel({
    required super.id,
    required super.name,
    required super.mobile,
    required super.email,
    super.avatar,
    required super.referralCode,
    super.referredBy,
    required super.status,
    super.lastLogin,
    required super.createdAt,
    required super.updatedAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      name: json['name'] as String,
      mobile: json['mobile'] as String,
      email: json['email'] as String? ?? '',
      avatar: json['avatar'] as String?,
      referralCode: json['referral_code'] as String,
      referredBy: json['referred_by'] as String?,
      status: json['status'] as String? ?? 'active',
      lastLogin: json['last_login'] != null ? DateTime.parse(json['last_login'] as String) : null,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  static AuthResponse fromResponse(Map<String, dynamic> data) {
    return AuthResponse(
      user: UserModel.fromJson(data['user'] as Map<String, dynamic>),
      token: data['token'] as String,
    );
  }
}
