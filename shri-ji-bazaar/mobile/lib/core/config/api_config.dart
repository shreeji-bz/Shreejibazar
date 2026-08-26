import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../constants/app_constants.dart';

class ApiConfig {
  static Dio createDio() {
    final dio = Dio(BaseOptions(
      baseUrl: AppConstants.apiBaseUrl,
      connectTimeout: const Duration(milliseconds: AppConstants.connectTimeout),
      receiveTimeout: const Duration(milliseconds: AppConstants.receiveTimeout),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _getToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          await _clearToken();
        }
        return handler.next(error);
      },
    ));

    if (kDebugMode) {
      dio.interceptors.add(LogInterceptor(responseBody: true, requestBody: true));
    }

    return dio;
  }

  static Future<String?> _getToken() async {
    // Will be implemented with secure storage
    return null;
  }

  static Future<void> _clearToken() async {
    // Will be implemented with secure storage
  }
}
