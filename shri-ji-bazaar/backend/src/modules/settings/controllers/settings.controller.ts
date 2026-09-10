import { Request, Response } from 'express';
import { supabase } from '../../../config/database.config';

export class SettingsController {
  constructor(private settingsService: any, private router: any) {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get('/', this.getAll.bind(this));
    this.router.get('/:key', this.getByKey.bind(this));
    this.router.put('/:key', this.updateSetting.bind(this));
    this.router.put('/', this.updateMultiple.bind(this));
  }

  async getAll(req: Request, res: Response) {
    try {
      const data = await this.settingsService.getAll();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getByKey(req: Request, res: Response) {
    try {
      const data = await this.settingsService.getByKey(req.params.key);
      if (!data) return res.status(404).json({ success: false, message: 'Setting not found' });
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateSetting(req: Request, res: Response) {
    try {
      const { value } = req.body;
      const data = await this.settingsService.set(req.params.key, value);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateMultiple(req: Request, res: Response) {
    try {
      await this.settingsService.setMany(req.body);
      res.json({ success: true, message: 'Settings updated' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
