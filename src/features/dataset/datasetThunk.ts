import { createAsyncThunk } from '@reduxjs/toolkit';
import * as datasetAPI from './datasetAPI';
import type { CreateDatasetRequest, UpdateDatasetRequest } from './datasetAPI';

// Get all datasets
export const fetchDatasets = createAsyncThunk(
  'dataset/fetchDatasets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await datasetAPI.getAllDatasets();
      return response;
    } catch (error: any) {
      return rejectWithValue({
        message: error.response?.data?.message || error.message || 'Failed to fetch datasets',
        status: error.response?.status,
      });
    }
  }
);

// Get dataset by ID
export const fetchDatasetById = createAsyncThunk(
  'dataset/fetchDatasetById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await datasetAPI.getDatasetById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue({
        message: error.response?.data?.message || error.message || 'Failed to fetch dataset',
        status: error.response?.status,
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
    } catch (error: any) {
      return rejectWithValue({
        message: error.response?.data?.message || error.message || 'Failed to create dataset',
        status: error.response?.status,
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
    } catch (error: any) {
      return rejectWithValue({
        message: error.response?.data?.message || error.message || 'Failed to update dataset',
        status: error.response?.status,
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
    } catch (error: any) {
      return rejectWithValue({
        message: error.response?.data?.message || error.message || 'Failed to delete dataset',
        status: error.response?.status,
      });
    }
  }
);
