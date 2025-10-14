import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { ChartDataPoint } from '@/components/charts/D3LineChart';
import type { MainChartConfig } from '@/types/chart';
import { ChartType } from '@/features/charts';

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

interface ChartEditorContextType {
  // Mode and IDs
  mode: 'create' | 'edit';
  chartId?: string;
  datasetId?: string;

  // Chart data & config
  chartData: ChartDataPoint[];
  setChartData: (data: ChartDataPoint[]) => void;
  chartConfig: MainChartConfig | null;
  setChartConfig: (config: MainChartConfig | null) => void;
  currentChartType: ChartType;
  setCurrentChartType: (type: ChartType) => void;

  // Edit states
  editableName: string;
  setEditableName: (name: string) => void;
  editableDescription: string;
  setEditableDescription: (desc: string) => void;
  isEditingName: boolean;
  setIsEditingName: (editing: boolean) => void;
  isEditingDescription: boolean;
  setIsEditingDescription: (editing: boolean) => void;

  // Original values for change tracking
  originalName: string;
  originalDescription: string;
  originalConfig: MainChartConfig | null;
  originalChartType: ChartType;

  // Change tracking methods
  hasChanges: boolean;
  resetToOriginal: () => void;
  updateOriginals: () => void;

  // Config update method
  handleConfigChange: (configChanges: DeepPartial<MainChartConfig>) => void;

  // Reset trigger for forcing re-renders
  resetTrigger: number;
  triggerReset: () => void;

  // Validation state
  validationErrors: ValidationErrors;
  setValidationErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
  isFormValid: boolean;

  // Validation methods
  validateField: (field: keyof Omit<ValidationErrors, 'seriesNames'>, value: string) => boolean;
  validateSeriesName: (seriesId: string, value: string) => boolean;
  clearValidationError: (field: keyof ValidationErrors, seriesId?: string) => void;
  validateForm: () => boolean;
  resetValidation: () => void;
  validateAndSave: (
    field: keyof Omit<ValidationErrors, 'seriesNames'>,
    value: string,
    onSuccess: () => void
  ) => boolean;
}

const ChartEditorContext = createContext<ChartEditorContextType | undefined>(undefined);

interface ChartEditorProviderProps {
  children: ReactNode;
  initialChartType?: ChartType;
  mode: 'create' | 'edit';
  chartId?: string;
  datasetId?: string;
}

