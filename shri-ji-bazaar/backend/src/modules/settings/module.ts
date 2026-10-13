import { Router } from 'express';
import { SettingsController } from './controllers/settings.controller';
import { SettingsService } from './services/settings.service';
import { SettingsRepository } from './repositories/settings.repository';
import { authenticateAdmin } from '../../common/middleware/admin.middleware';

export class SettingsModule {
  public router = Router();
  public adminRouter = Router();

  constructor() {
    const repository = new SettingsRepository();
    const service = new SettingsService(repository);
    new SettingsController(service, this.router);
    this.adminRouter.use(authenticateAdmin);
    new SettingsController(service, this.adminRouter);
  }
}
