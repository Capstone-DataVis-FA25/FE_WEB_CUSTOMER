import { axiosPrivate } from '@/services/axios';
import { API_ENDPOINTS } from '@/constants/endpoints';
import type { Chart, CreateChartRequest, UpdateChartRequest } from './chartTypes';

// Get all charts for authenticated user
export const getAllCharts = async (): Promise<Chart[]> => {
  const response = await axiosPrivate.get(API_ENDPOINTS.CHARTS.GET_ALL);
  // Handle wrapped API response format
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data;
  }
  return response.data;
};

// Get chart by ID
export const getChartById = async (id: string): Promise<Chart> => {
  const response = await axiosPrivate.get(API_ENDPOINTS.CHARTS.GET_BY_ID(id));
  // Handle wrapped API response format
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data;
  }
  return response.data;
};

// Create new chart
export const createChart = async (data: CreateChartRequest): Promise<Chart> => {
  const response = await axiosPrivate.post(API_ENDPOINTS.CHARTS.CREATE, data);
  // Handle wrapped API response format
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data;
  }
  return response.data;
};

// Update chart
export const updateChart = async (id: string, data: UpdateChartRequest): Promise<Chart> => {
  const response = await axiosPrivate.patch(API_ENDPOINTS.CHARTS.UPDATE(id), data);
  // Handle wrapped API response format
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data;
  }
  return response.data;
};

// Delete chart
export const deleteChart = async (id: string): Promise<void> => {
  await axiosPrivate.delete(API_ENDPOINTS.CHARTS.DELETE(id));
};
