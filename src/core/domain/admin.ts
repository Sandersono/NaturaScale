
export type SubscriptionStatus = 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'CANCELLED';

export interface SaasPlan {
  id: string;
  name: string;
  priceCents: number;
  maxStores: number;
  maxUsersPerStore: number;
  features: string[];
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  document: string; // CNPJ
  ownerName: string;
  ownerEmail: string;
  planId: string;
  status: SubscriptionStatus;
  createdAt: Date;
}
