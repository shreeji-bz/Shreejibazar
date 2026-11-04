import { get, post, del, patch } from './api';
import type { User, CreateUserRequest, UpdateUserRequest } from '../types/user.types';

export async function fetchUsers() { return get<User[]>('/v1/users'); }
export async function fetchUser(id: string) { return get<User>(`/v1/users/${id}`); }
export async function createUser(data: CreateUserRequest) { return post<User>('/v1/users', data); }
export async function updateUser(id: string, data: UpdateUserRequest) { return patch<User>(`/v1/users/${id}`, data); }
export async function deleteUser(id: string) { return del<void>(`/v1/users/${id}`); }
