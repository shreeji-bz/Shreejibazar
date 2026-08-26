import { User } from './common.types';

export interface CreateUserRequest {
  name: string;
  email: string;
  mobile: string;
  password: string;
  role?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  mobile?: string;
  status?: string;
}
