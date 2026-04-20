export interface Supplier {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  contactName: string;
  website: URL;
  avatar?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}
