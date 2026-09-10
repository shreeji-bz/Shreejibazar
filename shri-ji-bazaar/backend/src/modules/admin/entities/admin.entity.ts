export interface AdminEntity {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'super_admin';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}
