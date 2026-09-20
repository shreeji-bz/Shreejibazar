import 'package:flutter/foundation.dart';
import '../../domain/usecases/get_referral_stats.dart';

class ReferralController extends ChangeNotifier {
  final GetReferralStats getReferralStats;
  ReferralController(this.getReferralStats);
}
