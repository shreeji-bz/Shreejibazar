import '../../domain/entities/settings_entity.dart';

class SettingsModel extends SettingsEntity {
  SettingsModel({
    required super.id,
    required super.aboutUs,
    required super.termsUrl,
    required super.privacyUrl,
    required super.contactEmail,
    required super.contactPhone,
    required super.supportEmail,
    required super.version,
    required super.maintenanceMode,
  });

  factory SettingsModel.fromJson(Map<String, dynamic> json) {
    return SettingsModel(
      id: json['id'] as String,
      aboutUs: json['about_us'] as String? ?? '',
      termsUrl: json['terms_url'] as String? ?? '',
      privacyUrl: json['privacy_url'] as String? ?? '',
      contactEmail: json['contact_email'] as String? ?? '',
      contactPhone: json['contact_phone'] as String? ?? '',
      supportEmail: json['support_email'] as String? ?? '',
      version: json['version'] as String? ?? '1.0.0',
      maintenanceMode: json['maintenance_mode'] as bool? ?? false,
    );
  }
}
