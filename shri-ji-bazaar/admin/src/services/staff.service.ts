import { get, post, patch, del } from './api';

export interface StaffMember {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin' | 'moderator';
  status: 'active' | 'inactive';
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateStaffInput {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'super_admin' | 'moderator';
}

export const getStaff = async (): Promise<StaffMember[]> => {
  const res = await get<any>('/v1/admin/staff');
  const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
  return arr as StaffMember[];
};

export const getStaffById = async (id: string): Promise<StaffMember> => {
  const res = await get<any>(`/v1/admin/staff/${id}`);
  return res?.data as StaffMember;
};

export const createStaff = async (payload: CreateStaffInput): Promise<StaffMember> => {
  const res = await post<any>('/v1/admin/staff', payload);
  return res?.data as StaffMember;
};

export const updateStaff = async (id: string, payload: Partial<CreateStaffInput> & { status?: 'active' | 'inactive' }): Promise<StaffMember> => {
  const res = await patch<any>(`/v1/admin/staff/${id}`, payload);
  return res?.data as StaffMember;
};

export const deleteStaff = async (id: string): Promise<void> => {
  await del<any>(`/v1/admin/staff/${id}`);
};

export const toggleStaffStatus = async (id: string): Promise<StaffMember> => {
  const res = await patch<any>(`/v1/admin/staff/${id}/toggle-status`, {});
  return res?.data as StaffMember;
};
