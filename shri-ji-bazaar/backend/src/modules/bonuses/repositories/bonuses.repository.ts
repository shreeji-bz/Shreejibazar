import { BonusEntity } from '../entities/bonus.entity';
import { supabase } from '../../../config/database.config';

export class BonusesRepository {
  async findAll(options: any = {}): Promise<BonusEntity[]> {
    let query = supabase.from('bonuses').select('*');

    if (options.active !== undefined) query = query.eq('is_active', options.active);
    if (options.type) query = query.eq('bonus_type', options.type);

    const { data } = await query.order('created_at', { ascending: false });
    return (data || []).map(this.mapRow);
  }

  async findById(id: string): Promise<BonusEntity | null> {
    const { data } = await supabase.from('bonuses').select('*').eq('id', id).single();
    return data ? this.mapRow(data) : null;
  }

  async claimBonus(userId: string, bonusId: string): Promise<any> {
    const bonus = await this.findById(bonusId);
    if (!bonus || !bonus.isActive) throw new Error('Bonus not available');

    const { data: existing } = await supabase.from('user_bonuses').select('*').eq('user_id', userId).eq('bonus_id', bonusId).single();
    if (existing) throw new Error('Bonus already claimed');

    const { data } = await supabase.from('user_bonuses').insert({
      user_id: userId,
      bonus_id: bonusId,
      points_awarded: bonus.pointsAmount,
    }).select().single();

    return { ...data, bonusName: bonus.name, pointsAwarded: bonus.pointsAmount };
  }

  async getUserClaimed(userId: string): Promise<any[]> {
    const { data } = await supabase
      .from('user_bonuses')
      .select('*, bonuses(name, description, bonus_type)')
      .eq('user_id', userId)
      .order('claimed_at', { ascending: false });

    return (data || []).map((row: any) => ({
      id: row.id,
      bonusId: row.bonus_id,
      bonusName: row.bonuses?.name,
      description: row.bonuses?.description,
      bonusType: row.bonuses?.bonus_type,
      pointsAwarded: row.points_awarded,
      claimedAt: row.claimed_at,
    }));
  }

  async create(data: Partial<BonusEntity>) {
    const { data: record } = await supabase.from('bonuses').insert({
      name: data.name,
      description: data.description,
      bonus_type: data.bonusType,
      points_amount: data.pointsAmount,
      min_deposit: data.minDeposit || 0,
      is_active: data.isActive ?? true,
      valid_from: data.validFrom,
      valid_until: data.validUntil,
      max_claims: data.maxClaims,
    }).select().single();

    if (!record) throw new Error('Failed to create bonus');
    return this.mapRow(record);
  }

  async update(id: string, data: Partial<BonusEntity>) {
    const updateData: any = { updated_at: new Date().toISOString() };
    if (data.name) updateData.name = data.name;
    if (data.description) updateData.description = data.description;
    if (data.bonusType) updateData.bonus_type = data.bonusType;
    if (data.pointsAmount !== undefined) updateData.points_amount = data.pointsAmount;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;
    if (data.validUntil !== undefined) updateData.valid_until = data.validUntil;

    const { data: record } = await supabase.from('bonuses').update(updateData).eq('id', id).select().single();
    if (!record) throw new Error('Bonus not found');
    return this.mapRow(record);
  }

  private mapRow(row: any): BonusEntity {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      bonusType: row.bonus_type,
      pointsAmount: row.points_amount,
      minDeposit: row.min_deposit,
      isActive: row.is_active,
      validFrom: row.valid_from,
      validUntil: row.valid_until,
      maxClaims: row.max_claims,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
