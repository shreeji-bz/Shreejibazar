import { SupportRepository } from '../repositories/support.repository';

export class SupportService {
  constructor(private supportRepo: SupportRepository) {}

  async getAll(options?: any) {
    return this.supportRepo.getTickets(options?.userId);
  }

  async getById(id: string) {
    return this.supportRepo.getTicket(id);
  }

  async create(data: { userId: string; subject: string; category: string; description: string }) {
    return this.supportRepo.create(data);
  }

  async update(id: string, data: any) {
    return this.supportRepo.updateStatus(id, data.status);
  }

  async addMessage(data: { ticketId: string; userId: string; message: string; attachment?: string }) {
    return this.supportRepo.addMessage(data);
  }
}
