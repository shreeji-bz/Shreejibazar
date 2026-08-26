export interface UserEntity {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  avatar?: string;
  referralCode: string;
  referredBy?: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
