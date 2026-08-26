import 'dart:convert';
import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../models/profile_model.dart';

class ProfileDatasource {
  final ApiClient _apiClient = ApiClient();

  Future<ProfileModel> getProfile() async {
    final response = await _apiClient.dio.get('/users/me');
    return ProfileModel.fromJson(response.data['data']);
  }

  Future<ProfileModel> updateProfile({String? name, String? email, String? avatar}) async {
    final body = <String, dynamic>{};
    if (name != null) body['name'] = name;
    if (email != null) body['email'] = email;
    if (avatar != null) body['avatar'] = avatar;

    final response = await _apiClient.dio.patch('/users/me', data: body);
    return ProfileModel.fromJson(response.data['data']);
  }

  Future<void> changePassword({required String currentPassword, required String newPassword}) async {
    await _apiClient.dio.post('/users/me/change-password', data: {
      'currentPassword': currentPassword,
      'newPassword': newPassword,
    });
  }

  Future<void> deleteAccount(String password) async {
    await _apiClient.dio.delete('/users/me', data: { 'password': password });
  }
}
