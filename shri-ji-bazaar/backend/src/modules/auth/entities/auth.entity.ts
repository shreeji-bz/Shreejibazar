export interface AuthEntity {
  id: string;
  email: string;
  password: string;
  name: string;
  mobile: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive' | 'banned';
  createdAt: Date;
  updatedAt: Date;
}
