export interface IResultService {
  findLatest(options?: any): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  findByGame(gameId: string, options?: any): Promise<any>;
  create(data: any): Promise<any>;
}
