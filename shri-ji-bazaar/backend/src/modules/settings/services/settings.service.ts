import type { SettingEntity } from '../entities/setting.entity';
import type { ISettingsRepository } from '../interfaces/settings.interface';

export class SettingsService {
  constructor(private settingsRepository: ISettingsRepository) {}

  async getAll(): Promise<Record<string, string>> {
    const settings: SettingEntity[] = await this.settingsRepository.findAll();
    const result: Record<string, string> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return result;
  }

  async updateSingle(key: string, value: string): Promise<SettingEntity> {
    await this.settingsRepository.update(key, value);
    return this.settingsRepository.findByKey(key) as Promise<SettingEntity>;
  }
}
