import type { MainChartConfig } from '@/types/chart';
import type { Dataset } from '../dataset/datasetAPI';

export interface ChartAPI {
  id: string;
  name: string;
  description?: string;
  type: ChartType;
  createdAt: string;
  updatedAt: string;
  datasetId: string;
  userId: string;
  dataset?: Dataset;
  isPublic?: boolean;
  views?: number;
  category?: string;
  config?: MainChartConfig;
  datasetName?: string;
}

export interface ChartState {
  charts: ChartAPI[];
  currentChart: ChartAPI | null;
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  error: string | null;
}

export enum ChartType {
  Line = 'line',
  Bar = 'bar',
  Area = 'area',
  Scatter = 'scatter',
}

// Chart configuration interfaces
export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartRequest {
  name: string;
  description?: string;
  type: ChartType;
  config: MainChartConfig;
  datasetId?: string;
}
