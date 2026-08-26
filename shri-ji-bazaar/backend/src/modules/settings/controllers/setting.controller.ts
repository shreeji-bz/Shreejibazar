import { Request, Response } from 'express';
import { SettingService } from '../services/setting.service';

export class SettingController {
  constructor(private settingService: SettingService, private router: any) {
    this.initializeRoutes();
  }
  initializeRoutes() {
    this.router.get('/', this.getAll.bind(this));
    this.router.get('/:key', this.getByKey.bind(this));
    this.router.put('/:key', this.set.bind(this));
  }
  async getAll(req: Request, res: Response) {
    try { const data = await this.settingService.getAll(); res.json({ success: true, data }); }
    catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
  }
  async getByKey(req: Request, res: Response) {
    try { const data = await this.settingService.get(req.params.key); res.json({ success: true, data }); }
    catch (error: any) { res.status(404).json({ success: false, message: error.message }); }
  }
  async set(req: Request, res: Response) {
    try {
      await this.settingService.set(req.params.key, req.body.value, req.body.type || 'string');
      res.json({ success: true, message: 'Setting updated' });
    } catch (error: any) { res.status(400).json({ success: false, message: error.message }); }
  }
}
