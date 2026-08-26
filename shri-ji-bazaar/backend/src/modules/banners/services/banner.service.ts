import { BannerRepository } from '../repositories/banner.repository';

export class BannerService {
  constructor(private bannerRepository: BannerRepository) {}

  async getAll(options?: any) {
    return this.bannerRepository.findAll(options);
  }

  async getById(id: string) {
    const banner = await this.bannerRepository.findById(id);
    if (!banner) throw new Error('Banner not found');
    return banner;
  }

  async create(data: any) {
    return this.bannerRepository.create(data);
  }

  async update(id: string, data: any) {
    return this.bannerRepository.update(id, data);
  }

  async delete(id: string) {
    return this.bannerRepository.delete(id);
  }
}
