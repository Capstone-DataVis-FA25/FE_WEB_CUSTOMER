import React, { createContext, useContext, useState, ReactNode } from 'react';
import type Papa from 'papaparse';

// Types
interface NumberFormat {
  thousandsSeparator: string;
  decimalSeparator: string;
}

interface DatasetState {
  // Data states
  originalTextContent: string;
  parsedData: Papa.ParseResult<string[]> | null;

  // Configuration states
  selectedDelimiter: string;
  numberFormat: NumberFormat;

  // UI states
  isUploading: boolean;

  // Form states
  datasetName: string;
  description: string;
}

interface DatasetContextType extends DatasetState {
  // Data actions
  setOriginalTextContent: (content: string) => void;
  setParsedData: (data: Papa.ParseResult<string[]> | null) => void;

  // Configuration actions
  setSelectedDelimiter: (delimiter: string) => void;
  setNumberFormat: (format: NumberFormat) => void;

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
  selectedDelimiter: ',',
  numberFormat: {
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  isUploading: false,
  datasetName: '',
  description: '',
};

// Provider component
interface DatasetProviderProps {
  children: ReactNode;
}

export const DatasetProvider: React.FC<DatasetProviderProps> = ({ children }) => {
  const [state, setState] = useState<DatasetState>(initialState);

  // Data actions
  const setOriginalTextContent = (content: string) => {
    setState(prev => ({ ...prev, originalTextContent: content }));
  };

  const setParsedData = (data: Papa.ParseResult<string[]> | null) => {
    setState(prev => ({ ...prev, parsedData: data }));
  };

  // Configuration actions
  const setSelectedDelimiter = (delimiter: string) => {
    setState(prev => ({ ...prev, selectedDelimiter: delimiter }));
  };

  const setNumberFormat = (format: NumberFormat) => {
    setState(prev => ({ ...prev, numberFormat: format }));
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
    setSelectedDelimiter,
    setNumberFormat,
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
