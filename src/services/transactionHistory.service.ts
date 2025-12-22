import { axiosPrivate } from './axios';

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}
export interface TransactionItem {
  id: string;
  userId: string;
  subscriptionPlanId: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  provider?: string;
  providerTransactionId?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  subscriptionPlan?: {
    id: string;
    name: string;
    price: number;
    currency: string;
  };
}

export interface TransactionHistoryResponse {
  data: TransactionItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const transactionHistoryService = {
  getMyTransactions: async (page = 1, limit = 10): Promise<TransactionHistoryResponse> => {
    const response = await axiosPrivate.get('/payments/my-transactions', {
      params: { page, limit },
    });
    return response.data.data;
  },

  // Get single transaction detail
  getTransactionDetail: async (id: string): Promise<TransactionItem> => {
    const response = await axiosPrivate.get(`/payments/transactions/${id}`);
    return response.data.data;
  },
};

export default transactionHistoryService;
