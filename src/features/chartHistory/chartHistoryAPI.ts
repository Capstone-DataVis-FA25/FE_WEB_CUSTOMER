import { axiosPrivate } from '@/services/axios';
import type { ChartHistory, RestoreChartRequest, ComparisonResult } from './chartHistoryTypes';

const API_BASE = '/chart-history';

// Get all history versions of a chart
export const getChartHistory = async (chartId: string): Promise<ChartHistory[]> => {
  const response = await axiosPrivate.get(`${API_BASE}/chart/${chartId}`);
  return response.data.data;
};

// Get count of history versions
export const getHistoryCount = async (chartId: string): Promise<number> => {
  const response = await axiosPrivate.get(`${API_BASE}/chart/${chartId}/count`);
  return response.data.data.count;
};

// Get a specific history version by ID
export const getHistoryById = async (historyId: string): Promise<ChartHistory> => {
  const response = await axiosPrivate.get(`${API_BASE}/${historyId}`);
  return response.data.data;
};

// Restore chart to a previous version
export const restoreFromHistory = async (
  chartId: string,
  restoreData: RestoreChartRequest
): Promise<any> => {
  console.log('Restoring chart with data:', restoreData);
  const response = await axiosPrivate.post(`${API_BASE}/chart/${chartId}/restore`, restoreData);
  return response.data.data;
};

// Compare current version with a historical version
export const compareVersions = async (
  chartId: string,
  historyId: string
): Promise<ComparisonResult> => {
  const response = await axiosPrivate.get(`${API_BASE}/chart/${chartId}/compare/${historyId}`);
  return response.data.data;
};

// Delete a history record
export const deleteHistory = async (historyId: string): Promise<void> => {
  await axiosPrivate.delete(`${API_BASE}/${historyId}`);
};
