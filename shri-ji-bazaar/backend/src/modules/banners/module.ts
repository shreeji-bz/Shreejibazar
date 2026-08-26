import { Router } from 'express';
import { BannerController } from './controllers/banner.controller';
import { BannerService } from './services/banner.service';
import { BannerRepository } from './repositories/banner.repository';

export class BannersModule {
  public router = Router();
  constructor() {
    const repository = new BannerRepository();
    const service = new BannerService(repository);
    const controller = new BannerController(service, this.router);
  }
}
