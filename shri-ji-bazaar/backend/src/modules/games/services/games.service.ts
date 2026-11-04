import { GameRepository } from '../repositories/games.repository';

function slugify(name: string): string {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export class GamesService {
  constructor(private gameRepository: GameRepository) {}

  async getAll(options?: any) {
    return this.gameRepository.findAll(options);
  }

  async getById(id: string) {
    const game = await this.gameRepository.findById(id);
    if (!game) throw new Error('Game not found');
    return (await this.enrichGames([game]))[0];
  }

  async getBySlug(slug: string) {
    const game = await this.gameRepository.findBySlug(slug);
    if (!game) throw new Error('Game not found');
    return game;
  }

  async getPopular() {
    return this.enrichGames(await this.gameRepository.findPopular());
  }

  async getRecent(limit = 10) {
    return this.enrichGames(await this.gameRepository.findRecent(limit));
  }

  // Attach per-game last_result + play config so the mobile app can show each
  // market's real last result and drive its play screen from that market's
  // own config instead of one shared default.
  private async enrichGames(games: any[]) {
    const last = await this.gameRepository.latestDeclaredResultsForGames(games.map((g) => g.id));
    const configs = await this.gameRepository.playConfigsForSlugs(games.map((g) => g.slug));
    return games.map((g) => ({
      ...g,
      lastResult: last.get(g.id)?.result ?? null,
      lastResultAt: last.get(g.id)?.at ?? null,
      playConfig: configs.get(g.slug) ?? null,
    }));
  }

  async create(data: any) {
    // The live table's `slug` is NOT NULL + unique and the admin form may
    // omit it, so derive one from the name; if the name is blank too, mint a
    // unique one so the insert never fails on the constraint.
    let slug = slugify(data.slug || data.name);
    if (!slug) slug = `game-${Date.now().toString(36)}`;
    const existing = await this.gameRepository.findBySlug(slug);
    if (existing) throw new Error('Game with this slug already exists');
    return this.gameRepository.create({ ...data, slug });
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

  /** Admin "Games Rate": every game with its play config for editing. */
  async getPlayConfigs() {
    return this.gameRepository.allPlayConfigs();
  }

  /** Admin "Games Rate": persist one game's play config. */
  async savePlayConfig(slug: string, config: any) {
    return this.gameRepository.savePlayConfig(slug, config);
  }
}
