import { BannersEntity } from '../entities/banners.entity';

export interface IBannersService {
  findAll(options?: { page?: number; limit?: number }): Promise<BannersEntity[]>;
  findById(id: string): Promise<BannersEntity | null>;
  create(data: Partial<BannersEntity>): Promise<BannersEntity>;
  update(id: string, data: Partial<BannersEntity>): Promise<BannersEntity>;
  delete(id: string): Promise<void>;
}
