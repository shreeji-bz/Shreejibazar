import { Router } from 'express';
import { SettingsController } from './controllers/settings.controller';
import { SettingsService } from './services/settings.service';
import { SettingsRepository } from './repositories/settings.repository';

export class SettingsModule {
  public router = Router();
  constructor() {
    const repository = new SettingsRepository();
    const service = new SettingsService(repository);
    const controller = new SettingsController(service, this.router);
  }
}
