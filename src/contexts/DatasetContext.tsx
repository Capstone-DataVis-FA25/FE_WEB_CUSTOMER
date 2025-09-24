import React, { createContext, useContext, useState, useCallback } from 'react';
import type { DataHeader, ParsedDataResult } from '@/utils/dataProcessors';

// Types
export interface NumberFormat {
  thousandsSeparator: string;
  decimalSeparator: string;
}

export interface DateFormat {
  format: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY/MM/DD' | 'DD-MM-YYYY' | 'MM-DD-YYYY' | 'YYYY-MM-DD';
}

interface ValidationErrors {
  numberFormat?: {
    separatorsEqual?: boolean;
    missingDecimalSeparator?: boolean;
  };
  datasetName?: {
    empty?: boolean;
    tooLong?: boolean;
  };
  data?: {
    parseError?: boolean;
    invalidFormat?: boolean;
  };
}

interface DatasetState {
  // Layer 1: Raw file content
  originalTextContent: string;
  isJsonFormat: boolean;

  // Layer 2: Parsed original data (immutable reference)
  originalParsedData: ParsedDataResult | null;

  // Layer 3: Current working data (user modifications)
  currentParsedData: ParsedDataResult | null;

  // Configuration states (affects Layer 2 regeneration)
  selectedDelimiter: string;
  numberFormat: NumberFormat;
  dateFormat: DateFormat;
  transformationColumn?: string | null;

  // Form states
  datasetName: string;
  description: string;

  // Error states
  validationErrors: ValidationErrors;
}

interface DatasetContextType extends DatasetState {
  // Data actions
  setOriginalTextContent: (content: string) => void;
  setOriginalParsedData: (data: ParsedDataResult | null) => void;
  setCurrentParsedData: (data: ParsedDataResult | null) => void;
  setIsJsonFormat: (isJson: boolean) => void;

  // Configuration actions
  setSelectedDelimiter: (delimiter: string) => void;
  setNumberFormat: (format: NumberFormat) => void;
  setDateFormat: (format: DateFormat) => void;
  setTransformationColumn: (column: string | null) => void;

  // Form actions
  setDatasetName: (name: string) => void;
  setDescription: (description: string) => void;

  // Error actions
  setValidationError: (category: keyof ValidationErrors, field: string, value: boolean) => void;
  clearValidationErrors: (category?: keyof ValidationErrors) => void;
  hasValidationErrors: () => boolean;

  // Utility actions
  resetState: () => void;
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

// Initial state
const initialState: DatasetState = {
  originalTextContent: '',
  isJsonFormat: false,
  originalParsedData: null,
  currentParsedData: null,
  selectedDelimiter: ',',
  numberFormat: {
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  dateFormat: {
    format: 'DD/MM/YYYY',
  },
  transformationColumn: null,
  datasetName: '',
  description: '',
  validationErrors: {},
};

// Provider component
interface DatasetProviderProps {
  children: React.ReactNode;
}

export const DatasetProvider: React.FC<DatasetProviderProps> = ({ children }) => {
  const [state, setState] = useState<DatasetState>(initialState);

  // Data actions
  const setOriginalTextContent = (content: string) => {
    setState(prev => ({ ...prev, originalTextContent: content }));
  };

  const setOriginalParsedData = (data: ParsedDataResult | null) => {
    setState(prev => ({ ...prev, originalParsedData: data }));
  };

  const setCurrentParsedData = (data: ParsedDataResult | null) => {
    setState(prev => ({ ...prev, currentParsedData: data }));
  };

  const setIsJsonFormat = (isJson: boolean) => {
    setState(prev => ({ ...prev, isJsonFormat: isJson }));
  };

  // Configuration actions
  const setSelectedDelimiter = (delimiter: string) => {
    setState(prev => ({ ...prev, selectedDelimiter: delimiter }));
  };

  const setNumberFormat = (format: NumberFormat) => {
    setState(prev => ({ ...prev, numberFormat: format }));
  };

  const setDateFormat = (format: DateFormat) => {
    setState(prev => ({ ...prev, dateFormat: format }));
  };

  const setTransformationColumn = (column: string | null) => {
    setState(prev => ({ ...prev, transformationColumn: column }));
  };

  // Form actions
  const setDatasetName = (name: string) => {
    setState(prev => ({ ...prev, datasetName: name }));
  };

  const setDescription = (description: string) => {
    setState(prev => ({ ...prev, description: description }));
  };

  // Error actions
  const setValidationError = useCallback(
    (category: keyof ValidationErrors, field: string, value: boolean) => {
      setState(prev => ({
        ...prev,
        validationErrors: {
          ...prev.validationErrors,
          [category]: {
            ...prev.validationErrors[category],
            [field]: value,
          },
        },
      }));
    },
    []
  );

  const clearValidationErrors = useCallback((category?: keyof ValidationErrors) => {
    if (category) {
      setState(prev => ({
        ...prev,
        validationErrors: {
          ...prev.validationErrors,
          [category]: {},
        },
      }));
    } else {
      setState(prev => ({
        ...prev,
        validationErrors: {},
      }));
    }
  }, []);

  const hasValidationErrors = useCallback((): boolean => {
    const errors = state.validationErrors;
    return Object.values(errors).some(
      categoryErrors =>
        categoryErrors && Object.values(categoryErrors).some(error => error === true)
    );
  }, [state.validationErrors]);

  // Utility actions
  const resetState = () => {
    setState(initialState);
  };

  const contextValue: DatasetContextType = {
    ...state,
    setOriginalTextContent,
    setOriginalParsedData,
    setCurrentParsedData,
    setIsJsonFormat,
    setSelectedDelimiter,
    setNumberFormat,
    setDateFormat,
    setTransformationColumn,
    setDatasetName,
    setDescription,
    setValidationError,
    clearValidationErrors,
    hasValidationErrors,
    resetState,
  };

  return <DatasetContext.Provider value={contextValue}>{children}</DatasetContext.Provider>;
};

// Custom hook
export const useDataset = (): DatasetContextType => {
  const context = useContext(DatasetContext);
  if (context === undefined) {
    throw new Error('useDataset must be used within a DatasetProvider');
  }
  return context;
};

export default DatasetContext;
