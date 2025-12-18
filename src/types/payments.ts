export enum PaymentStatus {
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  COMPLETED = 'COMPLETED',
  REFUNDED = 'REFUNDED',
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  provider?: 'stripe' | 'paypal' | string;
  providerTransactionId?: string;
  planId?: string;
  status: PaymentStatus;
  amount?: number;
  currency?: string;
  metadata?: Record<string, any> | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CheckoutResponse {
  checkoutUrl?: string;
  transactionId?: string;
}

export interface PaymentWebhookPayload {
  providerTransactionId: string;
  status: PaymentStatus;
  metadata?: Record<string, any> | null;
}
