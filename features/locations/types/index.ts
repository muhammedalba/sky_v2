export interface Country {
  _id: string;
  name: {
    ar: string;
    en: string;
  };
  code: string;
  phoneCode: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Region {
  _id: string;
  name: {
    ar: string;
    en: string;
  };
  country: string | Country;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface City {
  _id: string;
  name: {
    ar: string;
    en: string;
  };
  region: string | Region;
  country: string | Country;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  isDeliveryAvailable: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
