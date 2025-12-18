import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setChartData,
  setChartConfig,
  setCurrentChartType,
  setEditableName,
  setEditableDescription,
  setIsEditingName,
  setIsEditingDescription,
  updateChartConfig,
  resetToOriginal,
  updateOriginals,
  triggerReset,
  setValidationError,
  setSeriesValidationError,
  clearValidationError as clearValidationErrorAction,
  resetValidation,
  clearChartEditor,
  cacheCurrentConfig,
} from './chartEditorSlice';
import type { MainChartConfig } from '@/types/chart';
import type { ChartDataPoint } from '@/components/charts/D3LineChart';
import type { ChartType } from '@/features/charts';
import * as selectors from './chartEditorSelectors';

// Deep partial utility type
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

/**
 * Main hook to access chart editor state and actions
 * This replaces the old useChartEditor from ChartEditorContext
 */
export const useChartEditor = () => {
  const dispatch = useAppDispatch();

  // Select state (IDs derived from URL now; not in Redux)
  const chartData = useAppSelector(selectors.selectChartData);
  const chartConfig = useAppSelector(selectors.selectChartConfig);
  const currentChartType = useAppSelector(selectors.selectCurrentChartType);
  const editableName = useAppSelector(selectors.selectEditableName);
  const editableDescription = useAppSelector(selectors.selectEditableDescription);
  const isEditingName = useAppSelector(selectors.selectIsEditingName);
  const isEditingDescription = useAppSelector(selectors.selectIsEditingDescription);
  const originalName = useAppSelector(selectors.selectOriginalName);
  const originalDescription = useAppSelector(selectors.selectOriginalDescription);
  const originalConfig = useAppSelector(selectors.selectOriginalConfig);
  const originalChartType = useAppSelector(selectors.selectOriginalChartType);
  const resetTrigger = useAppSelector(selectors.selectResetTrigger);
  const validationErrors = useAppSelector(selectors.selectValidationErrors);
  const hasChanges = useAppSelector(selectors.selectHasChanges);
  const isFormValid = useAppSelector(selectors.selectIsFormValid);

  // Actions

  const handleSetChartData = useCallback(
    (data: ChartDataPoint[]) => {
      dispatch(setChartData(data));
    },
    [dispatch]
  );

  const handleSetChartConfig = (config: MainChartConfig | null) => {
    dispatch(setChartConfig(config));
  };

  const handleSetCurrentChartType = (type: ChartType) => {
    dispatch(setCurrentChartType(type));
  };

  const handleSetEditableName = useCallback(
    (name: string) => {
      dispatch(setEditableName(name));
    },
    [dispatch]
  );

  const handleSetEditableDescription = useCallback(
    (desc: string) => {
      dispatch(setEditableDescription(desc));
    },
    [dispatch]
  );

  const handleSetIsEditingName = useCallback(
    (editing: boolean) => {
      dispatch(setIsEditingName(editing));
    },
    [dispatch]
  );

  const handleSetIsEditingDescription = useCallback(
    (editing: boolean) => {
      dispatch(setIsEditingDescription(editing));
    },
    [dispatch]
  );

  const handleConfigChange = useCallback(
    (configChanges: DeepPartial<MainChartConfig>) => {
      dispatch(updateChartConfig(configChanges));
    },
    [dispatch]
  );

  const handleResetToOriginal = useCallback(() => {
    dispatch(resetToOriginal());
  }, [dispatch]);

  const handleUpdateOriginals = useCallback(() => {
    dispatch(updateOriginals());
  }, [dispatch]);

  const handleTriggerReset = useCallback(() => {
    dispatch(triggerReset());
  }, [dispatch]);

  const validateField = useCallback(
    (field: keyof Omit<ValidationErrors, 'seriesNames'>, value: string) => {
      const isValid = value.trim().length > 0;
      dispatch(setValidationError({ field, error: !isValid }));
      return isValid;
    },
    [dispatch]
  );

  const validateSeriesName = useCallback(
    (seriesId: string, value: string) => {
      const isValid = value.trim().length > 0;
      dispatch(setSeriesValidationError({ seriesId, error: !isValid }));
      return isValid;
    },
    [dispatch]
  );

  const handleClearValidationError = useCallback(
    (field: keyof ValidationErrors, seriesId?: string) => {
      dispatch(clearValidationErrorAction({ field, seriesId }));
    },
    [dispatch]
  );

  const validateForm = useCallback(() => {
    return isFormValid;
  }, [isFormValid]);

  const handleResetValidation = useCallback(() => {
    dispatch(resetValidation());
  }, [dispatch]);

  const validateAndSave = useCallback(
    (field: keyof Omit<ValidationErrors, 'seriesNames'>, value: string, onSuccess: () => void) => {
      const isValid = validateField(field, value);
      if (isValid) {
        onSuccess();
      }
      return isValid;
    },
    [validateField]
  );

  const handleClearChartEditor = useCallback(() => {
    dispatch(clearChartEditor());
  }, [dispatch]);

  return {
    // State
    chartData,
    chartConfig,
    currentChartType,
    editableName,
    editableDescription,
    isEditingName,
    isEditingDescription,
    originalName,
    originalDescription,
    originalConfig,
    originalChartType,
    resetTrigger,
    validationErrors,
    hasChanges,
    isFormValid,
    cachedConfigs: useAppSelector(selectors.selectCachedConfigs),

    // Actions
    setChartData: handleSetChartData,
    setChartConfig: handleSetChartConfig,
    setCurrentChartType: handleSetCurrentChartType,
    setEditableName: handleSetEditableName,
    setEditableDescription: handleSetEditableDescription,
    setIsEditingName: handleSetIsEditingName,
    setIsEditingDescription: handleSetIsEditingDescription,
    handleConfigChange,
    resetToOriginal: handleResetToOriginal,
    updateOriginals: handleUpdateOriginals,
    triggerReset: handleTriggerReset,
    validateField,
    validateSeriesName,
    clearValidationError: handleClearValidationError,
    validateForm,
    resetValidation: handleResetValidation,
    validateAndSave,
    clearChartEditor: handleClearChartEditor,
    cacheCurrentConfig: useCallback(() => dispatch(cacheCurrentConfig()), [dispatch]),
  };
};