export const ChartEditorProvider: React.FC<ChartEditorProviderProps> = ({
  children,
  initialChartType = ChartType.Line,
  mode,
  chartId,
  datasetId,
}) => {
  // Chart data & config states
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartConfig, setChartConfig] = useState<MainChartConfig | null>(null);
  const [currentChartType, setCurrentChartType] = useState<ChartType>(initialChartType);

  // Edit states
  const [editableName, setEditableName] = useState('');
  const [editableDescription, setEditableDescription] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  // Original values for change tracking
  const [originalName, setOriginalName] = useState('');
  const [originalDescription, setOriginalDescription] = useState('');
  const [originalConfig, setOriginalConfig] = useState<MainChartConfig | null>(null);
  const [originalChartType, setOriginalChartType] = useState<ChartType>(ChartType.Line);

  // Reset trigger
  const [resetTrigger, setResetTrigger] = useState(0);

  // Validation states
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    name: false,
    description: false,
    title: false,
    xAxisLabel: false,
    yAxisLabel: false,
    seriesNames: {},
  });

  // Calculate hasChanges
  const hasChanges = useMemo(() => {
    if (mode !== 'edit') {
      return false;
    }

    const nameChanged = editableName !== originalName;
    const descriptionChanged = editableDescription !== originalDescription;
    const chartTypeChanged = currentChartType !== originalChartType;

    // Handle config comparison more carefully
    const configChanged = (() => {
      // If both are null or undefined, no change
      if (!chartConfig && !originalConfig) return false;
      // If one is null and other isn't, there's a change
      if (!chartConfig || !originalConfig) return true;
      // Compare JSON strings
      return JSON.stringify(chartConfig) !== JSON.stringify(originalConfig);
    })();

    return nameChanged || descriptionChanged || chartTypeChanged || configChanged;
  }, [
    editableName,
    originalName,
    editableDescription,
    originalDescription,
    currentChartType,
    originalChartType,
    chartConfig,
    originalConfig,
    mode,
  ]);

  // Reset to original values
  const resetToOriginal = useCallback(() => {
    setEditableName(originalName);
    setEditableDescription(originalDescription);
    setCurrentChartType(originalChartType);
    if (originalConfig) {
      setChartConfig(originalConfig);
    }

    // Trigger re-render of chart editor
    setResetTrigger(prev => prev + 1);

    // Exit edit modes
    setIsEditingName(false);
    setIsEditingDescription(false);
  }, [originalName, originalDescription, originalChartType, originalConfig]);

  // Update original values after successful save
  const updateOriginals = useCallback(() => {
    setOriginalName(editableName);
    setOriginalDescription(editableDescription);
    setOriginalConfig(chartConfig);
    setOriginalChartType(currentChartType);
  }, [editableName, editableDescription, chartConfig, currentChartType]);

  // Handle config changes from chart editors
  const handleConfigChange = useCallback((configChanges: DeepPartial<MainChartConfig>) => {
    if (typeof configChanges === 'object' && configChanges !== null) {
      setChartConfig(currentConfig => {
        if (!currentConfig) {
          console.warn('⚠️ No current config available, skipping update');
          return currentConfig;
        }

        // Deep merge for nested objects like margin
        const mergeDeep = (target: any, source: any) => {
          const result = { ...target };

          for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
              // If it's a nested object, merge recursively
              result[key] = mergeDeep(target[key] || {}, source[key]);
            } else {
              // Otherwise, just assign the value
              result[key] = source[key];
            }
          }

          return result;
        };

        // Merge the entire config object, not just the nested config field
        const newConfig = mergeDeep(currentConfig, configChanges) as MainChartConfig;

        // Find deep changes in nested objects
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

        const changedFields = findDeepChanges(currentConfig, configChanges);

        // Only log the 4 things you want
        console.log('📊 Current:', currentConfig);
        console.log('✅ New:', newConfig);
        console.log('🔄 Fields changed:', changedFields);
        if (changedFields.length > 0) {
          changedFields.forEach(field => {
            const getNestedValue = (obj: any, path: string) => {
              return path.split('.').reduce((current, key) => current?.[key], obj);
            };
            console.log(`  - ${field}:`, {
              from: getNestedValue(currentConfig, field),
              to: getNestedValue(newConfig, field),
            });
          });
        }

        return newConfig;
      });
    } else {
      console.warn('⚠️ Invalid configChanges provided:', configChanges);
    }
  }, []);

  // Trigger reset
  const triggerReset = useCallback(() => {
    setResetTrigger(prev => prev + 1);
  }, []);

  // Calculate if form is valid
  const isFormValid = useMemo(() => {
    const hasBasicErrors =
      validationErrors.name ||
      validationErrors.description ||
      validationErrors.title ||
      validationErrors.xAxisLabel ||
      validationErrors.yAxisLabel;

    const hasSeriesErrors = Object.values(validationErrors.seriesNames).some(error => error);

    return !hasBasicErrors && !hasSeriesErrors;
  }, [validationErrors]);

  // Validate individual field
  const validateField = useCallback(
    (field: keyof Omit<ValidationErrors, 'seriesNames'>, value: string) => {
      const isValid = value.trim().length > 0;

      setValidationErrors(prev => ({
        ...prev,
        [field]: !isValid,
      }));

      return isValid;
    },
    []
  );

  // Validate series name
  const validateSeriesName = useCallback((seriesId: string, value: string) => {
    const isValid = value.trim().length > 0;

    setValidationErrors(prev => ({
      ...prev,
      seriesNames: {
        ...prev.seriesNames,
        [seriesId]: !isValid,
      },
    }));

    return isValid;
  }, []);

  // Clear validation error for a specific field
  const clearValidationError = useCallback((field: keyof ValidationErrors, seriesId?: string) => {
    if (field === 'seriesNames' && seriesId) {
      setValidationErrors(prev => {
        const newSeriesNames = { ...prev.seriesNames };
        delete newSeriesNames[seriesId];
        return {
          ...prev,
          seriesNames: newSeriesNames,
        };
      });
    } else if (field !== 'seriesNames') {
      setValidationErrors(prev => ({
        ...prev,
        [field]: false,
      }));
    }
  }, []);

  // Validate entire form
  const validateForm = useCallback(() => {
    return isFormValid;
  }, [isFormValid]);

  // Reset all validation errors
  const resetValidation = useCallback(() => {
    setValidationErrors({
      name: false,
      description: false,
      title: false,
      xAxisLabel: false,
      yAxisLabel: false,
      seriesNames: {},
    });
  }, []);

  // Validate and save field
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

  const value: ChartEditorContextType = {
    // Mode and IDs
    mode,
    chartId,
    datasetId,

    // Chart data & config
    chartData,
    setChartData,
    chartConfig,
    setChartConfig,
    currentChartType,
    setCurrentChartType,

    // Edit states
    editableName,
    setEditableName,
    editableDescription,
    setEditableDescription,
    isEditingName,
    setIsEditingName,
    isEditingDescription,
    setIsEditingDescription,

    // Original values
    originalName,
    originalDescription,
    originalConfig,
    originalChartType,

    // Change tracking
    hasChanges,
    resetToOriginal,
    updateOriginals,

    // Config update
    handleConfigChange,

    // Reset trigger
    resetTrigger,
    triggerReset,

    // Validation
    validationErrors,
    setValidationErrors,
    isFormValid,
    validateField,
    validateSeriesName,
    clearValidationError,
    validateForm,
    resetValidation,
    validateAndSave,
  };

  return <ChartEditorContext.Provider value={value}>{children}</ChartEditorContext.Provider>;
};

