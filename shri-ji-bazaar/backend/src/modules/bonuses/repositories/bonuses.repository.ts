import { BonusEntity } from '../entities/bonus.entity';
import { supabase } from '../../../config/database.config';

function slugify(name: string): string {
  return (name || 'bonus')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export class BonusesRepository {
  async findAll(options: any = {}): Promise<BonusEntity[]> {
    let query = supabase.from('bonuses').select('*');

    // Live schema: `type` and `status` columns (no bonus_type / is_active).
    if (options.active !== undefined) {
      query = query.eq('status', options.active === true || options.active === 'true' ? 'active' : 'inactive');
    }
    if (options.status) query = query.eq('status', options.status);
    if (options.type) query = query.eq('type', options.type);

    const { data } = await query.order('created_at', { ascending: false });
    return (data || []).map(this.mapRow);
  }

  async findById(id: string): Promise<BonusEntity | null> {
    const { data } = await supabase.from('bonuses').select('*').eq('id', id).single();
    return data ? this.mapRow(data) : null;
  }

  async claimBonus(userId: string, bonusId: string): Promise<any> {
    const bonus = await this.findById(bonusId);
    if (!bonus || bonus.status !== 'active') throw new Error('Bonus not available');

    // Live DB has no user_bonuses table; the claim table was never migrated.
    // Return the bonus detail so the client can proceed; no per-user ledger.
    return { bonusId, bonusName: bonus.name, pointsAwarded: bonus.points, userId };
  }

  async getUserClaimed(userId: string): Promise<any[]> {
    // No user_bonuses table live; nothing to list yet.
    return [];
  }

  async create(data: Partial<BonusEntity>) {
    const { data: record } = await supabase
      .from('bonuses')
      .insert({
        name: data.name,
        slug: data.slug || slugify(String(data.name || '')),
        description: data.description || '',
        points: data.points ?? 0,
        type: data.type || 'signup',
        status: data.status || 'active',
        start_date: data.startDate,
        end_date: data.endDate,
        rules: data.rules,
      })
      .select()
      .single();

    if (!record) throw new Error('Failed to create bonus');
    return this.mapRow(record);
  }

  async update(id: string, data: Partial<BonusEntity>) {
    const updateData: any = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.points !== undefined) updateData.points = data.points;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.startDate !== undefined) updateData.start_date = data.startDate;
    if (data.endDate !== undefined) updateData.end_date = data.endDate;
    if (data.rules !== undefined) updateData.rules = data.rules;

    const { data: record } = await supabase.from('bonuses').update(updateData).eq('id', id).select().single();
    if (!record) throw new Error('Bonus not found');
    return this.mapRow(record);
  }

  private mapRow(row: any): BonusEntity {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      points: row.points,
      type: row.type,
      status: row.status,
      startDate: row.start_date,
      endDate: row.end_date,
      rules: row.rules,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
