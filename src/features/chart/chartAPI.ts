import { axiosPrivate } from '@/services/axios';
import { API_ENDPOINTS } from '@/constants/endpoints';

// Define supported chart types that align with the backend
export const CHART_TYPES = [
  'line',
  'bar',
  'pie',
  'area',
  'donut',
  'column',
  'scatter',
  'map',
  'heatmap',
  'bubble',
  'radar',
  'treemap',
  'sankey',
  'gauge',
  'funnel',
  'waterfall',
] as const;

export type ChartType = (typeof CHART_TYPES)[number];

// Chart configuration interfaces
export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartConfig {
  // Basic chart properties
  title: string;
  width: number;
  height: number;
  margin: ChartMargin;

  // Axis configuration
  xAxisKey?: string;
  yAxisKeys?: string[];
  xAxisIndex?: number;
  yAxisIndices?: number[];
  xAxisName?: string;
  yAxisNames?: string[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  yAxisLabels?: string[];

  // Animation settings
  animationDuration?: number;

  // Display settings
  showLegend?: boolean;
  showGrid?: boolean;
  showPoints?: boolean;
  showValues?: boolean;
  showTooltip?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;

  // Chart-type specific settings
  // Bar/Column charts
  barType?: 'grouped' | 'stacked' | 'percentage';
  barWidth?: number;
  barGap?: number;

  // Line charts
  lineType?: 'basic' | 'smooth' | 'stepped' | 'dashed';
  curveType?: 'linear' | 'curveMonotoneX' | 'curveCardinal' | 'curveStep';
  strokeWidth?: number;

  // Area charts
  areaType?: 'basic' | 'stacked' | 'percentage' | 'stream';
  fillOpacity?: number;

  // Pie/Donut charts
  pieType?: 'basic' | 'exploded' | 'nested';
  donutType?: 'basic' | 'multi-level' | 'progress';
  innerRadius?: number;
  showLabels?: boolean;
  showPercentages?: boolean;

  // Scatter/Bubble charts
  scatterType?: 'basic' | 'regression' | 'clustered';
  bubbleType?: 'basic' | 'packed' | 'force';

  // Heatmap charts
  heatmapType?: 'grid' | 'calendar' | 'treemap';
  colorScheme?: 'blues' | 'greens' | 'reds' | 'oranges' | 'purples' | 'viridis';

  // Radar charts
  radarType?: 'polygon' | 'circular' | 'spider';

  // Advanced chart types
  treemapType?: 'squarified' | 'slice-dice' | 'binary';
  sankeyType?: 'horizontal' | 'vertical' | 'circular';
  gaugeType?: 'arc' | 'linear' | 'bullet';
  funnelType?: 'pyramid' | 'inverted' | 'cylinder';
  waterfallType?: 'standard' | 'bridge' | 'variance';

  // Advanced properties
  nodeWidth?: number;
  nodePadding?: number;
  minValue?: number;
  maxValue?: number;
  showThreshold?: boolean;
  showConnectors?: boolean;
  showTotals?: boolean;
  tiling?: 'squarify' | 'slice' | 'dice' | 'resquarify';

  // Axis formatting
  xAxisRotation?: number;
  yAxisRotation?: number;
  xAxisFormatterType?: 'auto' | 'number' | 'currency' | 'percentage' | 'date' | 'time';
  yAxisFormatterType?: 'auto' | 'number' | 'currency' | 'percentage' | 'date' | 'time';

  // Colors
  backgroundColor?: string;
  gridColor?: string;
  textColor?: string;
  colorPalette?: string[];

  // Text & Font settings
  titleFontSize?: number;
  titleFontFamily?: string;
  axisLabelFontSize?: number;
  axisLabelFontFamily?: string;
  legendFontSize?: number;
  legendFontFamily?: string;

  // Legend positioning
  legendPosition?: 'top' | 'bottom' | 'left' | 'right' | 'none';
  legendAlignment?: 'start' | 'center' | 'end';
  legendSize?: number;

  // Border & Visual effects
  borderWidth?: number;
  borderColor?: string;
  shadowEffect?: boolean;

  // Axis range & scale settings
  xAxisMin?: number;
  xAxisMax?: number;
  yAxisMin?: number;
  yAxisMax?: number;
  xAxisTickInterval?: number;
  yAxisTickInterval?: number;
  xAxisScale?: 'linear' | 'log' | 'time' | 'category';
  yAxisScale?: 'linear' | 'log' | 'time' | 'category';

  // Padding & Spacing
  titlePadding?: number;
  legendPadding?: number;
  axisPadding?: number;

  // Zoom & pan
  zoomLevel?: number;
}

export interface Chart {
  id: string;
  name: string;
  description?: string;
  type: ChartType;
  config: ChartConfig; // Chart configuration object (parsed from JSON if needed)
  datasetId: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  dataset?: {
    id: string;
    name: string;
  };
}

export interface CreateChartRequest {
  name: string;
  description?: string;
  type: ChartType;
  config: ChartConfig; // Chart configuration object (not JSON string)
  datasetId: string;
}

export interface UpdateChartRequest {
  name?: string;
  description?: string;
  type?: ChartType;
  config?: ChartConfig; // Chart configuration object
}

// Get all charts for authenticated user
export const getAllCharts = async (): Promise<Chart[]> => {
  const response = await axiosPrivate.get(API_ENDPOINTS.CHARTS.GET_ALL);
  // Handle wrapped API response format
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data;
  }
  return response.data;
};

// Get chart by ID
export const getChartById = async (id: string): Promise<Chart> => {
  const response = await axiosPrivate.get(API_ENDPOINTS.CHARTS.GET_BY_ID(id));
  // Handle wrapped API response format
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data;
  }
  return response.data;
};

// Create new chart
export const createChart = async (data: CreateChartRequest): Promise<Chart> => {
  const response = await axiosPrivate.post(API_ENDPOINTS.CHARTS.CREATE, data);
  // Handle wrapped API response format
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data;
  }
  return response.data;
};

// Update chart
export const updateChart = async (id: string, data: UpdateChartRequest): Promise<Chart> => {
  const response = await axiosPrivate.patch(API_ENDPOINTS.CHARTS.UPDATE(id), data);
  // Handle wrapped API response format
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data;
  }
  return response.data;
};

// Delete chart
export const deleteChart = async (id: string): Promise<void> => {
  await axiosPrivate.delete(API_ENDPOINTS.CHARTS.DELETE(id));
};
