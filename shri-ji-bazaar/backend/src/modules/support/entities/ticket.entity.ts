export interface TicketEntity {
  id: string;
  userId: string;
  subject: string;
  category: string;
  description: string;
  attachment?: string;
  status: string;
  priority: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
