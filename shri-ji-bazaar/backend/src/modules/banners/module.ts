import { Router } from 'express';
import { BannerController } from './controllers/banner.controller';
import { BannerService } from './services/banner.service';
import { BannerRepository } from './repositories/banner.repository';
import { authenticateAdmin } from '../../common/middleware/admin.middleware';

export class BannersModule {
  public router = Router();
  public adminRouter = Router();

  constructor() {
    const repository = new BannerRepository();
    const service = new BannerService(repository);
    new BannerController(service, this.router);
    this.adminRouter.use(authenticateAdmin);
    new BannerController(service, this.adminRouter);
  }
}
