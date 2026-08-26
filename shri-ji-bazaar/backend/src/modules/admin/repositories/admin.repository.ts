/**
 * Shri Ji Bazaar - Admin Repository (Supabase)
 */

import { supabase } from '../../../config/database.config';

export class AdminRepository {
  async findByEmail(email: string): Promise<any | null> {
    const { data } = await supabase.from('admins').select('*').eq('email', email).single();
    return data || null;
  }

  async findById(id: string): Promise<any | null> {
    const { data } = await supabase.from('admins').select('*').eq('id', id).single();
    return data || null;
  }

  async updateLastLogin(id: string): Promise<void> {
    await supabase.from('admins').update({ last_login: new Date().toISOString() }).eq('id', id);
  }

  async logAudit(data: any): Promise<void> {
    await supabase.from('audit_logs').insert({
      admin_id: data.adminId,
      action: data.action,
      entity: data.entity,
      entity_id: data.entityId,
      metadata: data.metadata || {},
      ip_address: data.ipAddress,
      user_agent: data.userAgent || '',
    });
  }

  async getAuditLogs(options: any = {}): Promise<any[]> {
    let query = supabase.from('audit_logs').select('*, admins(name, email)');
    if (options.adminId) query = query.eq('admin_id', options.adminId);
    if (options.entity) query = query.eq('entity', options.entity);
    if (options.action) query = query.eq('action', options.action);
    const { data } = await query.order('created_at', { ascending: false }).limit(options.limit || 50);
    return data || [];
  }
}
