import { GameEntity } from '../entities/game.entity';

export interface GamesInterface {
  findAll(options?: any): Promise<{ data: GameEntity[]; meta: any }>;
  findById(id: string): Promise<GameEntity | null>;
  create(data: Partial<GameEntity>): Promise<GameEntity>;
  update(id: string, data: Partial<GameEntity>): Promise<GameEntity>;
  delete(id: string): Promise<void>;
  toggleStatus(id: string, status: GameEntity['status']): Promise<GameEntity>;
}
