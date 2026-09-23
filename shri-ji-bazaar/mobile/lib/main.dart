import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:shri_ji_bazaar/features/home/data/datasources/home_datasource.dart';
import 'package:shri_ji_bazaar/features/home/data/repositories/home_repository.dart';
import 'package:shri_ji_bazaar/features/home/domain/usecases/get_home_data.dart';
import 'package:shri_ji_bazaar/features/home/presentation/controllers/home_controller.dart';
import 'package:shri_ji_bazaar/features/points/data/datasources/points_datasource.dart';
import 'package:shri_ji_bazaar/features/points/data/repositories/points_repository.dart';
import 'package:shri_ji_bazaar/features/points/domain/usecases/get_wallet.dart';
import 'core/theme/app_theme.dart';
import 'core/routes/app_routes.dart';
import 'core/config/supabase_config.dart';
import 'features/authentication/presentation/controllers/auth_controller.dart';
import 'features/my_activity/presentation/controllers/activity_controller.dart';
import 'features/my_activity/domain/usecases/get_user_activities.dart';
import 'features/my_activity/data/repositories/activity_repository.dart';
import 'features/my_activity/data/datasources/activity_datasource.dart';
import 'features/points/presentation/controllers/points_controller.dart';
import 'features/points/domain/usecases/get_points_balance.dart';
import 'features/points/domain/usecases/get_points_history.dart';
import 'features/bonuses/presentation/controllers/bonus_controller.dart';
import 'features/bonuses/domain/usecases/get_bonuses.dart';
import 'features/bonuses/data/repositories/bonus_repository.dart';
import 'features/bonuses/data/datasources/bonus_datasource.dart';
import 'features/referrals/presentation/controllers/referral_controller.dart';
import 'features/referrals/domain/usecases/get_referral_stats.dart';
import 'features/referrals/domain/usecases/get_referral_list.dart';
import 'features/referrals/data/repositories/referral_repository.dart';
import 'features/referrals/data/datasources/referral_datasource.dart';
import 'features/notifications/presentation/controllers/notification_controller.dart';
import 'features/notifications/domain/usecases/get_notifications.dart';
import 'features/notifications/data/repositories/notification_repository.dart';
import 'features/notifications/data/datasources/notification_datasource.dart';
import 'features/results/presentation/controllers/result_controller.dart';
import 'features/results/domain/usecases/get_results.dart';
import 'features/results/data/repositories/result_repository.dart';
import 'features/results/data/datasources/result_datasource.dart';
import 'features/settings/presentation/controllers/settings_controller.dart';
import 'features/settings/domain/usecases/get_settings.dart';
import 'features/settings/data/repositories/settings_repository.dart';
import 'features/settings/data/datasources/settings_datasource.dart';
import 'features/splash/presentation/controllers/splash_controller.dart';
import 'features/splash/domain/usecases/check_app_update.dart';
import 'features/splash/data/repositories/splash_repository.dart';
import 'features/splash/data/datasources/splash_datasource.dart';
import 'features/support/presentation/controllers/support_controller.dart';
import 'features/support/domain/usecases/get_tickets.dart';
import 'features/support/data/repositories/support_repository.dart';
import 'features/support/data/datasources/support_datasource.dart';
import 'features/profile/presentation/controllers/profile_controller.dart';
import 'features/profile/domain/usecases/get_profile.dart';
import 'features/profile/data/repositories/profile_repository.dart';
import 'features/profile/data/datasources/profile_datasource.dart';
import 'features/wager/presentation/controllers/wager_controller.dart';
import 'features/wager/domain/usecases/place_wager.dart';
import 'features/wager/domain/usecases/get_wager_history.dart';
import 'features/wager/data/repositories/wager_repository.dart';
import 'features/wager/data/datasources/wager_datasource.dart';
import 'features/games/presentation/controllers/game_controller.dart';
import 'features/games/domain/usecases/get_games.dart';
import 'features/games/domain/usecases/get_popular_games.dart';
import 'features/games/data/repositories/game_repository.dart';
import 'features/games/data/datasources/game_datasource.dart';
import 'features/game_details/presentation/controllers/game_details_controller.dart';
import 'features/game_details/domain/usecases/get_game_detail.dart';
import 'features/game_details/data/repositories/game_detail_repository.dart';
import 'features/game_details/data/datasources/game_detail_datasource.dart';
import 'features/payments/presentation/controllers/payment_controller.dart';
import 'features/payments/domain/usecases/create_deposit.dart';
import 'features/payments/domain/usecases/create_withdrawal.dart';
import 'features/payments/domain/usecases/get_payment_history.dart';
import 'features/payments/domain/usecases/create_imb_order.dart';
import 'features/payments/data/repositories/payment_repository.dart';
import 'features/payments/data/datasources/payment_datasource.dart';
import 'features/payments/data/repositories/imb_payment_repository.dart';
import 'features/payments/data/datasources/imb_payment_datasource.dart';

