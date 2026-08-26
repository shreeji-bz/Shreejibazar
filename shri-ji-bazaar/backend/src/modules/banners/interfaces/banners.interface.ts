import { BannerEntity } from '../entities/banner.entity';

export interface IBannersService {
  findAll(options?: any): Promise<{ data: BannerEntity[]; meta: any }>;
  findById(id: string): Promise<BannerEntity>;
  create(data: Partial<BannerEntity>): Promise<BannerEntity>;
  update(id: string, data: Partial<BannerEntity>): Promise<BannerEntity>;
  delete(id: string): Promise<void>;
}
