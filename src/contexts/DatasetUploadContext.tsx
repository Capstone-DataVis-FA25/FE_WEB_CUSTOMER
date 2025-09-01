import React, { createContext, useContext, useState, ReactNode } from 'react';
import type Papa from 'papaparse';

// Types
interface NumberFormat {
  thousandsSeparator: string;
  decimalSeparator: string;
}

interface DatasetUploadState {
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

interface DatasetUploadContextType extends DatasetUploadState {
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

const DatasetUploadContext = createContext<DatasetUploadContextType | undefined>(undefined);

// Initial state
const initialState: DatasetUploadState = {
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
interface DatasetUploadProviderProps {
  children: ReactNode;
}

export const DatasetUploadProvider: React.FC<DatasetUploadProviderProps> = ({ children }) => {
  const [state, setState] = useState<DatasetUploadState>(initialState);

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

  const contextValue: DatasetUploadContextType = {
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

  return (
    <DatasetUploadContext.Provider value={contextValue}>{children}</DatasetUploadContext.Provider>
  );
};

// Custom hook
export const useDatasetUpload = (): DatasetUploadContextType => {
  const context = useContext(DatasetUploadContext);
  if (context === undefined) {
    throw new Error('useDatasetUpload must be used within a DatasetUploadProvider');
  }
  return context;
};

export default DatasetUploadContext;
