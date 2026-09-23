import 'package:flutter/foundation.dart';
import '../../domain/usecases/get_referral_stats.dart';
import '../../domain/usecases/get_referral_list.dart';
import '../../../../features/profile/domain/usecases/get_profile.dart';
import 'package:share_plus/share_plus.dart';

class ReferralController extends ChangeNotifier {
  final GetReferralStats getReferralStats;
  final GetReferralList getReferralList;
  final GetProfileUseCase getProfile;
  ReferralController({required this.getReferralStats, required this.getReferralList, required this.getProfile});

  String? referralCode;
  bool loading = false;
  bool statsLoading = false;
  int totalPointsEarned = 0;
  int totalReferrals = 0;
  int completedReferrals = 0;

  Future<void> loadReferralData() async {
    if (loading) return;
    loading = true;
    notifyListeners();

    try {
      final profile = await getProfile.execute();
      referralCode = profile.referralCode;

      final stats = await getReferralStats();
      totalReferrals = stats.totalReferrals;
      completedReferrals = stats.completedReferrals;
      totalPointsEarned = stats.totalPointsEarned;

      await getReferralList();
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  Future<void> shareReferralLink() async {
    final code = referralCode;
    if (code == null || code.isEmpty) return;

    final baseUrl = const String.fromEnvironment('API_BASE_URL', defaultValue: 'http://10.97.119.19:3000');
    final link = '$baseUrl/register?ref=$code';

    await SharePlus.instance.share(ShareParams(text: 'Join Shri Ji Bazaar using my referral code $code and earn bonus points!\n\nRegister here: $link', subject: 'Join Shri Ji Bazaar'));
  }
}
