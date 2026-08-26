export interface IUsersRepository {
  findById(id: string): Promise<any | null>;
  findAll(options?: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  updateStatus(id: string, status: string): Promise<void>;
}
