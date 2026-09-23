import { Router } from 'express';
import { PaymentsController } from './controllers/payments.controller';
import { AdminPaymentsController } from './controllers/admin-payments.controller';
import { PaymentsService } from './services/payments.service';
import { PaymentsRepository } from './repositories/payments.repository';

export class PaymentsModule {
  public router = Router();
  public adminRouter = Router();
  public imbRouter = Router(); // Public routes for IMB payment gateway callbacks

  constructor() {
    const repository = new PaymentsRepository();
    const service = new PaymentsService(repository);

    // User-facing routes (mounted with authenticateToken in app.ts)
    const controller = new PaymentsController(service, this.router);

    // Admin routes (mounted with authenticateAdmin in app.ts)
    new AdminPaymentsController(service, this.adminRouter);

    // IMB callback/webhook routes - mounted at /payments/imb/callback and /payments/imb/webhook in app.ts
    this.imbRouter.get('/', (req, res) => controller.imbCallback(req, res));
    this.imbRouter.post('/', (req, res) => controller.imbWebhook(req, res));
  }
}
