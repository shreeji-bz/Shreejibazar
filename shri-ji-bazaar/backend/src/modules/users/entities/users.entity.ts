export interface UsersEntity {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  avatar?: string;
  referralCode: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
