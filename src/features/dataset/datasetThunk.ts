import { createAsyncThunk } from '@reduxjs/toolkit';
import * as datasetAPI from './datasetAPI';
import type { CreateDatasetRequest, UpdateDatasetRequest } from './datasetAPI';
import { getErrorMessage, getErrorStatus } from '@/utils/errorUtils';

// Get all datasets
export const fetchDatasets = createAsyncThunk(
  'dataset/fetchDatasets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await datasetAPI.getAllDatasets();
      return response;
    } catch (error: unknown) {
      return rejectWithValue({
        message: getErrorMessage(error) || 'Failed to fetch datasets',
        status: getErrorStatus(error),
      });
    }
  }
);

// Get dataset by ID
export const fetchDatasetById = createAsyncThunk(
  'dataset/fetchDatasetById',
  async (id: string, { rejectWithValue }) => {
    try {
      console.log('Fetching dataset by ID:', id);
      const response = await datasetAPI.getDatasetById(id);
      console.log('Dataset fetched successfully:', response);
      return response;
    } catch (error: unknown) {
      console.error('Error fetching dataset by ID:', id, error);
      return rejectWithValue({
        message: getErrorMessage(error) || 'Failed to fetch dataset',
        status: getErrorStatus(error),
      });
    }
  }
);

// Create dataset
export const createDatasetThunk = createAsyncThunk(
  'dataset/createDataset',
  async (data: CreateDatasetRequest, { rejectWithValue }) => {
    try {
      const response = await datasetAPI.createDataset(data);
      return response;
    } catch (error: unknown) {
      return rejectWithValue({
        message: getErrorMessage(error) || 'Failed to create dataset',
        status: getErrorStatus(error),
      });
    }
  }
);

// Update dataset
export const updateDatasetThunk = createAsyncThunk(
  'dataset/updateDataset',
  async ({ id, data }: { id: string; data: UpdateDatasetRequest }, { rejectWithValue }) => {
    try {
      const response = await datasetAPI.updateDataset(id, data);
      return response;
    } catch (error: unknown) {
      return rejectWithValue({
        message: getErrorMessage(error) || 'Failed to update dataset',
        status: getErrorStatus(error),
      });
    }
  }
);

// Delete dataset
export const deleteDatasetThunk = createAsyncThunk(
  'dataset/deleteDataset',
  async (id: string, { rejectWithValue }) => {
    try {
      await datasetAPI.deleteDataset(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue({
        message: getErrorMessage(error) || 'Failed to delete dataset',
        status: getErrorStatus(error),
      });
    }
  }
);
