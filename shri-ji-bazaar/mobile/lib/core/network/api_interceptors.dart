import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:shri_ji_bazaar/core/routes/route_names.dart';
import 'package:shri_ji_bazaar/core/storage/secure_storage.dart';

class AuthInterceptor extends Interceptor {
  final GlobalKey<NavigatorState> navigatorKey;

  AuthInterceptor(this.navigatorKey);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await SecureStorage.readToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      final refreshToken = await SecureStorage.readRefreshToken();
      if (refreshToken != null && refreshToken.isNotEmpty) {
        try {
          final dio = Dio(BaseOptions(
            baseUrl: 'http://10.97.119.19:3000/api/v1',
            headers: {'Content-Type': 'application/json'},
          ));
          final response = await dio.post('/auth/refresh', data: { 'refreshToken': refreshToken });
          final newAccessToken = response.data['data']['accessToken'] as String;
          await SecureStorage.writeToken(newAccessToken);

          final opts = err.requestOptions;
          opts.headers['Authorization'] = 'Bearer $newAccessToken';
          final retry = await Dio().fetch(opts);
          handler.resolve(retry);
          return;
        } catch (e) {
          await SecureStorage.deleteAll();
          navigatorKey.currentState?.pushNamedAndRemoveUntil('/login', (route) => false);
        }
      }
    }

    if (err.response?.statusCode == 503) {
      final data = err.response?.data;
      if (data is Map && data['code'] == 'MAINTENANCE_MODE') {
        navigatorKey.currentState?.pushNamedAndRemoveUntil(RouteNames.maintenance, (route) => false);
      }
    }

    handler.next(err);
  }
}
