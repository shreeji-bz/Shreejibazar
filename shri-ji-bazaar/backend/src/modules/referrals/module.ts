import { Router } from 'express';
import { ReferralsController } from './controllers/referrals.controller';
import { ReferralsService } from './services/referrals.service';
import { ReferralRepository } from './repositories/referrals.repository';
import { PointsService } from '../points/services/points.service';
import { PointsRepository } from '../points/repositories/points.repository';

export class ReferralsModule {
  public router = Router();

  constructor() {
    const referralRepo = new ReferralRepository();
    const pointsRepo = new PointsRepository();
    const pointsService = new PointsService(pointsRepo);
    const service = new ReferralsService(referralRepo, pointsService);
    const controller = new ReferralsController(service, this.router);
  }
}
