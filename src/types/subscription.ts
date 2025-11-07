export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  currency?: string;
  interval?: string;
  features?: string[];
  limits?: Record<string, any> | null;
  stripePriceId?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
