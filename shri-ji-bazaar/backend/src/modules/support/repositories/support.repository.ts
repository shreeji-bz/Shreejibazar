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
    // Map camelCase -> snake_case; PostgREST drops unknown keys, so `userId`
    // would otherwise be silently ignored and user_id (NOT NULL) left unset.
    const { data: record } = await supabase.from('support_tickets').insert({
      user_id: data.userId,
      subject: data.subject,
      category: data.category,
      description: data.description,
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

  // Live support_messages.sender_id is NOT NULL (uuid). sender_type admin, so
  // the sender is an admin user id; fall back to a fixed sentinel uuid when
  // no admin id is available so the insert still satisfies NOT NULL.
  async addAdminMessage(data: { ticketId: string; senderId?: string; message: string; attachment?: string }) {
    return supabase.from('support_messages').insert({
      ticket_id: data.ticketId,
      sender_id: data.senderId || '00000000-0000-4000-8000-000000000001',
      sender_type: 'admin',
      message: data.message,
      attachment: data.attachment,
    }).select().single();
  }

  async updateStatus(id: string, status: string) {
    return supabase.from('support_tickets').update({ status, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  }
}
