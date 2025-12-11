export interface Chart {
  id: string;
  name: string;
  description?: string;
  type: 'line' | 'bar' | 'area' | 'pie' | 'scatter';
  config?: {
    width?: number;
    height?: number;
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    [key: string]: unknown;
  };
  createdAt: string;
  updatedAt: string;
  datasetId: string;
  userId: string;
  dataset?: {
    id: string;
    name: string;
    description?: string;
  };
  isPublic?: boolean;
  views?: number;
  category?: string;
  // Additional fields that might be present
  configuration?: {
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    colors?: Record<string, string | { light: string; dark: string }>;
    [key: string]: unknown;
  };
  datasetName?: string;
}

export interface ChartState {
  charts: Chart[];
  currentChart: Chart | null;
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  error: string | null;
}

export interface CreateChartRequest {
  name: string;
  description?: string;
  type: 'line' | 'bar' | 'area' | 'pie' | 'scatter';
  datasetId: string;
  configuration?: {
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    colors?: Record<string, string | { light: string; dark: string }>;
    [key: string]: unknown;
  };
  category?: string;
  isPublic?: boolean;
}

export interface UpdateChartRequest {
  name?: string;
  description?: string;
  type?: 'line' | 'bar' | 'area' | 'pie' | 'scatter';
  configuration?: {
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    colors?: Record<string, string | { light: string; dark: string }>;
    [key: string]: unknown;
  };
  category?: string;
  isPublic?: boolean;
}
