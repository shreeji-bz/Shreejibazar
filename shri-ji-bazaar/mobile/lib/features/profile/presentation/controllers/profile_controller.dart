import 'package:flutter/foundation.dart';
import '../../domain/entities/profile_entity.dart';
import '../../domain/usecases/get_profile.dart';
import '../../../profile/domain/usecases/update_profile.dart';
import '../../../authentication/presentation/controllers/auth_controller.dart';

enum ProfileStatus { initial, loading, success, error }

class ProfileController extends ChangeNotifier {
  final GetProfileUseCase _getProfile;
  final UpdateProfileUseCase _updateProfile;
  final AuthController _authController;

  ProfileController(this._getProfile, this._updateProfile, this._authController);

  ProfileEntity? _profile;
  ProfileEntity? get profile => _profile;

  ProfileStatus _status = ProfileStatus.initial;
  ProfileStatus get status => _status;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  bool get isAuthenticated => _authController.isAuthenticated;

  Future<void> loadProfile() async {
    if (!_authController.isAuthenticated) return;
    _status = ProfileStatus.loading;
    _errorMessage = null;
    notifyListeners();

    try {
      _profile = await _getProfile.execute();
      _status = ProfileStatus.success;
    } catch (e) {
      _status = ProfileStatus.error;
      _errorMessage = e.toString().replaceAll('Exception: ', '');
    }
    notifyListeners();
  }

  Future<void> updateProfileInfo({String? name, String? email}) async {
    if (!_authController.isAuthenticated) return;
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

  String get displayName => _profile?.name ?? 'Player';
  String get displayMobile => _profile?.mobile ?? '';
  String get displayEmail => _profile?.email ?? '';
  String get displayAvatar => _profile?.avatar ?? '';
  int get displayPoints => _profile?.points ?? 0;
  String get displayReferralCode => _profile?.referralCode ?? '';
}
