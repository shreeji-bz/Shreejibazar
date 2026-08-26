import { post } from './api';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

export async function loginAdmin(data: LoginRequest) {
  return post<LoginResponse>('/auth/admin/login', data);
}
