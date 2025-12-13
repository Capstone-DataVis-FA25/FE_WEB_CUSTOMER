import { axiosPrivate } from './axios';

export interface ResourceUsage {
  datasetsCount: number;
  chartsCount: number;
  aiRequestsCount: number;
}

export interface ResourceLimits {
  maxDatasets: number | null;
  maxCharts: number | null;
  maxAIRequests: number | null;
}

export interface ResourcePercentage {
  datasets: number;
  charts: number;
  aiRequests: number;
}

export interface ResourceUsageResponse {
  usage: ResourceUsage;
  limits: ResourceLimits;
  percentage: ResourcePercentage;
  warnings: string[]; // Array of resource names nearing limits (>80%)
  subscriptionPlan: {
    id: string;
    name: string;
  } | null;
}

const resourceUsageService = {
  getMyResourceUsage: async (): Promise<ResourceUsageResponse> => {
    const response = await axiosPrivate.get('/users/me/resource-usage');
    return response.data.data;
  },
};

export default resourceUsageService;
