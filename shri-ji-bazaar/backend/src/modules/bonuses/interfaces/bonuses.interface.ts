import type { BonusEntity } from '../entities/bonus.entity';
export type { BonusEntity } from '../entities/bonus.entity';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FindAllOptions {
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export interface FindAllResult {
  data: BonusEntity[];
  meta: PaginationMeta;
}

export interface IBonusRepository {
  findAll(options: FindAllOptions): Promise<FindAllResult>;
  findById(id: string): Promise<BonusEntity | null>;
  findActiveBySlug(slug: string): Promise<BonusEntity | null>;
  create(data: Partial<BonusEntity>): Promise<BonusEntity>;
  update(id: string, data: Partial<BonusEntity>): Promise<BonusEntity>;
  delete(id: string): Promise<void>;
}

export interface IBonusClaimRepository {
  create(data: { userId: string; bonusId: string; pointsEarned: number }): Promise<any>;
  findByUserAndBonus(userId: string, bonusId: string): Promise<any | null>;
  findByUserId(userId: string): Promise<any[]>;
}

export interface IBonusService {
  findAll(options: FindAllOptions): Promise<FindAllResult>;
  findById(id: string): Promise<BonusEntity | null>;
  findActiveBySlug(slug: string): Promise<BonusEntity | null>;
  create(data: Partial<BonusEntity>): Promise<BonusEntity>;
  update(id: string, data: Partial<BonusEntity>): Promise<BonusEntity>;
  delete(id: string): Promise<void>;
  claim(userId: string, bonusId: string): Promise<{ points: number; claimedAt: Date }>;
  getUserClaims(userId: string): Promise<any[]>;
}
