import { Router } from 'express';
import { BonusController } from './controllers/bonuses.controller';
import { BonusService } from './services/bonuses.service';
import { BonusRepository, BonusClaimRepository } from './repositories/bonuses.repository';
import { PointsService } from '../points/services/points.service';
import { PointsRepository } from '../points/repositories/points.repository';

export class BonusesModule {
  public router = Router();
  constructor() {
    const bonusRepo = new BonusRepository();
    const bonusClaimRepo = new BonusClaimRepository();
    const pointsRepo = new PointsRepository();
    const pointsService = new PointsService(pointsRepo);
    const service = new BonusService(bonusRepo, bonusClaimRepo, pointsService);
    const controller = new BonusController(service, this.router);
  }
}
