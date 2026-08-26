import 'package:get/get.dart';
import '../../domain/usecases/get_referral_stats.dart';

class ReferralController extends GetxController {
  final GetReferralStats getReferralStats;
  ReferralController(this.getReferralStats);
}
