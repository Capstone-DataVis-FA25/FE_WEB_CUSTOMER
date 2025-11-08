import { axiosPrivate } from '@/services/axios';
import { API_ENDPOINTS } from '@/constants/endpoints';
import type { BackendDataHeader } from '@/utils/dataConverter';

export interface Dataset {
  id: string;
  name: string;
  description?: string;
  rowCount: number;
  columnCount: number;
  thousandsSeparator?: string;
  decimalSeparator?: string;
  dateFormat?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  headers: BackendDataHeader[];
}

// New format for creating datasets with headers
export interface CreateDatasetRequest {
  name: string;
  description?: string;
  headers: {
    name: string;
    type: string;
    index: number;
    data: (string | number | boolean | null)[];
    dateFormat?: string;
  }[];
}

export interface UpdateDatasetRequest {
  name?: string;
  description?: string;
  headers?: {
    name: string;
    type: string;
    index: number;
    data: (string | number | boolean | null)[];
    dateFormat?: string;
  }[];
}

// Get all datasets for authenticated user
export const getAllDatasets = async (): Promise<Dataset[]> => {
  const response = await axiosPrivate.get(API_ENDPOINTS.DATASETS.GET_ALL);
  // Handle wrapped API response format
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data;
  }
  return response.data;
};

// Get dataset by ID
export const getDatasetById = async (id: string): Promise<Dataset> => {
  const response = await axiosPrivate.get(API_ENDPOINTS.DATASETS.GET_BY_ID(id));
  // Handle wrapped API response format
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data;
  }
  return response.data;
};

// Create new dataset
export const createDataset = async (data: CreateDatasetRequest): Promise<Dataset> => {
  const response = await axiosPrivate.post(API_ENDPOINTS.DATASETS.CREATE, data);
  // Handle wrapped API response format
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data;
  }
  return response.data;
};

// Update dataset
export const updateDataset = async (id: string, data: UpdateDatasetRequest): Promise<Dataset> => {
  const response = await axiosPrivate.patch(API_ENDPOINTS.DATASETS.UPDATE(id), data);
  // Handle wrapped API response format
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data;
  }
  return response.data;
};

// Delete dataset
export const deleteDataset = async (id: string): Promise<void> => {
  await axiosPrivate.delete(API_ENDPOINTS.DATASETS.DELETE(id));
};
