export interface ActivityEntity {
  id: string;
  userId: string;
  gameId?: string;
  roundId?: string;
  activityType: string;
  description: string;
  pointsChange: number;
  metadata: Record<string, any>;
  createdAt: string;
}
