import { INotificationsRepository, NotificationsFindAllOptions } from '../interfaces/notifications.interface';
import { supabase } from '../../../config/database.config';
import { getPagination, getPaginationMeta } from '../../../common/utils/pagination.util';

export class NotificationsRepository implements INotificationsRepository {
  async findAll(options?: NotificationsFindAllOptions): Promise<{ data: any[]; total: number }> {
    let query = supabase.from('notifications').select('*', { count: 'exact' });

    if (options?.userId) {
      query = query.eq('user_id', options.userId);
    }

    if (options?.isRead !== undefined) {
      query = query.eq('is_read', options.isRead);
    }

    const { page = 1, limit = 20 } = options || {};
    const { offset } = getPagination({ page, limit });

    const { data, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const result = { data: data || [], total: count || 0 };
    (result as any).meta = getPaginationMeta(count || 0, page, limit);
    return result;
  }

  async findById(id: string): Promise<any | null> {
    const { data } = await supabase.from('notifications').select('*').eq('id', id).single();
    return data || null;
  }

  async create(data: Partial<any>): Promise<any> {
    const { data: record } = await supabase
      .from('notifications')
      .insert({
        user_id: data.userId || null,
        title: data.title,
        message: data.message,
        image: data.image || null,
        type: data.type,
        deep_link: data.deepLink || null,
        is_read: data.isRead || false,
        scheduled_at: data.scheduledAt || null,
        status: data.status || 'sent',
      })
      .select()
      .single();
    return record;
  }

  async createBulk(data: Partial<any>[]): Promise<any[]> {
    const rows = data.map((item) => ({
      user_id: item.userId || null,
      title: item.title,
      message: item.message,
      image: item.image || null,
      type: item.type,
      deep_link: item.deepLink || null,
      is_read: item.isRead || false,
      scheduled_at: item.scheduledAt || null,
      status: item.status || 'sent',
    }));

    const { data: records } = await supabase.from('notifications').insert(rows).select();
    return records || [];
  }

  async updateStatus(id: string, isRead: boolean): Promise<void> {
    await supabase.from('notifications').update({ is_read: isRead }).eq('id', id);
  }
}
