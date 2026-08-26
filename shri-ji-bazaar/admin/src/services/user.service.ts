import { get, post, put, del } from './api';
import type { User, CreateUserRequest, UpdateUserRequest } from '../types/user.types';

export async function fetchUsers() { return get<User[]>('/admin/users'); }
export async function fetchUser(id: string) { return get<User>(`/admin/users/${id}`); }
export async function createUser(data: CreateUserRequest) { return post<User>('/admin/users', data); }
export async function updateUser(id: string, data: UpdateUserRequest) { return put<User>(`/admin/users/${id}`, data); }
export async function deleteUser(id: string) { return del<void>(`/admin/users/${id}`); }
