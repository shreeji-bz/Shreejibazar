import { supabase } from '../../../config/database.config';

export class NotificationsRepository {
  async getForUser(userId: string, page = 1, limit = 20) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order('created_at', { ascending: false })
      .range(from, to);

    return { data: data || [], total: count || 0 };
  }

  async getUnreadCount(userId: string) {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .or(`user_id.eq.${userId},user_id.is.null`)
      .eq('is_read', false);

    return count || 0;
  }

  async markAsRead(id: string) {
    await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', id);
  }

  async markAllAsRead(userId: string) {
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .or(`user_id.eq.${userId},user_id.is.null`)
      .eq('is_read', false);
  }

  async create(data: { title: string; message: string; type?: string; userId?: string }) {
    return supabase.from('notifications').insert({
      ...data,
      type: data.type || 'info',
      data: {},
      is_read: false,
    }).select().single();
  }
}
