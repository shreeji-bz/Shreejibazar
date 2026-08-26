export interface BonusEntity {
  id: string;
  name: string;
  slug: string;
  description: string;
  points: number;
  type: string;
  status: string;
  startDate?: Date;
  endDate?: Date;
  rules?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
