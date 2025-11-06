import { createSlice } from '@reduxjs/toolkit';
import { current } from 'immer';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ChartDataPoint } from '@/components/charts/D3LineChart';
import type { MainChartConfig } from '@/types/chart';
import { ChartType } from '@/features/charts';
import type { NumberFormat, DateFormat } from '@/contexts/DatasetContext';
import type { DataHeader } from '@/utils/dataProcessors';
import { getDefaultChartConfig } from '@/utils/chartDefaults';

// Deep partial utility type for nested optional properties
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface ValidationErrors {
  name: boolean;
  description: boolean;
  title: boolean;
  xAxisLabel: boolean;
  yAxisLabel: boolean;
  seriesNames: Record<string, boolean>;
}

export interface ChartEditorState {
  // Mode and IDs
  mode: 'create' | 'edit';
  chartId?: string;
  datasetId?: string;

  // Chart data & config
  chartData: ChartDataPoint[];
  chartConfig: MainChartConfig | null;
  currentChartType: ChartType | null;

  // Local working dataset for the editor (decoupled from fetched entity)
  workingDataset: {
    headers: DataHeader[];
    data: string[][];
    formats: { number?: NumberFormat; date?: DateFormat };
    version: number;
  } | null;

  // Edit states (local to header, won't cause global rerenders)
  editableName: string;
  editableDescription: string;
  isEditingName: boolean;
  isEditingDescription: boolean;

  // Original values for change tracking
  originalName: string;
  originalDescription: string;
  originalConfig: MainChartConfig | null;
  originalChartType: ChartType | null;

  // Reset trigger for forcing re-renders
  resetTrigger: number;

  // Validation state
  validationErrors: ValidationErrors;
}

const initialState: ChartEditorState = {
  mode: 'create',
  chartId: undefined,
  datasetId: undefined,
  chartData: [],
  chartConfig: null,
  currentChartType: null,
  workingDataset: null,
  editableName: '',
  editableDescription: '',
  isEditingName: false,
  isEditingDescription: false,
  originalName: '',
  originalDescription: '',
  originalConfig: null,
  originalChartType: null,
  resetTrigger: 0,
  validationErrors: {
    name: false,
    description: false,
    title: false,
    xAxisLabel: false,
    yAxisLabel: false,
    seriesNames: {},
  },
};

