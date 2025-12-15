import type { SubscriptionPlan } from '@/types/subscription';
import { axiosPublic, axiosPrivate } from './axios';
import type { AxiosResponse } from 'axios';
import type { ApiResponse } from '@/types/common';

class SubscriptionPlansService {
  private readonly baseURL = '/subscription-plans';

  async getActivePlans(): Promise<SubscriptionPlan[]> {
    try {
      const response: AxiosResponse<ApiResponse<SubscriptionPlan[]>> = await axiosPublic.get(
        `${this.baseURL}/active`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching active subscription plans', error);
      throw error;
    }
  }

  async createCheckout(priceId: string): Promise<{ checkoutUrl?: string } | null> {
    try {
      const response: AxiosResponse<ApiResponse<{ checkoutUrl?: string }>> =
        await axiosPrivate.post(`${this.baseURL}/checkout`, { priceId });
      return response.data.data;
    } catch (error) {
      console.error('Error creating checkout session', error);
      throw error;
    }
  }
}

export const subscriptionPlansService = new SubscriptionPlansService();
export default subscriptionPlansService;
