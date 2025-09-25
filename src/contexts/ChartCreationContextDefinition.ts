import { createContext } from 'react';

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

// Chart configuration types
export interface ChartConfig {
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showPoints?: boolean;
  curve?: string;
  strokeWidth?: number;
  fillOpacity?: number;
  barType?: string;
  areaType?: string;
  pieType?: string;
  colors?: string[];
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  [key: string]: string | number | boolean | string[] | object | undefined;
}

export interface ChartType {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'basic' | 'advanced';
  defaultConfig: ChartConfig;
}

export interface ChartConfiguration {
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  showLegend: boolean;
  showGrid: boolean;
  showPoints: boolean;
  showPointValues: boolean;
  colors: string[];
  width: number;
  height: number;
  animationDuration: number;
  xAxisKey?: string;
  yAxisKeys?: string[];
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  [key: string]: string | number | boolean | string[] | object | undefined;
}

export interface SeriesConfig {
  id: string;
  name: string;
  columnIndex: number;
  color: string;
  type: 'line' | 'bar' | 'area';
  visible: boolean;
}

// State interfaces
export interface ChartCreationState {
  selectedDataset: Dataset | null;
  uploadedDataset: Dataset | null;
  selectedChartType: ChartType | null;
  chartConfiguration: ChartConfiguration;
  selectedSeries: SeriesConfig[];
  xAxisColumn: number | null;
  currentStep: number;
  isCreating: boolean;
  error: string | null;
}

// Action interfaces
export interface ChartCreationActions {
  setSelectedDataset: (dataset: Dataset | null) => void;
  setUploadedDataset: (dataset: Dataset | null) => void;
  setSelectedChartType: (chartType: ChartType | null) => void;
  updateChartConfiguration: (config: Partial<ChartConfiguration>) => void;
  addSeries: (series: SeriesConfig) => void;
  removeSeries: (seriesId: string) => void;
  updateSeries: (seriesId: string, updates: Partial<SeriesConfig>) => void;
  setXAxisColumn: (columnIndex: number | null) => void;
  setCurrentStep: (step: number) => void;
  resetState: () => void;
  setIsCreating: (creating: boolean) => void;
  setError: (error: string | null) => void;
}

// Combined context type
export type ChartCreationContextType = ChartCreationState & ChartCreationActions;

// Create context
export const ChartCreationContext = createContext<ChartCreationContextType | undefined>(undefined);
