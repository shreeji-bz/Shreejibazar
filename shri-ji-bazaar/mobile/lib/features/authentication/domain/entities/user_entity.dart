class UserEntity {
  final String id;
  final String name;
  final String mobile;
  final String email;
  final String? avatar;
  final String referralCode;
  final String? referredBy;
  final String status;
  final DateTime? lastLogin;
  final DateTime createdAt;
  final DateTime updatedAt;

  const UserEntity({
    required this.id,
    required this.name,
    required this.mobile,
    required this.email,
    this.avatar,
    required this.referralCode,
    this.referredBy,
    required this.status,
    this.lastLogin,
    required this.createdAt,
    required this.updatedAt,
  });

  UserEntity copyWith({
    String? name,
    String? email,
    String? avatar,
    String? status,
  }) {
    return UserEntity(
      id: id,
      name: name ?? this.name,
      mobile: mobile,
      email: email ?? this.email,
      avatar: avatar ?? this.avatar,
      referralCode: referralCode,
      referredBy: referredBy,
      status: status ?? this.status,
      lastLogin: lastLogin,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }
}
