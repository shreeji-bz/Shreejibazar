/**
 * Shri Ji Bazaar - Bonuses Repository (Supabase)
 */

import { supabase } from '../../../config/database.config';
import type {
  BonusEntity,
  FindAllOptions,
  FindAllResult,
  IBonusRepository,
  IBonusClaimRepository,
} from '../interfaces/bonuses.interface';
import { getPagination, getPaginationMeta } from '../../../common/utils/pagination.util';

const TABLE = 'bonuses';

export class BonusRepository implements IBonusRepository {
  async findAll(options: FindAllOptions): Promise<FindAllResult> {
    const { status, type, page = 1, limit = 20 } = options;
    const { offset } = getPagination({ page, limit });

    let query = supabase.from(TABLE).select('*', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (type) query = query.eq('type', type);

    const from = offset;
    const to = offset + limit - 1;

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message);

    const total = count || 0;
    return {
      data: (data || []).map(this.mapRow),
      meta: getPaginationMeta(total, page, limit),
    };
  }

  async findById(id: string): Promise<BonusEntity | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapRow(data);
  }

  async findActiveBySlug(slug: string): Promise<BonusEntity | null> {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .lte('start_date', now)
      .gte('end_date', now)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapRow(data);
  }

  async create(data: Partial<BonusEntity>): Promise<BonusEntity> {
    const payload: Record<string, unknown> = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      points: data.points,
      type: data.type,
      status: data.status || 'draft',
      rules: data.rules || null,
    };

    if (data.startDate) payload.start_date = data.startDate.toISOString();
    if (data.endDate) payload.end_date = data.endDate.toISOString();

    const { data: record, error } = await supabase
      .from(TABLE)
      .insert(payload)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapRow(record);
  }

  async update(id: string, data: Partial<BonusEntity>): Promise<BonusEntity> {
    const payload: Record<string, unknown> = {};

    if (data.name !== undefined) payload.name = data.name;
    if (data.slug !== undefined) payload.slug = data.slug;
    if (data.description !== undefined) payload.description = data.description;
    if (data.points !== undefined) payload.points = data.points;
    if (data.type !== undefined) payload.type = data.type;
    if (data.status !== undefined) payload.status = data.status;
    if (data.rules !== undefined) payload.rules = data.rules;
    if (data.startDate !== undefined) payload.start_date = data.startDate.toISOString();
    if (data.endDate !== undefined) payload.end_date = data.endDate.toISOString();

    const { data: record, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapRow(record);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  private mapRow(row: Record<string, unknown>): BonusEntity {
    return {
      id: row.id as string,
      name: row.name as string,
      slug: row.slug as string,
      description: row.description as string,
      points: row.points as number,
      type: row.type as string,
      status: row.status as string,
      startDate: row.start_date ? new Date(row.start_date as string) : undefined,
      endDate: row.end_date ? new Date(row.end_date as string) : undefined,
      rules: (row.rules as Record<string, any>) || undefined,
      createdAt: row.created_at ? new Date(row.created_at as string) : new Date(),
      updatedAt: row.updated_at ? new Date(row.updated_at as string) : new Date(),
    };
  }
}

/**
 * Shri Ji Bazaar - Bonus Claims Repository (Supabase)
 */

const CLAIM_TABLE = 'bonus_claims';

export class BonusClaimRepository implements IBonusClaimRepository {
  async findByUserAndBonus(userId: string, bonusId: string): Promise<any | null> {
    const { data, error } = await supabase
      .from(CLAIM_TABLE)
      .select('*')
      .eq('user_id', userId)
      .eq('bonus_id', bonusId)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  }

  async create(data: { userId: string; bonusId: string; pointsEarned: number }): Promise<any> {
    const { data: record, error } = await supabase
      .from(CLAIM_TABLE)
      .insert({
        user_id: data.userId,
        bonus_id: data.bonusId,
        points_earned: data.pointsEarned,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return record;
  }

  async findByUserId(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from(CLAIM_TABLE)
      .select('*, bonuses(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }
}
