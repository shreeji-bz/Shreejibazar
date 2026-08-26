import 'package:dio/dio.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';

import '../constants/app_constants.dart';
import 'api_interceptors.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;

  late final Dio dio;

  ApiClient._internal() {
    dio = Dio(
      BaseOptions(
        baseUrl: AppConstants.apiBaseUrl,
        connectTimeout: const Duration(seconds: AppConstants.apiTimeout),
        receiveTimeout: const Duration(seconds: AppConstants.apiTimeout),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Register interceptors
    dio.interceptors.add(AuthInterceptor());
    dio.interceptors.add(RetryInterceptor());

    // Dev logger
    dio.interceptors.add(
      PrettyDioLogger(
        requestHeader: true,
        requestBody: true,
        responseBody: true,
        responseHeader: false,
        compact: true,
      ),
    );
  }
}
