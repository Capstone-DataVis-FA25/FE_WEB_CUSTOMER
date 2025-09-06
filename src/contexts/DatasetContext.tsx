import React, { createContext, useContext, useState } from 'react';

// Types
interface NumberFormat {
  thousandsSeparator: string;
  decimalSeparator: string;
}

interface DatasetState {
  // Data states
  originalTextContent: string;
  parsedData: string[][] | null;
  originalHeaders: string[];
  isJsonFormat: boolean;

  // Configuration states
  selectedDelimiter: string;
  numberFormat: NumberFormat;
  transformationColumn?: string | null;

  // UI states
  isUploading: boolean;

  // Form states
  datasetName: string;
  description: string;
}

interface DatasetContextType extends DatasetState {
  // Data actions
  setOriginalTextContent: (content: string) => void;
  setParsedData: (data: string[][] | null) => void;
  setOriginalHeaders: (headers: string[]) => void;
  setIsJsonFormat: (isJson: boolean) => void;

  // Configuration actions
  setSelectedDelimiter: (delimiter: string) => void;
  setNumberFormat: (format: NumberFormat) => void;
  setTransformationColumn: (column: string | null) => void;

  // UI actions
  setIsUploading: (uploading: boolean) => void;

  // Form actions
  setDatasetName: (name: string) => void;
  setDescription: (description: string) => void;

  // Utility actions
  resetState: () => void;
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

// Initial state
const initialState: DatasetState = {
  originalTextContent: '',
  parsedData: null,
  originalHeaders: [],
  isJsonFormat: false,
  selectedDelimiter: ',',
  numberFormat: {
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  transformationColumn: null,
  isUploading: false,
  datasetName: '',
  description: '',
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

  const setParsedData = (data: string[][] | null) => {
    setState(prev => ({ ...prev, parsedData: data }));
  };

  const setOriginalHeaders = (headers: string[]) => {
    setState(prev => ({ ...prev, originalHeaders: headers }));
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

  const setTransformationColumn = (column: string | null) => {
    setState(prev => ({ ...prev, transformationColumn: column }));
  };

  // UI actions
  const setIsUploading = (uploading: boolean) => {
    setState(prev => ({ ...prev, isUploading: uploading }));
  };

  // Form actions
  const setDatasetName = (name: string) => {
    setState(prev => ({ ...prev, datasetName: name }));
  };

  const setDescription = (description: string) => {
    setState(prev => ({ ...prev, description: description }));
  };

  // Utility actions
  const resetState = () => {
    setState(initialState);
  };

  const contextValue: DatasetContextType = {
    ...state,
    setOriginalTextContent,
    setParsedData,
    setOriginalHeaders,
    setIsJsonFormat,
    setSelectedDelimiter,
    setNumberFormat,
    setTransformationColumn,
    setIsUploading,
    setDatasetName,
    setDescription,
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
