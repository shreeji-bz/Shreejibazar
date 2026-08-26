import { Request, Response } from 'express';
import { SupportService } from '../services/support.service';

export class SupportController {
  constructor(private supportService: SupportService, private router: any) {
    this.initializeRoutes();
  }
  initializeRoutes() {
    this.router.get('/', this.getAll.bind(this));
    this.router.get('/:id', this.getById.bind(this));
    this.router.post('/', this.create.bind(this));
    this.router.patch('/:id', this.update.bind(this));
    this.router.post('/:id/messages', this.addMessage.bind(this));
  }
  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const data = await this.supportService.getAll({ ...req.query, userId });
      res.json({ success: true, ...data });
    } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
  }
  async getById(req: Request, res: Response) {
    try { const data = await this.supportService.getById(req.params.id); res.json({ success: true, data }); }
    catch (error: any) { res.status(404).json({ success: false, message: error.message }); }
  }
  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const data = await this.supportService.create({ ...req.body, userId });
      res.status(201).json({ success: true, data });
    } catch (error: any) { res.status(400).json({ success: false, message: error.message }); }
  }
  async update(req: Request, res: Response) {
    try { const data = await this.supportService.update(req.params.id, req.body); res.json({ success: true, data }); }
    catch (error: any) { res.status(400).json({ success: false, message: error.message }); }
  }
  async addMessage(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const data = await this.supportService.addMessage({ ...req.body, ticketId: req.params.id, senderId: userId, senderType: 'user' });
      res.status(201).json({ success: true, data });
    } catch (error: any) { res.status(400).json({ success: false, message: error.message }); }
  }
}
