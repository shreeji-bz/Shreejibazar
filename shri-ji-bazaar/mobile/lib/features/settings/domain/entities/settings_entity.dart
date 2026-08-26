class SettingsEntity {
  final String id;
  final String aboutUs;
  final String termsUrl;
  final String privacyUrl;
  final String contactEmail;
  final String contactPhone;
  final String supportEmail;
  final String version;
  final bool maintenanceMode;

  SettingsEntity({
    required this.id,
    required this.aboutUs,
    required this.termsUrl,
    required this.privacyUrl,
    required this.contactEmail,
    required this.contactPhone,
    required this.supportEmail,
    required this.version,
    required this.maintenanceMode,
  });
}
