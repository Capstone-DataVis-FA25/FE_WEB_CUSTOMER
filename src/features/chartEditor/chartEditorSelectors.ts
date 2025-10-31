import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';

// Base selector
export const selectChartEditor = (state: RootState) => state.chartEditor;

// Mode and IDs
export const selectMode = (state: RootState) => state.chartEditor.mode;
export const selectChartId = (state: RootState) => state.chartEditor.chartId;
export const selectDatasetId = (state: RootState) => state.chartEditor.datasetId;

// Chart data & config
export const selectChartData = (state: RootState) => state.chartEditor.chartData;
export const selectChartConfig = (state: RootState) => state.chartEditor.chartConfig;
export const selectCurrentChartType = (state: RootState) => state.chartEditor.currentChartType;
export const selectWorkingDataset = (state: RootState) => state.chartEditor.workingDataset;

// Edit states
export const selectEditableName = (state: RootState) => state.chartEditor.editableName;
export const selectEditableDescription = (state: RootState) =>
  state.chartEditor.editableDescription;
export const selectIsEditingName = (state: RootState) => state.chartEditor.isEditingName;
export const selectIsEditingDescription = (state: RootState) =>
  state.chartEditor.isEditingDescription;

// Original values
export const selectOriginalName = (state: RootState) => state.chartEditor.originalName;
export const selectOriginalDescription = (state: RootState) =>
  state.chartEditor.originalDescription;
export const selectOriginalConfig = (state: RootState) => state.chartEditor.originalConfig;
export const selectOriginalChartType = (state: RootState) => state.chartEditor.originalChartType;

// Reset trigger
export const selectResetTrigger = (state: RootState) => state.chartEditor.resetTrigger;

// Validation
export const selectValidationErrors = (state: RootState) => state.chartEditor.validationErrors;

// Computed selectors
export const selectHasChanges = createSelector(
  [
    selectMode,
    selectEditableName,
    selectOriginalName,
    selectEditableDescription,
    selectOriginalDescription,
    selectCurrentChartType,
    selectOriginalChartType,
    selectChartConfig,
    selectOriginalConfig,
  ],
  (
    mode,
    editableName,
    originalName,
    editableDescription,
    originalDescription,
    currentChartType,
    originalChartType,
    chartConfig,
    originalConfig
  ) => {
    if (mode !== 'edit') {
      return false;
    }

    const nameChanged = editableName !== originalName;
    const descriptionChanged = editableDescription !== originalDescription;
    const chartTypeChanged = currentChartType !== originalChartType;

    // Handle config comparison
    const configChanged = (() => {
      if (!chartConfig && !originalConfig) return false;
      if (!chartConfig || !originalConfig) return true;

      // Sort object keys recursively for consistent comparison
      const sortObjectKeys = (obj: any): any => {
        if (obj === null || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(sortObjectKeys);

        return Object.keys(obj)
          .sort()
          .reduce((result: any, key) => {
            result[key] = sortObjectKeys(obj[key]);
            return result;
          }, {});
      };

      const sortedCurrent = sortObjectKeys(chartConfig);
      const sortedOriginal = sortObjectKeys(originalConfig);

      return JSON.stringify(sortedCurrent) !== JSON.stringify(sortedOriginal);
    })();

    return nameChanged || descriptionChanged || chartTypeChanged || configChanged;
  }
);

export const selectIsFormValid = createSelector([selectValidationErrors], validationErrors => {
  const hasBasicErrors =
    validationErrors.name ||
    validationErrors.description ||
    validationErrors.title ||
    validationErrors.xAxisLabel ||
    validationErrors.yAxisLabel;

  const hasSeriesErrors = Object.values(validationErrors.seriesNames).some(error => error);

  return !hasBasicErrors && !hasSeriesErrors;
});
