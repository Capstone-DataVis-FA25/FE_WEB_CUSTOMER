import { createAsyncThunk } from '@reduxjs/toolkit';
import * as chartHistoryAPI from './chartHistoryAPI';
import type { RestoreChartRequest, ChartHistory } from './chartHistoryTypes';
import { compareChartVersions } from '@/utils/compareVersions';

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

// Compare versions (Frontend comparison)
export const compareVersionsThunk = createAsyncThunk(
  'chartHistory/compareVersions',
  async (
    {
      historyId,
      currentChart,
    }: {
      historyId: string;
      currentChart: {
        name: string;
        description?: string;
        type: string;
        datasetId: string;
        config: any;
        updatedAt: string;
      };
    },
    { rejectWithValue, getState }
  ) => {
    try {
      // Get historical version from state or fetch it
      const state = getState() as any;
      let historicalVersion: ChartHistory | undefined =
        state.chartHistory.currentChartHistories.find((h: ChartHistory) => h.id === historyId);

      // If not in state, fetch it
      if (!historicalVersion) {
        historicalVersion = await chartHistoryAPI.getHistoryById(historyId);
      }

      if (!historicalVersion) {
        return rejectWithValue('Historical version not found');
      }

      // Compare on frontend
      const comparisonResult = compareChartVersions(currentChart, {
        name: historicalVersion.name,
        description: historicalVersion.description,
        type: historicalVersion.type,
        datasetId: historicalVersion.datasetId,
        config: historicalVersion.config,
        createdAt: historicalVersion.createdAt,
      });

      return comparisonResult;
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
