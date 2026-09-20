import '../../../../../core/network/api_client.dart';
import '../models/profile_model.dart';

class ProfileDatasource {
  final ApiClient _apiClient = ApiClient();

  Future<ProfileModel> getProfile() async {
    final response = await _apiClient.dio.get('/users/me');
    final data = response.data is Map<String, dynamic> ? response.data['data'] as Map<String, dynamic>? ?? response.data : response.data;
    return ProfileModel.fromJson(data as Map<String, dynamic>);
  }

  Future<ProfileModel> updateProfile({String? name, String? email, String? mobile, String? avatar}) async {
    final body = <String, dynamic>{};
    if (name != null) body['name'] = name;
    if (email != null) body['email'] = email;
    if (mobile != null) body['mobile'] = mobile;
    if (avatar != null) body['avatar'] = avatar;

    final response = await _apiClient.dio.patch('/users/me', data: body);
    final data = response.data is Map<String, dynamic> ? response.data['data'] as Map<String, dynamic>? ?? response.data : response.data;
    return ProfileModel.fromJson(data as Map<String, dynamic>);
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
