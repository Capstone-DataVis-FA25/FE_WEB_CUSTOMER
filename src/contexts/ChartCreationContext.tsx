import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// Types
export interface Dataset {
  id: string;
  name: string;
  description?: string;
  data: string[][];
  headers?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ChartType {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'basic' | 'advanced' | 'statistical';
}

export interface ChartConfiguration {
  title: string;
  description?: string;
  width?: number;
  height?: number;
  theme?: string;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  xAxisTitle?: string;
  yAxisTitle?: string;
  animation?: boolean;
}

export interface SeriesConfig {
  id: string;
  name: string;
  dataColumn: string;
  color?: string;
  type?: string;
  visible?: boolean;
}

// Context state interface
interface ChartCreationState {
  // Dataset selection
  selectedDataset: Dataset | null;
  uploadedDataset: Dataset | null;
  
  // Chart type selection
  selectedChartType: ChartType | null;
  
  // Chart configuration
  chartConfiguration: ChartConfiguration;
  
  // Series selection
  selectedSeries: SeriesConfig[];
  
  // UI states
  isCreating: boolean;
  isUploading: boolean;
  step: number;
}

// Context actions interface
interface ChartCreationActions {
  // Dataset actions
  setSelectedDataset: (dataset: Dataset | null) => void;
  setUploadedDataset: (dataset: Dataset | null) => void;
  
  // Chart type actions
  setSelectedChartType: (chartType: ChartType | null) => void;
  
  // Configuration actions
  setChartConfiguration: (config: ChartConfiguration) => void;
  updateChartConfiguration: (updates: Partial<ChartConfiguration>) => void;
  
  // Series actions
  setSelectedSeries: (series: SeriesConfig[]) => void;
  addSeries: (series: SeriesConfig) => void;
  removeSeries: (seriesId: string) => void;
  updateSeries: (seriesId: string, updates: Partial<SeriesConfig>) => void;
  
  // UI actions
  setIsCreating: (isCreating: boolean) => void;
  setIsUploading: (isUploading: boolean) => void;
  setStep: (step: number) => void;
  
  // Reset actions
  resetChartCreation: () => void;
}

// Combined context type
type ChartCreationContextType = ChartCreationState & ChartCreationActions;

// Create context
const ChartCreationContext = createContext<ChartCreationContextType | undefined>(undefined);

// Initial state
const initialState: ChartCreationState = {
  selectedDataset: null,
  uploadedDataset: null,
  selectedChartType: null,
  chartConfiguration: {
    title: '',
    description: '',
    width: 800,
    height: 400,
    theme: 'default',
    colors: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'],
    showLegend: true,
    showGrid: true,
    xAxisTitle: '',
    yAxisTitle: '',
    animation: true,
  },
  selectedSeries: [],
  isCreating: false,
  isUploading: false,
  step: 0,
};

// Provider component
interface ChartCreationProviderProps {
  children: ReactNode;
}

export function ChartCreationProvider({ children }: ChartCreationProviderProps) {
  const [state, setState] = useState<ChartCreationState>(initialState);

  // Dataset actions
  const setSelectedDataset = (dataset: Dataset | null) => {
    setState(prev => ({ ...prev, selectedDataset: dataset }));
  };

  const setUploadedDataset = (dataset: Dataset | null) => {
    setState(prev => ({ ...prev, uploadedDataset: dataset }));
  };

  // Chart type actions
  const setSelectedChartType = (chartType: ChartType | null) => {
    setState(prev => ({ ...prev, selectedChartType: chartType }));
  };

  // Configuration actions
  const setChartConfiguration = (config: ChartConfiguration) => {
    setState(prev => ({ ...prev, chartConfiguration: config }));
  };

  const updateChartConfiguration = (updates: Partial<ChartConfiguration>) => {
    setState(prev => ({
      ...prev,
      chartConfiguration: { ...prev.chartConfiguration, ...updates }
    }));
  };

  // Series actions
  const setSelectedSeries = (series: SeriesConfig[]) => {
    setState(prev => ({ ...prev, selectedSeries: series }));
  };

  const addSeries = (series: SeriesConfig) => {
    setState(prev => ({
      ...prev,
      selectedSeries: [...prev.selectedSeries, series]
    }));
  };

  const removeSeries = (seriesId: string) => {
    setState(prev => ({
      ...prev,
      selectedSeries: prev.selectedSeries.filter(s => s.id !== seriesId)
    }));
  };

  const updateSeries = (seriesId: string, updates: Partial<SeriesConfig>) => {
    setState(prev => ({
      ...prev,
      selectedSeries: prev.selectedSeries.map(s =>
        s.id === seriesId ? { ...s, ...updates } : s
      )
    }));
  };

  // UI actions
  const setIsCreating = (isCreating: boolean) => {
    setState(prev => ({ ...prev, isCreating }));
  };

  const setIsUploading = (isUploading: boolean) => {
    setState(prev => ({ ...prev, isUploading }));
  };

  const setStep = (step: number) => {
    setState(prev => ({ ...prev, step }));
  };

  // Reset actions
  const resetChartCreation = () => {
    setState(initialState);
  };

  const contextValue: ChartCreationContextType = {
    ...state,
    setSelectedDataset,
    setUploadedDataset,
    setSelectedChartType,
    setChartConfiguration,
    updateChartConfiguration,
    setSelectedSeries,
    addSeries,
    removeSeries,
    updateSeries,
    setIsCreating,
    setIsUploading,
    setStep,
    resetChartCreation,
  };

  return (
    <ChartCreationContext.Provider value={contextValue}>
      {children}
    </ChartCreationContext.Provider>
  );
}

// Hook to use the context
export function useChartCreation() {
  const context = useContext(ChartCreationContext);
  if (context === undefined) {
    throw new Error('useChartCreation must be used within a ChartCreationProvider');
  }
  return context;
}
