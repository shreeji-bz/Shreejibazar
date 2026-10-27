import { GameEntity } from '../entities/game.entity';
import { supabase } from '../../../config/database.config';

export class GameRepository {
  async findById(id: string): Promise<GameEntity | null> {
    const { data } = await supabase.from('games').select('*').eq('id', id).single();
    return data ? this.mapRow(data) : null;
  }

  async findBySlug(slug: string): Promise<GameEntity | null> {
    const { data } = await supabase.from('games').select('*').eq('slug', slug).single();
    return data ? this.mapRow(data) : null;
  }

  async findAll(options: any = {}): Promise<{ data: GameEntity[]; meta: any }> {
    let query = supabase.from('games').select('*', { count: 'exact' });

    if (options.search) {
      query = query.or(`name.ilike.%${options.search}%,slug.ilike.%${options.search}%`);
    }
    if (options.status) query = query.eq('status', options.status);
    if (options.popular) query = query.eq('is_popular', true);

    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, options.limit || 20);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count } = await query.order('sort_order').order('name').range(from, to);

    return {
      data: (data || []).map(this.mapRow),
      meta: { total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) },
    };
  }

  async findPopular(): Promise<GameEntity[]> {
    const { data } = await supabase.from('games').select('*').eq('status', 'active').eq('is_popular', true).order('sort_order');
    return (data || []).map(this.mapRow);
  }

  async findRecent(limit = 10): Promise<GameEntity[]> {
    const { data } = await supabase
      .from('games')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);
    return (data || []).map(this.mapRow);
  }

  async create(data: Partial<GameEntity>): Promise<GameEntity> {
    const { data: record } = await supabase.from('games').insert({
      name: data.name,
      slug: data.slug,
      description: data.description || '',
      image: data.image || '',
      opening_time: data.openingTime,
      closing_time: data.closingTime,
      result_time: data.resultTime,
      status: data.status || 'active',
      is_popular: data.isPopular || false,
      sort_order: data.sortOrder || 0,
    }).select().single();

    if (!record) throw new Error('Failed to create game');
    return this.mapRow(record);
  }

  async update(id: string, data: Partial<GameEntity>): Promise<GameEntity> {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.openingTime) updateData.opening_time = data.openingTime;
    if (data.closingTime) updateData.closing_time = data.closingTime;
    if (data.resultTime) updateData.result_time = data.resultTime;
    if (data.status) updateData.status = data.status;
    if (data.isPopular !== undefined) updateData.is_popular = data.isPopular;
    if (data.sortOrder !== undefined) updateData.sort_order = data.sortOrder;
    updateData.updated_at = new Date().toISOString();

    const { data: record } = await supabase.from('games').update(updateData).eq('id', id).select().single();
    if (!record) throw new Error('Game not found after update');
    return this.mapRow(record);
  }

  async delete(id: string): Promise<void> {
    await supabase.from('games').update({ status: 'inactive', updated_at: new Date().toISOString() }).eq('id', id);
  }

  async latestDeclaredResultsForGames(ids: string[]): Promise<Map<string, { result: string; at: string }>> {
    const out = new Map<string, { result: string; at: string }>();
    if (!ids.length) return out;
    const { data } = await supabase
      .from('rounds')
      .select('id, game_id, result, updated_at')
      .in('game_id', ids)
      .eq('status', 'result_declared')
      .not('result', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(200);
    for (const row of data || []) {
      if (!out.has(row.game_id)) out.set(row.game_id, { result: row.result, at: row.updated_at });
    }
    return out;
  }

  async playConfigsForSlugs(slugs: string[]): Promise<Map<string, any>> {
    const out = new Map<string, any>();
    if (!slugs.length) return out;
    const keys = slugs.map((s) => `play_config.${s}`);
    const { data } = await supabase.from('settings').select('key, value').in('key', keys);
    for (const row of data || []) {
      const slug = row.key.replace('play_config.', '');
      let parsed: any = row.value;
      if (typeof row.value === 'string') {
        try { parsed = JSON.parse(row.value); } catch { parsed = {}; }
      }
      out.set(slug, parsed && typeof parsed === 'object' ? parsed : {});
    }
    return out;
  }

  async toggleStatus(id: string, status: 'active' | 'inactive' | 'maintenance'): Promise<GameEntity> {
    const { data: record } = await supabase
      .from('games')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (!record) throw new Error('Game not found');
    return this.mapRow(record);
  }

  private mapRow(row: any): GameEntity {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      image: row.image,
      openingTime: row.opening_time,
      closingTime: row.closing_time,
      resultTime: row.result_time,
      status: row.status,
      isPopular: row.is_popular,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
