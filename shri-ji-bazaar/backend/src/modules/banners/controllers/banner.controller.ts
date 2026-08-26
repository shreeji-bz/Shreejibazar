import { Request, Response } from 'express';
import { BannerService } from '../services/banner.service';

export class BannerController {
  constructor(private bannerService: BannerService, private router: any) {
    this.initializeRoutes();
  }
  initializeRoutes() {
    this.router.get('/', this.getAll.bind(this));
    this.router.get('/:id', this.getById.bind(this));
    this.router.post('/', this.create.bind(this));
    this.router.patch('/:id', this.update.bind(this));
    this.router.delete('/:id', this.delete.bind(this));
  }
  async getAll(req: Request, res: Response) {
    try { const data = await this.bannerService.getAll(req.query); res.json({ success: true, ...data }); }
    catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
  }
  async getById(req: Request, res: Response) {
    try { const data = await this.bannerService.getById(req.params.id); res.json({ success: true, data }); }
    catch (error: any) { res.status(404).json({ success: false, message: error.message }); }
  }
  async create(req: Request, res: Response) {
    try { const data = await this.bannerService.create(req.body); res.status(201).json({ success: true, data }); }
    catch (error: any) { res.status(400).json({ success: false, message: error.message }); }
  }
  async update(req: Request, res: Response) {
    try { const data = await this.bannerService.update(req.params.id, req.body); res.json({ success: true, data }); }
    catch (error: any) { res.status(400).json({ success: false, message: error.message }); }
  }
  async delete(req: Request, res: Response) {
    try { await this.bannerService.delete(req.params.id); res.json({ success: true, message: 'Banner deleted' }); }
    catch (error: any) { res.status(400).json({ success: false, message: error.message }); }
  }
}
