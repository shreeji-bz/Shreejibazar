// Live Supabase schema: bonuses(id, name, slug, description, points, type,
// status, start_date, end_date, rules, created_at, updated_at).
// No is_active/points_amount/bonus_type columns; status is text ('active'/'inactive').
export interface BonusEntity {
  id: string;
  name: string;
  slug: string;
  description: string;
  points: number;
  type: string;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  rules?: string | null;
  createdAt: string;
  updatedAt: string;
}
