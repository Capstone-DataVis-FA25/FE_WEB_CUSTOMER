import { axiosPrivate } from './axios';
import type { AxiosResponse } from 'axios';
import type { ApiResponse } from '@/types/common';
import { API_ENDPOINTS } from '@/constants/endpoints';
import type { CheckoutResponse, PaymentTransaction, PaymentWebhookPayload } from '@/types/payments';

class PaymentsService {
  async createCheckout(planId: string, returnUrl?: string): Promise<CheckoutResponse> {
    const payload = { planId, returnUrl };
    const res: AxiosResponse<ApiResponse<CheckoutResponse>> = await axiosPrivate.post(
      API_ENDPOINTS.PAYMENTS.CHECKOUT,
      payload
    );
    return res.data.data;
  }

  async getTransaction(id: string): Promise<PaymentTransaction> {
    const res: AxiosResponse<ApiResponse<PaymentTransaction>> = await axiosPrivate.get(
      API_ENDPOINTS.PAYMENTS.GET_BY_ID(id)
    );
    return res.data.data;
  }

  /**
   * NOTE: Normally payment providers (Stripe, etc.) call your backend webhook directly.
   * This client-side method is only for simulation/manual triggering and SHOULD NOT
   * be used in production for real payment status updates.
   */
  async sendWebhook(payload: PaymentWebhookPayload): Promise<{ ok: boolean }> {
    const res: AxiosResponse<ApiResponse<{ ok: boolean }>> = await axiosPrivate.post(
      API_ENDPOINTS.PAYMENTS.WEBHOOK,
      payload
    );
    return res.data.data;
  }
}

export const paymentsService = new PaymentsService();
export default paymentsService;
