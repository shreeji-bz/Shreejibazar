import 'package:flutter/foundation.dart';
import '../../domain/entities/profile_entity.dart';
import '../../domain/usecases/get_profile.dart';
import '../../../../core/storage/secure_storage.dart';

enum ProfileStatus { initial, loading, success, error }

class ProfileController extends ChangeNotifier {
  final GetProfileUseCase _getProfile;
  final UpdateProfileUseCase _updateProfile;

  ProfileController(this._getProfile, this._updateProfile);

  ProfileEntity? _profile;
  ProfileEntity? get profile => _profile;

  ProfileStatus _status = ProfileStatus.initial;
  ProfileStatus get status => _status;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  bool get isAuthenticated => _profile != null;

  Future<void> loadProfile() async {
    final token = await SecureStorage.readToken();
    if (kDebugMode) print('ProfileController: token present=${token != null && token.isNotEmpty}');
    if (token == null || token.isEmpty) return;
    _status = ProfileStatus.loading;
    _errorMessage = null;
    notifyListeners();

    try {
      _profile = await _getProfile.execute();
      if (kDebugMode) print('ProfileController: loaded ${_profile?.name ?? 'no name'}');
      _status = ProfileStatus.success;
    } catch (e) {
      _status = ProfileStatus.error;
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      if (kDebugMode) print('ProfileController: loadProfile failed - $_errorMessage');
    }
    notifyListeners();
  }

  Future<void> updateProfileInfo({String? name, String? email}) async {
    final token = await SecureStorage.readToken();
    if (token == null || token.isEmpty) return;
    _status = ProfileStatus.loading;
    _errorMessage = null;
    notifyListeners();

    try {
      final updated = await _updateProfile.execute(name: name, email: email);
      _profile = updated;
      _status = ProfileStatus.success;
    } catch (e) {
      _status = ProfileStatus.error;
      _errorMessage = e.toString().replaceAll('Exception: ', '');
    }
    notifyListeners();
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  Future<void> logout() async {
    _status = ProfileStatus.loading;
    notifyListeners();
    await SecureStorage.deleteAll();
    _profile = null;
    _status = ProfileStatus.initial;
    notifyListeners();
  }

  String get displayName => _profile?.name ?? 'Player';
  String get displayMobile => _profile?.mobile ?? '';
  String get displayEmail => _profile?.email ?? '';
  String get displayAvatar => _profile?.avatar ?? '';
  int get displayPoints => _profile?.points ?? 0;
  String get displayReferralCode => _profile?.referralCode ?? '';
}
