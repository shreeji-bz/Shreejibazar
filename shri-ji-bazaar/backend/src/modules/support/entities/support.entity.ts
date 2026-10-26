export interface SupportEntity {
  id: string;
  userId: string;
  subject: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
}

export interface SupportMessageEntity {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: 'user' | 'admin';
  message: string;
  attachment?: string;
  createdAt: string;
}
