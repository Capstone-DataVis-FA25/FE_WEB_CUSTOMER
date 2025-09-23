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
