import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Dataset, DatasetDetail } from './datasetAPI';
import {
  fetchDatasets,
  fetchDatasetById,
  createDatasetThunk,
  updateDatasetThunk,
  deleteDatasetThunk,
} from './datasetThunk';

export interface DatasetState {
  datasets: Dataset[];
  currentDataset: DatasetDetail | null;
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  error: string | null;
}

const initialState: DatasetState = {
  datasets: [],
  currentDataset: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
};

const datasetSlice = createSlice({
  name: 'dataset',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentDataset: (state) => {
      state.currentDataset = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all datasets
      .addCase(fetchDatasets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDatasets.fulfilled, (state, action: PayloadAction<Dataset[]>) => {
        state.loading = false;
        state.datasets = action.payload;
      })
      .addCase(fetchDatasets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch dataset by ID
      .addCase(fetchDatasetById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDatasetById.fulfilled, (state, action: PayloadAction<DatasetDetail>) => {
        state.loading = false;
        state.currentDataset = action.payload;
      })
      .addCase(fetchDatasetById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create dataset
      .addCase(createDatasetThunk.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createDatasetThunk.fulfilled, (state, action: PayloadAction<Dataset>) => {
        state.creating = false;
        state.datasets.unshift(action.payload);
      })
      .addCase(createDatasetThunk.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      })
      // Update dataset
      .addCase(updateDatasetThunk.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateDatasetThunk.fulfilled, (state, action: PayloadAction<Dataset>) => {
        state.updating = false;
        const index = state.datasets.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.datasets[index] = action.payload;
        }
        if (state.currentDataset && state.currentDataset.id === action.payload.id) {
          state.currentDataset = { ...state.currentDataset, ...action.payload };
        }
      })
      .addCase(updateDatasetThunk.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      })
      // Delete dataset
      .addCase(deleteDatasetThunk.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteDatasetThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.deleting = false;
        state.datasets = state.datasets.filter(d => d.id !== action.payload);
        if (state.currentDataset && state.currentDataset.id === action.payload) {
          state.currentDataset = null;
        }
      })
      .addCase(deleteDatasetThunk.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentDataset } = datasetSlice.actions;
export default datasetSlice.reducer;
