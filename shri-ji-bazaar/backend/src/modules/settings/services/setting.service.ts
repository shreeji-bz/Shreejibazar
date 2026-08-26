import { SettingRepository } from '../repositories/setting.repository';

export class SettingService {
  constructor(private settingRepository: SettingRepository) {}

  async getAll() {
    return this.settingRepository.findAll();
  }

  async get(key: string) {
    const value = await this.settingRepository.get(key);
    if (value === null) throw new Error('Setting not found');
    return { key, value };
  }

  async set(key: string, value: string, type: string = 'string') {
    return this.settingRepository.set(key, value, type);
  }
}
