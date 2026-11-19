import { Router, Request, Response } from 'express';
import { RoundsController } from './controllers/rounds.controller';
import { RoundsService } from './services/rounds.service';
import { RoundsRepository } from './repositories/rounds.repository';
import { authenticateAdmin } from '../../common/middleware/admin.middleware';

export class RoundsModule {
  public router = Router();
  public adminRouter = Router();
  public service: RoundsService;

  constructor() {
    const repository = new RoundsRepository();
    this.service = new RoundsService(repository);
    new RoundsController(this.service, this.router);
    this.adminRouter.use(authenticateAdmin);
    new RoundsController(this.service, this.adminRouter);

    // Admin-only cron endpoint: auto-declare all closed rounds that have a pre-saved result
    this.adminRouter.post('/cron/auto-declare', async (_req: Request, res: Response) => {
      try {
        const count = await this.service.autoDeclareClosedRounds();
        res.json({ success: true, message: `Auto-declared ${count} round(s)`, count });
      } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
      }
    });
  }
}
