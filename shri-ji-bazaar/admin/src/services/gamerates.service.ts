import { get, put } from './api';

export interface PlayConfig {
  slug: string;
  name: string;
  config: Record<string, any>;
}

export const gameratesService = {
  async fetchPlayConfigs(): Promise<PlayConfig[]> {
    const res = await get<{ success: boolean; data: PlayConfig[] }>('/v1/admin/games/play-configs');
    return res?.data ?? [];
  },

  async savePlayConfig(slug: string, config: Record<string, any>): Promise<void> {
    await put(`/v1/admin/games/play-configs/${encodeURIComponent(slug)}`, config);
  },
};
