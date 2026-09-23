import { supabase } from '../../../config/database.config';

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

export interface UpdateStaffInput {
  name?: string;
  email?: string;
  role?: 'admin' | 'super_admin' | 'moderator';
  status?: 'active' | 'inactive';
  password?: string;
}

export class StaffService {
  async getAllStaff(): Promise<StaffMember[]> {
    const { data, error } = await supabase
      .from('admins')
      .select('id, email, name, role, status, last_login, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch staff:', JSON.stringify(error));
      throw new Error('Failed to fetch staff members');
    }

    return (data || []) as StaffMember[];
  }

  async getStaffById(id: string): Promise<StaffMember | null> {
    const { data, error } = await supabase
      .from('admins')
      .select('id, email, name, role, status, last_login, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return data as StaffMember;
  }

  async createStaff(input: CreateStaffInput): Promise<StaffMember> {
    const { email, password, name, role = 'admin' } = input;

    // Check if email already exists
    const { data: existing } = await supabase
      .from('admins')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      throw new Error('An admin with this email already exists');
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('admins')
      .insert({
        email,
        password_hash: passwordHash,
        name,
        role,
        status: 'active',
      })
      .select('id, email, name, role, status, created_at, updated_at')
      .single();

    if (error || !data) {
      console.error('Failed to create staff:', JSON.stringify(error));
      throw new Error(error?.message || 'Failed to create staff member');
    }

    return data as StaffMember;
  }

  async updateStaff(id: string, input: UpdateStaffInput): Promise<StaffMember> {
    const updateData: Record<string, any> = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.email !== undefined) updateData.email = input.email;
    if (input.role !== undefined) updateData.role = input.role;
    if (input.status !== undefined) updateData.status = input.status;

    if (input.password) {
      const bcrypt = await import('bcryptjs');
      updateData.password_hash = await bcrypt.hash(input.password, 10);
    }

    const { data, error } = await supabase
      .from('admins')
      .update(updateData)
      .eq('id', id)
      .select('id, email, name, role, status, last_login, created_at, updated_at')
      .single();

    if (error || !data) {
      console.error('Failed to update staff:', JSON.stringify(error));
      throw new Error(error?.message || 'Failed to update staff member');
    }

    return data as StaffMember;
  }

  async deleteStaff(id: string): Promise<void> {
    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete staff:', JSON.stringify(error));
      throw new Error('Failed to delete staff member');
    }
  }

  async toggleStaffStatus(id: string, currentStatus: string): Promise<StaffMember> {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    return this.updateStaff(id, { status: newStatus });
  }
}
