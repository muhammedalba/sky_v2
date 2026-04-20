export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  avatar?: string;
  phone?: string;
  active?: boolean;
  updatedAt?: string;
}
