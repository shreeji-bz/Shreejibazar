export interface ISupportRepository {
  findAll(options?: any): Promise<any>;
  findById(id: string): Promise<any | null>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  addMessage(data: any): Promise<any>;
}