// Lightweight read hook: subscribe only to specific fields to minimize rerenders
export const useChartEditorRead = () => {
  const currentChartType = useAppSelector(selectors.selectCurrentChartType);
  const chartConfig = useAppSelector(selectors.selectChartConfig);
  const chartData = useAppSelector(selectors.selectChartData);

  return { currentChartType, chartConfig, chartData };
};

// Lightweight actions hook: expose specific action dispatchers
export const useChartEditorActions = () => {
  const dispatch = useAppDispatch();

  const setChartType = useCallback(
    (type: ChartType) => dispatch(setCurrentChartType(type)),
    [dispatch]
  );

  const setConfig = useCallback(
    (config: MainChartConfig | null) => dispatch(setChartConfig(config)),
    [dispatch]
  );

  const handleConfigChange = useCallback(
    (configChanges: DeepPartial<MainChartConfig>) => {
      dispatch(updateChartConfig(configChanges));
    },
    [dispatch]
  );

  return { setCurrentChartType: setChartType, setChartConfig: setConfig, handleConfigChange };
};

/**
 * Helper hook for field validation with automatic error management
 */
export const useFieldValidation = (fieldName: keyof Omit<ValidationErrors, 'seriesNames'>) => {
  const dispatch = useAppDispatch();
  const validationErrors = useAppSelector(selectors.selectValidationErrors);

  const validate = useCallback(
    (value: string) => {
      const isValid = value.trim().length > 0;
      dispatch(setValidationError({ field: fieldName, error: !isValid }));
      return isValid;
    },
    [fieldName, dispatch]
  );

  const clearError = useCallback(() => {
    dispatch(clearValidationErrorAction({ field: fieldName }));
  }, [fieldName, dispatch]);

  return {
    hasError: validationErrors[fieldName],
    validate,
    clearError,
  };
};

/**
 * Helper hook for series name validation
 */
export const useSeriesValidation = (seriesId: string) => {
  const dispatch = useAppDispatch();
  const validationErrors = useAppSelector(selectors.selectValidationErrors);

  const validate = useCallback(
    (value: string) => {
      const isValid = value.trim().length > 0;
      dispatch(setSeriesValidationError({ seriesId, error: !isValid }));
      return isValid;
    },
    [seriesId, dispatch]
  );

  const clearError = useCallback(() => {
    dispatch(clearValidationErrorAction({ field: 'seriesNames', seriesId }));
  }, [seriesId, dispatch]);

  return {
    hasError: validationErrors.seriesNames[seriesId] || false,
    validate,
    clearError,
  };
};

/**
 * Helper hook for field save with validation
 */
export const useFieldSave = (fieldName: keyof Omit<ValidationErrors, 'seriesNames'>) => {
  const dispatch = useAppDispatch();

  const saveField = useCallback(
    (value: string, onSuccess: () => void) => {
      const isValid = value.trim().length > 0;
      dispatch(setValidationError({ field: fieldName, error: !isValid }));
      if (isValid) {
        onSuccess();
      }
      return isValid;
    },
    [fieldName, dispatch]
  );

  return saveField;
};

/**
 * Helper hook to set original values from external data (e.g., loaded chart)
 */
export const useSetChartEditorOriginals = () => {
  const dispatch = useAppDispatch();

  return useCallback(
    (data: {
      name: string;
      description: string;
      config: MainChartConfig | null;
      chartType: ChartType;
    }) => {
      // Set both current and original values
      dispatch(setEditableName(data.name));
      dispatch(setEditableDescription(data.description));
      dispatch(setChartConfig(data.config));
      dispatch(setCurrentChartType(data.chartType));

      // Update originals immediately for change tracking
      setTimeout(() => {
        dispatch(updateOriginals());
      }, 0);
    },
    [dispatch]
  );
};
