import { Router } from 'express';
import { ReferralsController } from './controllers/referrals.controller';
import { ReferralsService } from './services/referrals.service';
import { ReferralsRepository } from './repositories/referrals.repository';

export class ReferralsModule {
  public router = Router();
  constructor() {
    const referralsRepo = new ReferralsRepository();
    const service = new ReferralsService(referralsRepo);
    const controller = new ReferralsController(service, this.router);
  }
}
