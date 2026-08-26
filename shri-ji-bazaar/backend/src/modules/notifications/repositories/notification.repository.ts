/**
 * Shri Ji Bazaar - Notifications Repository (Supabase)
 */

import { supabase } from '../../../config/database.config';

export class NotificationRepository {
  async findByUserId(userId: string, options?: any): Promise<{ data: any[]; total: number }> {
    let query = supabase.from('notifications').select('*', { count: 'exact' }).eq('user_id', userId);
    if (options?.isRead !== undefined) query = query.eq('is_read', options.isRead);
    const page = Math.max(1, parseInt(options?.page || '1'));
    const limit = Math.min(100, parseInt(options?.limit || '20'));
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, count } = await query.order('created_at', { ascending: false }).range(from, to);
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data } = await supabase.from('notifications').select('*').eq('id', id).single();
    return data || null;
  }

  async markAsRead(id: string): Promise<void> {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
  }

  async getUnreadCount(userId: string): Promise<number> {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    return count || 0;
  }

  async create(data: any): Promise<any> {
    const { data: record } = await supabase.from('notifications').insert(data).select().single();
    return record;
  }
}
