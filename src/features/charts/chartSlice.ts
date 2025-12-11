import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Chart, ChartState } from './chartTypes';
import {
  fetchCharts,
  fetchChartById,
  createChartThunk,
  updateChartThunk,
  deleteChartThunk,
} from './chartThunk';

const initialState: ChartState = {
  charts: [],
  currentChart: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
};

const chartSlice = createSlice({
  name: 'charts',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearCurrentChart: state => {
      state.currentChart = null;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch all charts
      .addCase(fetchCharts.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCharts.fulfilled, (state, action: PayloadAction<Chart[]>) => {
        state.loading = false;
        state.charts = action.payload;
      })
      .addCase(fetchCharts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch chart by ID
      .addCase(fetchChartById.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChartById.fulfilled, (state, action: PayloadAction<Chart>) => {
        state.loading = false;
        state.currentChart = action.payload;
      })
      .addCase(fetchChartById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create chart
      .addCase(createChartThunk.pending, state => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createChartThunk.fulfilled, (state, action: PayloadAction<Chart>) => {
        state.creating = false;
        state.charts.unshift(action.payload);
      })
      .addCase(createChartThunk.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      })
      // Update chart
      .addCase(updateChartThunk.pending, state => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateChartThunk.fulfilled, (state, action: PayloadAction<Chart>) => {
        state.updating = false;
        const index = state.charts.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.charts[index] = action.payload;
        }
        if (state.currentChart && state.currentChart.id === action.payload.id) {
          state.currentChart = { ...state.currentChart, ...action.payload };
        }
      })
      .addCase(updateChartThunk.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      })
      // Delete chart
      .addCase(deleteChartThunk.pending, state => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteChartThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.deleting = false;
        state.charts = state.charts.filter(c => c.id !== action.payload);
        if (state.currentChart && state.currentChart.id === action.payload) {
          state.currentChart = null;
        }
      })
      .addCase(deleteChartThunk.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentChart } = chartSlice.actions;
export default chartSlice.reducer;
