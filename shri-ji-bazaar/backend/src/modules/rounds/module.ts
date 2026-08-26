import { Router } from 'express';
import { RoundsController } from './controllers/rounds.controller';
import { RoundsService } from './services/rounds.service';
import { RoundsRepository } from './repositories/rounds.repository';

export class RoundsModule {
  public router = Router();

  constructor() {
    const repository = new RoundsRepository();
    const service = new RoundsService(repository);
    const controller = new RoundsController(service, this.router);
  }
}
