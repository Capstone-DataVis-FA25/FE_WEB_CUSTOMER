import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ChartHistoryState, ChartHistory } from './chartHistoryTypes';
import {
  fetchChartHistory,
  fetchHistoryCount,
  fetchHistoryById,
  restoreFromHistoryThunk,
  compareVersionsThunk,
  deleteHistoryThunk,
} from './chartHistoryThunk';

const initialState: ChartHistoryState = {
  histories: {},
  currentChartHistories: [],
  selectedHistory: null,
  historyCount: 0,
  loading: false,
  restoring: false,
  deleting: false,
  comparing: false,
  error: null,
  comparisonResult: null,
};

const chartHistorySlice = createSlice({
  name: 'chartHistory',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearComparison: state => {
      state.comparisonResult = null;
      state.comparing = false;
    },
    setSelectedHistory: (state, action: PayloadAction<ChartHistory | null>) => {
      state.selectedHistory = action.payload;
    },
    clearCurrentChartHistories: state => {
      state.currentChartHistories = [];
      state.selectedHistory = null;
      state.comparisonResult = null;
    },
  },
  extraReducers: builder => {
    // Fetch chart history
    builder
      .addCase(fetchChartHistory.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChartHistory.fulfilled, (state, action) => {
        state.loading = false;
        const { chartId, histories } = action.payload;
        state.histories[chartId] = histories;
        state.currentChartHistories = histories;
      })
      .addCase(fetchChartHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch history count
    builder
      .addCase(fetchHistoryCount.pending, state => {
        state.error = null;
      })
      .addCase(fetchHistoryCount.fulfilled, (state, action) => {
        state.historyCount = action.payload.count;
      })
      .addCase(fetchHistoryCount.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Fetch history by ID
    builder
      .addCase(fetchHistoryById.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHistoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedHistory = action.payload;
      })
      .addCase(fetchHistoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Restore from history
    builder
      .addCase(restoreFromHistoryThunk.pending, state => {
        state.restoring = true;
        state.error = null;
      })
      .addCase(restoreFromHistoryThunk.fulfilled, state => {
        state.restoring = false;
        // Optionally clear comparison after successful restore
        state.comparisonResult = null;
      })
      .addCase(restoreFromHistoryThunk.rejected, (state, action) => {
        state.restoring = false;
        state.error = action.payload as string;
      });

    // Compare versions
    builder
      .addCase(compareVersionsThunk.pending, state => {
        state.comparing = true;
        state.error = null;
      })
      .addCase(compareVersionsThunk.fulfilled, (state, action) => {
        state.comparing = false;
        state.comparisonResult = action.payload;
      })
      .addCase(compareVersionsThunk.rejected, (state, action) => {
        state.comparing = false;
        state.error = action.payload as string;
      });

    // Delete history
    builder
      .addCase(deleteHistoryThunk.pending, state => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteHistoryThunk.fulfilled, (state, action) => {
        state.deleting = false;
        const { chartId, historyId } = action.payload;

        // Remove from histories record
        if (state.histories[chartId]) {
          state.histories[chartId] = state.histories[chartId].filter(h => h.id !== historyId);
        }

        // Remove from current list
        state.currentChartHistories = state.currentChartHistories.filter(h => h.id !== historyId);

        // Clear selected if deleted
        if (state.selectedHistory?.id === historyId) {
          state.selectedHistory = null;
        }

        // Decrement count
        state.historyCount = Math.max(0, state.historyCount - 1);
      })
      .addCase(deleteHistoryThunk.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearComparison, setSelectedHistory, clearCurrentChartHistories } =
  chartHistorySlice.actions;

export default chartHistorySlice.reducer;
