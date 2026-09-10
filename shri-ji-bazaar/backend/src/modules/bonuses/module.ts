import { Router } from 'express';
import { BonusesController } from './controllers/bonuses.controller';
import { BonusesService } from './services/bonuses.service';
import { BonusesRepository } from './repositories/bonuses.repository';

export class BonusesModule {
  public router = Router();
  constructor() {
    const repository = new BonusesRepository();
    const service = new BonusesService(repository);
    const controller = new BonusesController(service, this.router);
  }
}
