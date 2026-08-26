export interface AdminEntity {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