export const useChartEditor = (): ChartEditorContextType => {
  const context = useContext(ChartEditorContext);
  if (context === undefined) {
    throw new Error('useChartEditor must be used within a ChartEditorProvider');
  }
  return context;
};

// Helper hook to set original values from external data (e.g., loaded chart)
export const useSetChartEditorOriginals = () => {
  const context = useContext(ChartEditorContext);
  if (context === undefined) {
    throw new Error('useSetChartEditorOriginals must be used within a ChartEditorProvider');
  }

  return useCallback(
    (data: {
      name: string;
      description: string;
      config: MainChartConfig | null;
      chartType: ChartType;
    }) => {
      // Set both current and original values
      context.setEditableName(data.name);
      context.setEditableDescription(data.description);
      context.setChartConfig(data.config);
      context.setCurrentChartType(data.chartType);

      // Update originals immediately for change tracking
      setTimeout(() => {
        context.updateOriginals();
      }, 0);
    },
    [context]
  );
};

// Helper hook for field validation with automatic error management
export const useFieldValidation = (fieldName: keyof Omit<ValidationErrors, 'seriesNames'>) => {
  const { validationErrors, validateField, clearValidationError } = useChartEditor();

  const validate = useCallback(
    (value: string) => {
      return validateField(fieldName, value);
    },
    [fieldName, validateField]
  );

  const clearError = useCallback(() => {
    clearValidationError(fieldName);
  }, [fieldName, clearValidationError]);

  return {
    hasError: validationErrors[fieldName],
    validate,
    clearError,
  };
};

// Helper hook for series name validation
export const useSeriesValidation = (seriesId: string) => {
  const { validationErrors, validateSeriesName, clearValidationError } = useChartEditor();

  const validate = useCallback(
    (value: string) => {
      return validateSeriesName(seriesId, value);
    },
    [seriesId, validateSeriesName]
  );

  const clearError = useCallback(() => {
    clearValidationError('seriesNames', seriesId);
  }, [seriesId, clearValidationError]);

  return {
    hasError: validationErrors.seriesNames[seriesId] || false,
    validate,
    clearError,
  };
};

// Helper hook for field save with validation
export const useFieldSave = (fieldName: keyof Omit<ValidationErrors, 'seriesNames'>) => {
  const { validateAndSave } = useChartEditor();

  const saveField = useCallback(
    (value: string, onSuccess: () => void) => {
      return validateAndSave(fieldName, value, onSuccess);
    },
    [fieldName, validateAndSave]
  );

  return saveField;
};
