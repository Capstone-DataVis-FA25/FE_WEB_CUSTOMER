import * as d3 from 'd3-shape';
// Removed direct d3 import to avoid hard dependency during type-check

// Color configuration
export type ColorConfig = Record<string, { light: string; dark: string }>;

// CHART TYPE GENERATION

export type MainChartConfig =
  | LineChartConfig
  | BarChartConfig
  | AreaChartConfig
  | ScatterChartConfig
  | PieChartConfig
  | DonutChartConfig
  | CyclePlotConfig;
// Scatter chart specific configuration
export interface SubScatterChartConfig extends BaseChartConfig {
  pointRadius?: number;
}

// Cycle Plot specific configuration
export interface SubCyclePlotChartConfig extends BaseChartConfig {
  showPoints?: boolean;
  curve?: keyof typeof curveOptions;
  lineWidth?: number;
  pointRadius?: number;
}

export interface ScatterChartConfig {
  config: SubScatterChartConfig;
  formatters: Partial<FormatterConfig>;
  axisConfigs: AxisConfig;
  chartType: 'scatter';
}

export interface LineChartConfig {
  config: SubLineChartConfig;
  formatters: Partial<FormatterConfig>;
  axisConfigs: AxisConfig;
  chartType: 'line';
}

export interface BarChartConfig {
  config: SubBarChartConfig;
  formatters: Partial<FormatterConfig>;
  axisConfigs: AxisConfig;
  chartType: 'bar';
}

export interface AreaChartConfig {
  config: SubAreaChartConfig;
  formatters: Partial<FormatterConfig>;
  axisConfigs: AxisConfig;
  chartType: 'area';
}

export interface PieChartConfig {
  config: SubPieDonutChartConfig;
  formatters: Partial<PieDonutFormatterConfig>;
  chartType: 'pie';
}

export interface DonutChartConfig {
  config: SubPieDonutChartConfig;
  formatters: Partial<PieDonutFormatterConfig>;
  chartType: 'donut';
}

export interface CyclePlotAxisConfig extends AxisConfig {
  cycleKey?: string;
  periodKey?: string;
  valueKey?: string;
  cycleColors?: Record<string, { light: string; dark: string }>;
  showAverageLine?: boolean;
  emphasizeLatestCycle?: boolean;
  showRangeBand?: boolean;
  periodOrdering?: 'auto' | 'custom';
  showTooltipDelta?: boolean;
}

export interface CyclePlotConfig {
  config: SubCyclePlotChartConfig;
  formatters: Partial<FormatterConfig>;
  axisConfigs: CyclePlotAxisConfig;
  chartType: 'cycleplot';
}

// Curve options
export const curveOptions = {
  curveLinear: d3.curveLinear,
  curveMonotoneX: d3.curveMonotoneX,
  curveMonotoneY: d3.curveMonotoneY,
  curveBasis: d3.curveBasis,
  curveCardinal: d3.curveCardinal,
  curveCatmullRom: d3.curveCatmullRom,
  curveStep: d3.curveStep,
  curveStepBefore: d3.curveStepBefore,
  curveStepAfter: d3.curveStepAfter,
} as const;

// Common chart size presets (unified for all chart types)
export const sizePresets = {
  tiny: { width: 300, height: 200, labelKey: 'size_preset_tiny', label: 'Tiny' },
  small: { width: 400, height: 250, labelKey: 'size_preset_small', label: 'Small' },
  medium: { width: 600, height: 375, labelKey: 'size_preset_medium', label: 'Medium' },
  large: { width: 800, height: 500, labelKey: 'size_preset_large', label: 'Large' },
  xlarge: { width: 1000, height: 625, labelKey: 'size_preset_xlarge', label: 'X-Large' },
  wide: { width: 1200, height: 400, labelKey: 'size_preset_wide', label: 'Wide' },
  ultrawide: { width: 1400, height: 350, labelKey: 'size_preset_ultrawide', label: 'Ultra Wide' },
  square: { width: 500, height: 500, labelKey: 'size_preset_square', label: 'Square' },
  presentation: {
    width: 1024,
    height: 768,
    labelKey: 'size_preset_presentation',
    label: 'Presentation',
  },
  mobile: { width: 350, height: 300, labelKey: 'size_preset_mobile', label: 'Mobile' },
  // tablet: { width: 768, height: 480, labelKey: 'size_preset_tablet', label: 'Tablet' },
  // responsive: { width: 0, height: 0, labelKey: 'size_preset_responsive', label: 'Responsive' },
};

// Common utility function to get responsive defaults
export const getResponsiveDefaults = () => {
  if (typeof window === 'undefined') {
    return { width: 600, height: 400 };
  }

  const screenWidth = window.innerWidth;
  const containerWidth = Math.min(screenWidth * 0.8, 1200);
  const aspectRatio = 0.6;

  return {
    width: Math.max(containerWidth, 300),
    height: Math.max(containerWidth * aspectRatio, 200),
  };
};

export interface AxisConfig {
  xAxisKey?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  xAxisStart?: 'auto' | 'zero';
  yAxisStart?: 'auto' | 'zero';
  xAxisRotation?: number;
  yAxisRotation?: number;
  showAxisLabels?: boolean;
  showAxisTicks?: boolean;
  seriesConfigs?: SeriesConfig[];
}

