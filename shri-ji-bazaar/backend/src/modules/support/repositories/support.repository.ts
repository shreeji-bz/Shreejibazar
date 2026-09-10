import { supabase } from '../../../config/database.config';

export class SupportRepository {
  async getTickets(userId?: string) {
    let query = supabase.from('support_tickets').select('*, support_messages(count)');
    if (userId) query = query.eq('user_id', userId);
    const { data } = await query.order('created_at', { ascending: false });
    return data || [];
  }

  async getTicket(id: string) {
    const { data } = await supabase
      .from('support_tickets')
      .select('*, support_messages(*)')
      .eq('id', id)
      .single();

    return data;
  }

  async create(data: { userId: string; subject: string; category: string; description: string }) {
    const { data: record } = await supabase.from('support_tickets').insert({
      ...data,
      status: 'open',
      priority: 'medium',
    }).select().single();
    return record;
  }

  async addMessage(data: { ticketId: string; userId: string; message: string; attachment?: string }) {
    return supabase.from('support_messages').insert({
      ticket_id: data.ticketId,
      sender_id: data.userId,
      sender_type: 'user',
      message: data.message,
      attachment: data.attachment,
    }).select().single();
  }

  async updateStatus(id: string, status: string) {
    return supabase.from('support_tickets').update({ status, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  }
}
