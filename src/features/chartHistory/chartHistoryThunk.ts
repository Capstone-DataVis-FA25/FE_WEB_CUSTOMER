import { createAsyncThunk } from '@reduxjs/toolkit';
import * as chartHistoryAPI from './chartHistoryAPI';
import type { RestoreChartRequest } from './chartHistoryTypes';

// Fetch all history versions for a chart
export const fetchChartHistory = createAsyncThunk(
  'chartHistory/fetchChartHistory',
  async (chartId: string, { rejectWithValue }) => {
    try {
      const histories = await chartHistoryAPI.getChartHistory(chartId);
      return { chartId, histories };
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch chart history');
    }
  }
);

// Fetch history count
export const fetchHistoryCount = createAsyncThunk(
  'chartHistory/fetchHistoryCount',
  async (chartId: string, { rejectWithValue }) => {
    try {
      const count = await chartHistoryAPI.getHistoryCount(chartId);
      return { chartId, count };
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch history count');
    }
  }
);

// Fetch history by ID
export const fetchHistoryById = createAsyncThunk(
  'chartHistory/fetchHistoryById',
  async (historyId: string, { rejectWithValue }) => {
    try {
      return await chartHistoryAPI.getHistoryById(historyId);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch history record');
    }
  }
);

// Restore from history
export const restoreFromHistoryThunk = createAsyncThunk(
  'chartHistory/restoreFromHistory',
  async (
    { chartId, restoreData }: { chartId: string; restoreData: RestoreChartRequest },
    { rejectWithValue }
  ) => {
    try {
      const result = await chartHistoryAPI.restoreFromHistory(chartId, restoreData);
      return result;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to restore chart');
    }
  }
);

// Compare versions
export const compareVersionsThunk = createAsyncThunk(
  'chartHistory/compareVersions',
  async ({ chartId, historyId }: { chartId: string; historyId: string }, { rejectWithValue }) => {
    try {
      return await chartHistoryAPI.compareVersions(chartId, historyId);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to compare versions');
    }
  }
);

// Delete history
export const deleteHistoryThunk = createAsyncThunk(
  'chartHistory/deleteHistory',
  async ({ chartId, historyId }: { chartId: string; historyId: string }, { rejectWithValue }) => {
    try {
      await chartHistoryAPI.deleteHistory(historyId);
      return { chartId, historyId };
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to delete history');
    }
  }
);