export type DataBoundField =
  | 'xAxisKey'
  | 'seriesConfigs'
  | 'labelKey'
  | 'valueKey'
  | 'cycleKey'
  | 'periodKey';

export const CHART_DATA_BINDING_KEYS: Record<MainChartConfig['chartType'], DataBoundField[]> = {
  line: ['xAxisKey', 'seriesConfigs'],
  bar: ['xAxisKey', 'seriesConfigs'],
  area: ['xAxisKey', 'seriesConfigs'],
  scatter: ['xAxisKey', 'seriesConfigs'],
  pie: ['labelKey', 'valueKey'],
  donut: ['labelKey', 'valueKey'],
  cycleplot: ['cycleKey', 'periodKey', 'valueKey'],
};

// Path-based definition that reflects actual nesting
export type DataBindingPath =
  | 'axisConfigs.xAxisKey'
  | 'axisConfigs.seriesConfigs'
  | 'config.labelKey'
  | 'config.valueKey'
  | 'axisConfigs.cycleKey'
  | 'axisConfigs.periodKey'
  | 'axisConfigs.valueKey';

export const CHART_DATA_BINDING_PATHS: Record<MainChartConfig['chartType'], DataBindingPath[]> = {
  line: ['axisConfigs.xAxisKey', 'axisConfigs.seriesConfigs'],
  bar: ['axisConfigs.xAxisKey', 'axisConfigs.seriesConfigs'],
  area: ['axisConfigs.xAxisKey', 'axisConfigs.seriesConfigs'],
  scatter: ['axisConfigs.xAxisKey', 'axisConfigs.seriesConfigs'],
  pie: ['config.labelKey', 'config.valueKey'],
  donut: ['config.labelKey', 'config.valueKey'],
  cycleplot: ['axisConfigs.cycleKey', 'axisConfigs.periodKey', 'axisConfigs.valueKey'],
};

// Series configuration interface for Data Series management
export interface SeriesConfig {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  dataColumn: string;
}

// Base chart configuration interface (common properties)
export interface BaseChartConfig {
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  // xAxisKey?: string;
  // yAxisKeys?: string[];
  title: string;
  // xAxisLabel?: string;
  // yAxisLabel?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  animationDuration?: number;

  // Styling configs
  gridOpacity?: number;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';

  // Axis configs

  // Interaction configs
  enableZoom?: boolean;
  enablePan?: boolean;
  zoomExtent?: number;
  showTooltip?: boolean;

  // Visual configs
  theme?: 'light' | 'dark' | 'auto';
  backgroundColor?: string;
  titleFontSize?: number;
  labelFontSize?: number;
  legendFontSize?: number;
}

// Line chart specific configuration
export interface SubLineChartConfig extends BaseChartConfig {
  disabledLines: string[];
  showPoints?: boolean;
  showPointValues?: boolean; // Show values on data points
  curve?: keyof typeof curveOptions;
  lineWidth?: number;
  pointRadius?: number;
}

// Area chart specific configuration
export interface SubAreaChartConfig extends BaseChartConfig {
  showStroke?: boolean;
  curve?: keyof typeof curveOptions;
  lineWidth?: number;
}

// Bar chart specific configuration
export interface SubBarChartConfig extends BaseChartConfig {
  disabledBars: string[];
  showPoints: boolean;
  showPointValues: boolean; // Show values on bars
  barType: 'grouped' | 'stacked';
  barWidth: number;
  barSpacing: number;
}

export interface SubPieDonutChartConfig extends BaseChartConfig {
  labelKey: string;
  valueKey: string;
  showLabels?: boolean;
  showPercentage?: boolean;
  showSliceValues?: boolean;
  enableAnimation?: boolean;
  innerRadius?: number;
  cornerRadius?: number;
  padAngle?: number;
  startAngle?: number;
  endAngle?: number;
  sortSlices?: 'ascending' | 'descending' | 'none';
  sliceOpacity?: number;
  legendMaxItems?: number;
  strokeWidth?: number;
  strokeColor?: string;
  hoverScale?: number;
  enableHoverEffect?: boolean;
  titleColor?: string;
  labelColor?: string;
  showTitle?: boolean;
}

// For backward compatibility, keep ChartConfig as LineChartConfig
export type ChartConfig =
  | LineChartConfig
  | BarChartConfig
  | AreaChartConfig
  | PieChartConfig
  | ScatterChartConfig;

// Formatter configuration
export interface FormatterConfig {
  useYFormatter: boolean;
  useXFormatter: boolean;
  yFormatterType:
    | 'currency'
    | 'percentage'
    | 'number'
    | 'decimal'
    | 'scientific'
    | 'bytes'
    | 'duration'
    | 'date'
    | 'custom';
  xFormatterType:
    | 'currency'
    | 'percentage'
    | 'number'
    | 'decimal'
    | 'scientific'
    | 'bytes'
    | 'duration'
    | 'date'
    | 'custom';
  customYFormatter: string;
  customXFormatter: string;
}

export interface PieDonutFormatterConfig {
  useValueFormatter: boolean;
  valueFormatterType:
    | 'currency'
    | 'percentage'
    | 'number'
    | 'decimal'
    | 'scientific'
    | 'bytes'
    | 'duration'
    | 'custom';
  customValueFormatter: string;
}

// Chart data point interface
export interface ChartDataPoint {
  [key: string]: string | number;
}