final navigatorKey = GlobalKey<NavigatorState>();

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SupabaseConfig.initialize();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(statusBarColor: Colors.transparent));
  runApp(const ShriJiBazaarApp());
}

class ShriJiBazaarApp extends StatelessWidget {
  const ShriJiBazaarApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthController()),
        ChangeNotifierProvider(
          create: (_) => SplashController(
            CheckAppUpdate(SplashRepository(SplashDatasource())),
          ),
        ),
        ChangeNotifierProvider(
          create: (_) => HomeController(
            GetHomeData(HomeRepository(HomeDatasource())),
            GetWallet(PointsRepository(PointsDatasource())),
          ),
        ),
        ChangeNotifierProvider(
          create: (_) => ActivityController(
            GetUserActivities(ActivityRepository(ActivityDatasource())),
          ),
        ),
        ChangeNotifierProvider(
          create: (_) => PointsController(
            GetPointsBalance(PointsRepository(PointsDatasource())),
            GetPointsHistory(PointsRepository(PointsDatasource())),
          ),
        ),
        ChangeNotifierProvider(
          create: (_) => BonusController(
            GetBonuses(BonusRepository(BonusDatasource())),
          ),
        ),
        ChangeNotifierProvider(
          create: (_) => ReferralController(
            getReferralStats: GetReferralStats(ReferralRepository(ReferralDatasource())),
            getReferralList: GetReferralList(ReferralRepository(ReferralDatasource())),
            getProfile: GetProfileUseCase(ProfileRepository(ProfileDatasource())),
          ),
        ),
        ChangeNotifierProvider(
          create: (_) => NotificationController(
            GetNotifications(NotificationRepository(NotificationDatasource())),
          ),
        ),
        ChangeNotifierProvider(
          create: (_) => ResultController(
            GetResults(ResultRepository(ResultDatasource())),
          ),
        ),
        ChangeNotifierProvider(
          create: (_) => SettingsController(
            GetSettings(SettingsRepository(SettingsDatasource())),
          ),
        ),
        ChangeNotifierProvider(
          create: (_) => SupportController(
            GetTickets(SupportRepository(SupportDatasource())),
          ),
        ),
        ChangeNotifierProvider(
          create: (_) => GameController(
            GetGames(GameRepository(GameDatasource())),
            GetPopularGames(GameRepository(GameDatasource())),
          ),
        ),
        ChangeNotifierProvider(
          create: (_) => GameDetailsController(
            GetGameDetail(GameDetailRepository(GameDetailDatasource())),
          ),
        ),
        ChangeNotifierProvider(
          create: (_) => PaymentController(
            createDeposit: CreateDeposit(PaymentRepository(PaymentDatasource())),
            createWithdrawal: CreateWithdrawal(PaymentRepository(PaymentDatasource())),
            getPaymentHistory: GetPaymentHistory(PaymentRepository(PaymentDatasource())),
            createImbOrder: CreateImbOrder(ImbPaymentRepository(ImbPaymentDatasource())),
            getWallet: GetWallet(PointsRepository(PointsDatasource())),
          ),
        ),
        ChangeNotifierProvider(
          create: (_) => WagerController(
            PlaceWager(WagerRepository(WagerDatasource())),
            GetWagerHistory(WagerRepository(WagerDatasource())),
          ),
        ),
        ChangeNotifierProvider(
          create: (_) => ProfileController(
            GetProfileUseCase(ProfileRepository(ProfileDatasource())),
            UpdateProfileUseCase(ProfileRepository(ProfileDatasource())),
          ),
        ),
      ],
      child: Consumer<AuthController>(
        builder: (context, auth, _) {
          return MaterialApp.router(
            title: 'Shri Ji Bazaar',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.light,
            routerConfig: createRouter(context),
          );
        },
      ),
    );
  }
}
