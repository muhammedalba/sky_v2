import { User } from '@/features/users/types';

export interface LoginResponseData extends User {
  access_token: string;
}
