import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'api_interceptors.dart';
import 'retry_interceptor.dart';
import '../../core/storage/secure_storage.dart';

final GlobalKey<NavigatorState> _kNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'shriJiApiServiceNavigator');

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  late final Dio dio;

  void init() {
    dio = Dio(
      BaseOptions(
        baseUrl: 'http://localhost:3000/api/v1',
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      ),
    );

    dio.interceptors.add(AuthInterceptor(_kNavigatorKey));
    dio.interceptors.add(RetryInterceptor());

    if (kDebugMode) {
      dio.interceptors.add(LogInterceptor(requestHeader: true, requestBody: true, responseBody: true));
    }
  }

  Future<dynamic> get(String path, {Map<String, dynamic>? queryParameters}) async {
    try {
      final response = await dio.get(path, queryParameters: queryParameters);
      return _handleResponse(response);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<dynamic> post(String path, {dynamic data}) async {
    try {
      final response = await dio.post(path, data: data);
      return _handleResponse(response);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<dynamic> put(String path, {dynamic data}) async {
    try {
      final response = await dio.put(path, data: data);
      return _handleResponse(response);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<dynamic> patch(String path, {dynamic data}) async {
    try {
      final response = await dio.patch(path, data: data);
      return _handleResponse(response);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<dynamic> delete(String path, {dynamic data}) async {
    try {
      final response = await dio.delete(path, data: data);
      return _handleResponse(response);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<dynamic> upload(String path, File file, {String fieldName = 'file', Map<String, dynamic>? fields}) async {
    try {
      final formData = FormData();
      formData.files.addAll([
        MapEntry(fieldName, await MultipartFile.fromFile(file.path, filename: file.path.split('/').last)),
      ]);
      if (fields != null) {
        fields.forEach((k, v) => formData.fields.add(MapEntry(k, v.toString())));
      }
      final response = await dio.post(path, data: formData);
      return _handleResponse(response);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  dynamic _handleResponse(Response response) {
    if (response.statusCode == 204) return null;
    final data = response.data;
    if (data is Map && data.containsKey('success') && !data['success']) {
      throw ApiException(data['message'] ?? 'Request failed', code: data['code']);
    }
    return data['data'] ?? data;
  }

  Never _handleError(DioException e) {
    if (e.response != null) {
      final data = e.response!.data;
      if (data is Map && data.containsKey('message')) {
        throw ApiException(data['message'], code: data['code'], statusCode: e.response!.statusCode);
      }
    }
    if (e.type == DioExceptionType.connectionTimeout || e.type == DioExceptionType.receiveTimeout) {
      throw ApiException('Connection timeout. Please check your internet.', code: 'TIMEOUT');
    }
    if (e.type == DioExceptionType.connectionError) {
      throw ApiException('No internet connection', code: 'NO_INTERNET');
    }
    throw ApiException('Something went wrong. Please try again.', code: 'UNKNOWN');
  }
}

class ApiException implements Exception {
  final String message;
  final String? code;
  final int? statusCode;

  ApiException(this.message, {this.code, this.statusCode});

  @override
  String toString() => message;
}
