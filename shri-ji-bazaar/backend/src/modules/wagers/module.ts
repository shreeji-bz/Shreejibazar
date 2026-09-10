import { Router } from 'express';
import { WagersController } from './controllers/wagers.controller';
import { WagersService } from './services/wagers.service';
import { WagersRepository } from './repositories/wagers.repository';

export class WagersModule {
  public router = Router();
  constructor() {
    const repository = new WagersRepository();
    const service = new WagersService(repository);
    const controller = new WagersController(service, repository, this.router);
  }
}
