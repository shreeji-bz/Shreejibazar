import { GameRepository } from '../repositories/games.repository';

export class GamesService {
  constructor(private gameRepository: GameRepository) {}

  async getAll(options?: any) {
    return this.gameRepository.findAll(options);
  }

  async getById(id: string) {
    const game = await this.gameRepository.findById(id);
    if (!game) throw new Error('Game not found');
    return game;
  }

  async getBySlug(slug: string) {
    const game = await this.gameRepository.findBySlug(slug);
    if (!game) throw new Error('Game not found');
    return game;
  }

  async getPopular() {
    return this.gameRepository.findPopular();
  }

  async create(data: any) {
    const existing = await this.gameRepository.findBySlug(data.slug);
    if (existing) throw new Error('Game with this slug already exists');
    return this.gameRepository.create(data);
  }

  async update(id: string, data: any) {
    await this.gameRepository.findById(id);
    return this.gameRepository.update(id, data);
  }

  async delete(id: string) {
    return this.gameRepository.delete(id);
  }

  async toggleStatus(id: string, status: 'active' | 'inactive' | 'maintenance') {
    const game = await this.gameRepository.findById(id);
    if (!game) throw new Error('Game not found');
    return this.gameRepository.toggleStatus(id, status);
  }
}
