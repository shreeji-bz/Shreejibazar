import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:shri_ji_bazaar/features/home/data/datasources/home_datasource.dart';
import 'package:shri_ji_bazaar/features/home/data/repositories/home_repository.dart';
import 'package:shri_ji_bazaar/features/home/domain/repositories/ihome_repository.dart';
import 'package:shri_ji_bazaar/features/home/domain/usecases/get_home_data.dart';
import 'package:shri_ji_bazaar/features/home/presentation/controllers/home_controller.dart';
import 'package:shri_ji_bazaar/features/points/data/datasources/points_datasource.dart';
import 'package:shri_ji_bazaar/features/points/data/repositories/points_repository.dart';
import 'package:shri_ji_bazaar/features/points/domain/repositories/ipoints_repository.dart';
import 'package:shri_ji_bazaar/features/points/domain/usecases/get_wallet.dart';
import 'core/theme/app_theme.dart';
import 'core/routes/app_routes.dart';
import 'core/config/supabase_config.dart';
import 'features/authentication/presentation/controllers/auth_controller.dart';

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
          create: (_) => HomeController(
            GetHomeData(HomeRepository(HomeDatasource())),
            GetWallet(PointsRepository(PointsDatasource())),
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
