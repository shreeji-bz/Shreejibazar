export interface IRoundRepository {
  findById(id: string): Promise<any | null>;
  findByGameId(gameId: string, options?: any): Promise<any>;
  findOpenRounds(): Promise<any[]>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  close(id: string): Promise<void>;
  declareResult(id: string, result: string): Promise<void>;
}