const chartEditorSlice = createSlice({
  name: 'chartEditor',
  initialState,
  reducers: {
    // Initialize chart editor
    initializeEditor: (
      state,
      action: PayloadAction<{
        mode: 'create' | 'edit';
        chartId?: string;
        datasetId?: string;
        initialChartType?: ChartType;
      }>
    ) => {
      state.mode = action.payload.mode;
      state.chartId = action.payload.chartId;
      state.datasetId = action.payload.datasetId;
      state.currentChartType = action.payload.initialChartType || null;
      if (action.payload.mode === 'create' && action.payload.initialChartType) {
        state.chartConfig = getDefaultChartConfig(action.payload.initialChartType);
      }
      // Reset other state
      state.chartData = [];
      state.chartConfig = null;
      state.editableName = '';
      state.editableDescription = '';
      state.isEditingName = false;
      state.isEditingDescription = false;
      state.originalName = '';
      state.originalDescription = '';
      state.originalConfig = null;
      state.originalChartType = action.payload.initialChartType || null;
      state.resetTrigger = 0;
      state.validationErrors = initialState.validationErrors;
      state.workingDataset = null;
    },

    // Chart data & config
    setChartData: (state, action: PayloadAction<ChartDataPoint[]>) => {
      state.chartData = action.payload;
    },

    setChartConfig: (state, action: PayloadAction<MainChartConfig | null>) => {
      state.chartConfig = action.payload;
    },

    setCurrentChartType: (state, action: PayloadAction<ChartType>) => {
      state.currentChartType = action.payload;
    },

    // Edit states
    setEditableName: (state, action: PayloadAction<string>) => {
      state.editableName = action.payload;
    },

    setEditableDescription: (state, action: PayloadAction<string>) => {
      state.editableDescription = action.payload;
    },

    setIsEditingName: (state, action: PayloadAction<boolean>) => {
      state.isEditingName = action.payload;
    },

    setIsEditingDescription: (state, action: PayloadAction<boolean>) => {
      state.isEditingDescription = action.payload;
    },

    // Handle config changes with deep merge
    updateChartConfig: (state, action: PayloadAction<DeepPartial<MainChartConfig>>) => {
      if (!state.chartConfig) {
        console.warn('⚠️ No current config available, skipping update');
        return;
      }

      const configChanges = action.payload;

      // Deep merge for nested objects
      const mergeDeep = (target: any, source: any): any => {
        const result = { ...target };

        for (const key in source) {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = mergeDeep(target[key] || {}, source[key]);
          } else {
            result[key] = source[key];
          }
        }

        return result;
      };

      const newConfig = mergeDeep(state.chartConfig, configChanges) as MainChartConfig;

      // Log changes for debugging
      const findDeepChanges = (obj1: any, obj2: any, path = ''): string[] => {
        const changes: string[] = [];

        for (const key in obj2) {
          const currentPath = path ? `${path}.${key}` : key;

          if (obj1[key] === undefined) {
            changes.push(currentPath);
          } else if (
            typeof obj2[key] === 'object' &&
            obj2[key] !== null &&
            !Array.isArray(obj2[key])
          ) {
            changes.push(...findDeepChanges(obj1[key] || {}, obj2[key], currentPath));
          } else if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
            changes.push(currentPath);
          }
        }

        return changes;
      };

      const changedFields = findDeepChanges(state.chartConfig, configChanges);

      // Snapshot Immer draft to avoid logging revoked Proxy objects in console
      const snapshotCurrent = state.chartConfig ? current(state.chartConfig) : null;
      console.log('📊 Current:', snapshotCurrent);
      console.log('✅ New:', newConfig);
      console.log('🔄 Fields changed:', changedFields);

      state.chartConfig = newConfig;
    },

    // Working dataset management
    setWorkingDataset: (
      state,
      action: PayloadAction<{
        headers: DataHeader[];
        data: string[][];
        formats?: { number?: NumberFormat; date?: DateFormat };
      }>
    ) => {
      state.workingDataset = {
        headers: action.payload.headers,
        data: action.payload.data,
        formats: action.payload.formats || {},
        version: (state.workingDataset?.version || 0) + 1,
      };
    },
    updateWorkingData: (
      state,
      action: PayloadAction<{ data: string[][]; headers?: DataHeader[] }>
    ) => {
      if (!state.workingDataset) return;
      state.workingDataset = {
        headers: action.payload.headers || state.workingDataset.headers,
        data: action.payload.data,
        formats: state.workingDataset.formats,
        version: state.workingDataset.version + 1,
      };
    },
    updateWorkingFormats: (
      state,
      action: PayloadAction<{ number?: NumberFormat; date?: DateFormat }>
    ) => {
      if (!state.workingDataset) return;
      state.workingDataset = {
        ...state.workingDataset,
        formats: {
          number: action.payload.number ?? state.workingDataset.formats.number,
          date: action.payload.date ?? state.workingDataset.formats.date,
        },
        version: state.workingDataset.version + 1,
      };
    },
    clearWorkingDataset: state => {
      state.workingDataset = null;
    },

    // Reset to original values
    resetToOriginal: state => {
      state.editableName = state.originalName;
      state.editableDescription = state.originalDescription;
      state.currentChartType = state.originalChartType;
      if (state.originalConfig) {
        state.chartConfig = state.originalConfig;
      }
      state.resetTrigger += 1;
      state.isEditingName = false;
      state.isEditingDescription = false;
    },

    // Update original values after successful save
    updateOriginals: state => {
      state.originalName = state.editableName;
      state.originalDescription = state.editableDescription;
      state.originalConfig = state.chartConfig;
      state.originalChartType = state.currentChartType;
    },

    // Trigger reset
    triggerReset: state => {
      state.resetTrigger += 1;
    },

    // Validation
    setValidationError: (
      state,
      action: PayloadAction<{ field: keyof Omit<ValidationErrors, 'seriesNames'>; error: boolean }>
    ) => {
      state.validationErrors[action.payload.field] = action.payload.error;
    },

    setSeriesValidationError: (
      state,
      action: PayloadAction<{ seriesId: string; error: boolean }>
    ) => {
      state.validationErrors.seriesNames[action.payload.seriesId] = action.payload.error;
    },

    clearValidationError: (
      state,
      action: PayloadAction<{ field: keyof ValidationErrors; seriesId?: string }>
    ) => {
      if (action.payload.field === 'seriesNames' && action.payload.seriesId) {
        delete state.validationErrors.seriesNames[action.payload.seriesId];
      } else if (action.payload.field !== 'seriesNames') {
        state.validationErrors[action.payload.field] = false;
      }
    },

    resetValidation: state => {
      state.validationErrors = initialState.validationErrors;
    },

    // Clear chart editor state (on unmount)
    clearChartEditor: state => {
      return initialState;
    },
  },
});

export const {
  initializeEditor,
  setChartData,
  setChartConfig,
  setCurrentChartType,
  setEditableName,
  setEditableDescription,
  setIsEditingName,
  setIsEditingDescription,
  updateChartConfig,
  setWorkingDataset,
  updateWorkingData,
  updateWorkingFormats,
  clearWorkingDataset,
  resetToOriginal,
  updateOriginals,
  triggerReset,
  setValidationError,
  setSeriesValidationError,
  clearValidationError,
  resetValidation,
  clearChartEditor,
} = chartEditorSlice.actions;

export const chartEditorReducer = chartEditorSlice.reducer;
