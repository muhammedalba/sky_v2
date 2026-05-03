export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  avatar?: string;
  phone?: string;
  provider?: string;
  passwordChangeAt?: Date;
  passwordResetCode?: string;
  passwordResetExpires?: Date;
  lastEmailAttemptAt?: Date;
  verificationCode?: string;
  verificationExpires?: Date;
  lastLogin?: Date;
  totalOrders?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
