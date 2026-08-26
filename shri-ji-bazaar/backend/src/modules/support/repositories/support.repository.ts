/**
 * Shri Ji Bazaar - Support Repository (Supabase)
 */

import { supabase } from '../../../config/database.config';

export class SupportRepository {
  async findAll(options: any = {}): Promise<{ data: any[]; meta: any }> {
    let query = supabase.from('support_tickets').select('*', { count: 'exact' });
    if (options.userId) query = query.eq('user_id', options.userId);
    if (options.status) query = query.eq('status', options.status);
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, options.limit || 20);
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, count } = await query.order('created_at', { ascending: false }).range(from, to);
    return { data: data || [], meta: { total: count || 0, page, limit } };
  }

  async findById(id: string): Promise<any | null> {
    const { data } = await supabase.from('support_tickets').select('*').eq('id', id).single();
    return data || null;
  }

  async create(data: any): Promise<any> {
    const { data: record } = await supabase.from('support_tickets').insert({
      user_id: data.userId,
      subject: data.subject,
      category: data.category,
      description: data.description,
      attachment: data.attachment || '',
      status: 'open',
      priority: data.priority || 'medium',
    }).select().single();
    return record;
  }

  async update(id: string, data: any): Promise<any> {
    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.priority) updateData.priority = data.priority;
    if (data.status === 'resolved' || data.status === 'closed') updateData.resolved_at = new Date().toISOString();
    updateData.updated_at = new Date().toISOString();

    const { data: record } = await supabase.from('support_tickets').update(updateData).eq('id', id).select().single();
    return record;
  }

  async addMessage(data: any): Promise<any> {
    const { data: record } = await supabase.from('support_messages').insert({
      ticket_id: data.ticketId,
      sender_id: data.senderId,
      sender_type: data.senderType,
      message: data.message,
      attachment: data.attachment || '',
    }).select().single();
    return record;
  }

  async getMessages(ticketId: string): Promise<any[]> {
    const { data } = await supabase.from('support_messages').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true });
    return data || [];
  }
}
