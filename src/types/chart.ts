import * as d3 from 'd3';


// Color configuration
export type ColorConfig = Record<string, { light: string; dark: string }>;

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
};


// Common chart size presets
export const sizePresets = {
  tiny: { width: 300, height: 200, labelKey: 'lineChart_editor_preset_tiny' },
  small: { width: 400, height: 250, labelKey: 'lineChart_editor_preset_small' },
  medium: { width: 600, height: 375, labelKey: 'lineChart_editor_preset_medium' },
  large: { width: 800, height: 500, labelKey: 'lineChart_editor_preset_large' },
  xlarge: { width: 1000, height: 625, labelKey: 'lineChart_editor_preset_xlarge' },
  wide: { width: 1200, height: 400, labelKey: 'lineChart_editor_preset_wide' },
  ultrawide: { width: 1400, height: 350, labelKey: 'lineChart_editor_preset_ultrawide' },
  square: { width: 500, height: 500, labelKey: 'lineChart_editor_preset_square' },
  presentation: { width: 1024, height: 768, labelKey: 'lineChart_editor_preset_presentation' },
  mobile: { width: 350, height: 300, labelKey: 'lineChart_editor_preset_mobile' },
  tablet: { width: 768, height: 480, labelKey: 'lineChart_editor_preset_tablet' },
  responsive: { width: 0, height: 0, labelKey: 'lineChart_editor_preset_responsive' }
};


// Series configuration interface for Data Series management
export interface SeriesConfig {
  id: string;
  name: string;
  dataColumn: string;
  color: string;
  visible: boolean;
  lineWidth?: number;
  pointRadius?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  pointStyle?: 'circle' | 'square' | 'triangle' | 'diamond';
  opacity?: number;
  formatter?: 'inherit' | 'custom';
  customFormatter?: string;
}

// Chart configuration interface
export interface ChartConfig {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  xAxisKey: string;
  yAxisKeys: string[];
  disabledLines: string[]; // New field for disabled areas (same as line chart)
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  showLegend: boolean;
  showGrid: boolean;
  showPoints: boolean;
  showStroke?: boolean;
  animationDuration: number;
  curve: keyof typeof curveOptions;
  opacity?: number;
  stackedMode?: boolean;
  // Additional axis/visual/interactions to match LineChartEditor
  xAxisStart: 'auto' | 'zero' | number;
  yAxisStart: 'auto' | 'zero' | number;
  // New styling configs
  lineWidth: number; // Thickness of lines
  pointRadius: number; // Size of data points
  gridOpacity: number; // Grid transparency
  legendPosition: 'top' | 'bottom' | 'left' | 'right'; // Legend position

  // New axis configs
  xAxisRotation: number; // X-axis label rotation in degrees
  yAxisRotation: number; // Y-axis label rotation in degrees
  showAxisLabels: boolean; // Show/hide axis labels
  showAxisTicks: boolean; // Show/hide axis ticks

  // New interaction configs
  enableZoom: boolean; // Enable zoom functionality
  showTooltip: boolean; // Show/hide tooltips

  // New visual configs
  theme: 'light' | 'dark' | 'auto'; // Chart theme
  backgroundColor: string; // Chart background color
  titleFontSize: number; // Title font size
  labelFontSize: number; // Axis label font size
  legendFontSize: number; // Legend font size
}

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

// Chart data point interface
export interface ChartDataPoint {
  [key: string]: string | number;
}