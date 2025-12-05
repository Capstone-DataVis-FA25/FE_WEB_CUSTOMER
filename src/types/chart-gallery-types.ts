// Chart Template Types
export interface ChartTemplate {
  id: string;
  name: string;
  description: string;
  type: ChartType;
  category: string;
  previewImage?: string;
  configuration: ChartConfiguration;
  featured?: boolean;
}

export interface ChartCategory {
  id: string;
  name: string;
  templates: ChartTemplate[];
}

export type ChartType =
  | 'line'
  | 'bar'
  | 'pie'
  | 'area'
  | 'donut'
  | 'column'
  | 'scatter'
  | 'cycleplot'
  | 'map'
  | 'heatmap'
  | 'histogram'
  | 'bubble'
  | 'radar'
  | 'treemap'
  | 'sankey'
  | 'gauge'
  | 'funnel'
  | 'waterfall';

export type ChartPurpose =
  | 'comparison'
  | 'distribution'
  | 'change-over-time'
  | 'correlation'
  | 'geographical';

export interface ChartConfiguration {
  type: ChartType;
  orientation?: 'horizontal' | 'vertical';
  smooth?: boolean;
  donut?: boolean;
  regression?: boolean;
  [key: string]: any;
}

// Dataset Types for Data Tab
export interface Dataset {
  id: string;
  name: string;
  description: string;
  columns: DataColumn[];
  rowCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DataColumn {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  nullable: boolean;
  unique: boolean;
}

export interface ChartCreationFromData {
  datasetId: string;
  selectedColumns: string[];
  chartType: ChartType;
  configuration: ChartConfiguration;
}
