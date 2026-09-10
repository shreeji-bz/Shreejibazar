import { supabase } from '../../../config/database.config';
import { ActivityEntity } from '../entities/activity.entity';

export class ActivitiesService {
  async getUserActivities(userId: string, options: any = {}): Promise<{ data: ActivityEntity[]; meta: any }> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, options.limit || 20);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count } = await supabase
      .from('activities')
      .select('*, games(name, image), rounds(round_number, status)', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    return {
      data: (data || []).map(this.mapRow),
      meta: { total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) },
    };
  }

  async logActivity(data: {
    userId: string;
    gameId?: string;
    roundId?: string;
    activityType: string;
    description: string;
    pointsChange?: number;
    metadata?: Record<string, any>;
  }) {
    const { data: record } = await supabase
      .from('activities')
      .insert({
        user_id: data.userId,
        game_id: data.gameId,
        round_id: data.roundId,
        activity_type: data.activityType,
        description: data.description,
        points_change: data.pointsChange || 0,
        metadata: data.metadata || {},
      })
      .select()
      .single();

    return this.mapRow(record);
  }

  private mapRow(row: any): ActivityEntity {
    return {
      id: row.id,
      userId: row.user_id,
      gameId: row.game_id,
      roundId: row.round_id,
      activityType: row.activity_type,
      description: row.description,
      pointsChange: row.points_change,
      metadata: row.metadata,
      createdAt: row.created_at,
    };
  }
}
