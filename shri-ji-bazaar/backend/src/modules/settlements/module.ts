import { Router } from 'express';
import { SettlementsController } from './controllers/settlements.controller';
import { SettlementsService } from './services/settlements.service';
import { SettlementsRepository } from './repositories/settlements.repository';

export class SettlementsModule {
  public router = Router();

  constructor() {
    const repository = new SettlementsRepository();
    const service = new SettlementsService(repository);
    const controller = new SettlementsController(service, this.router);
  }
}
