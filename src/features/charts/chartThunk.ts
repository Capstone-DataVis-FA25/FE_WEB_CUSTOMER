import { createAsyncThunk } from '@reduxjs/toolkit';
import * as chartAPI from './chartAPI';
import type { CreateChartRequest, UpdateChartRequest } from './chartTypes';

// Get all charts
export const fetchCharts = createAsyncThunk(
  'charts/fetchCharts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chartAPI.getAllCharts();
      return response;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
      };
      return rejectWithValue({
        message: err.response?.data?.message || err.message || 'Failed to fetch charts',
        status: err.response?.status,
      });
    }
  }
);

// Get chart by ID
export const fetchChartById = createAsyncThunk(
  'charts/fetchChartById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await chartAPI.getChartById(id);
      return response;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
      };
      return rejectWithValue({
        message: err.response?.data?.message || err.message || 'Failed to fetch chart',
        status: err.response?.status,
      });
    }
  }
);

// Create chart
export const createChartThunk = createAsyncThunk(
  'charts/createChart',
  async (data: CreateChartRequest, { rejectWithValue }) => {
    try {
      const response = await chartAPI.createChart(data);
      return response;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
      };
      return rejectWithValue({
        message: err.response?.data?.message || err.message || 'Failed to create chart',
        status: err.response?.status,
      });
    }
  }
);

// Update chart
export const updateChartThunk = createAsyncThunk(
  'charts/updateChart',
  async ({ id, data }: { id: string; data: UpdateChartRequest }, { rejectWithValue }) => {
    try {
      const response = await chartAPI.updateChart(id, data);
      return response;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
      };
      return rejectWithValue({
        message: err.response?.data?.message || err.message || 'Failed to update chart',
        status: err.response?.status,
      });
    }
  }
);

// Delete chart
export const deleteChartThunk = createAsyncThunk(
  'charts/deleteChart',
  async (id: string, { rejectWithValue }) => {
    try {
      await chartAPI.deleteChart(id);
      return id;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
      };
      return rejectWithValue({
        message: err.response?.data?.message || err.message || 'Failed to delete chart',
        status: err.response?.status,
      });
    }
  }
);
