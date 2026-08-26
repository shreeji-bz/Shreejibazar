/**
 * Shri Ji Bazaar - Banners Repository (Supabase)
 */

import { supabase } from '../../../config/database.config';

export class BannerRepository {
  async findAll(options?: any): Promise<{ data: any[]; meta: any }> {
    let query = supabase.from('banners').select('*');
    if (options?.status) query = query.eq('status', options.status);
    const { data } = await query.order('sort_order', { ascending: true }).order('created_at', { ascending: false });
    return { data: data || [], meta: { total: data?.length || 0 } };
  }

  async findById(id: string): Promise<any | null> {
    const { data } = await supabase.from('banners').select('*').eq('id', id).single();
    return data || null;
  }

  async create(data: any): Promise<any> {
    const { data: record } = await supabase.from('banners').insert({
      title: data.title,
      image: data.image,
      description: data.description || '',
      action: data.action,
      action_value: data.actionValue || '',
      status: data.status || 'active',
      sort_order: data.sortOrder || 0,
      start_date: data.startDate || null,
      end_date: data.endDate || null,
    }).select().single();
    return record;
  }

  async update(id: string, data: any): Promise<any> {
    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.image) updateData.image = data.image;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.action) updateData.action = data.action;
    if (data.actionValue !== undefined) updateData.action_value = data.actionValue;
    if (data.status) updateData.status = data.status;
    if (data.sortOrder !== undefined) updateData.sort_order = data.sortOrder;
    updateData.updated_at = new Date().toISOString();

    const { data: record } = await supabase.from('banners').update(updateData).eq('id', id).select().single();
    return record;
  }

  async delete(id: string): Promise<void> {
    await supabase.from('banners').update({ status: 'inactive', updated_at: new Date().toISOString() }).eq('id', id);
  }
}
