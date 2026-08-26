import { Router } from 'express';
import { GamesController } from './controllers/games.controller';
import { GamesService } from './services/games.service';
import { GameRepository } from './repositories/games.repository';

export class GamesModule {
  public router = Router();
  constructor() {
    const repository = new GameRepository();
    const service = new GamesService(repository);
    const controller = new GamesController(service, this.router);
  }
}
