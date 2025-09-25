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
  tablet: { width: 768, height: 480, labelKey: 'size_preset_tablet', label: 'Tablet' },
  responsive: { width: 0, height: 0, labelKey: 'size_preset_responsive', label: 'Responsive' },
};

// Common utility function to get responsive defaults
export const getResponsiveDefaults = () => {
  if (typeof window === 'undefined') {
    return { width: 600, height: 400 };
  }

  const screenWidth = window.innerWidth;
  const containerWidth = Math.min(screenWidth * 0.8, 1200);
  const aspectRatio = 0.6; // 16:10 aspect ratio

  return {
    width: Math.max(containerWidth, 300),
    height: Math.max(containerWidth * aspectRatio, 200),
  };
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

// Base chart configuration interface (common properties)
export interface BaseChartConfig {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  xAxisKey: string;
  yAxisKeys: string[];
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  showLegend: boolean;
  showGrid: boolean;
  animationDuration: number;
  xAxisStart: 'auto' | 'zero';
  yAxisStart: 'auto' | 'zero';

  // Styling configs
  gridOpacity: number;
  legendPosition: 'top' | 'bottom' | 'left' | 'right';

  // Axis configs
  xAxisRotation: number;
  yAxisRotation: number;
  showAxisLabels: boolean;
  showAxisTicks: boolean;

  // Interaction configs
  enableZoom: boolean;
  enablePan: boolean;
  zoomExtent: number;
  showTooltip: boolean;

  // Visual configs
  theme: 'light' | 'dark' | 'auto';
  backgroundColor: string;
  titleFontSize: number;
  labelFontSize: number;
  legendFontSize: number;
}

// Line chart specific configuration
export interface LineChartConfig extends BaseChartConfig {
  disabledLines: string[];
  showPoints: boolean;
  showPointValues: boolean; // Show values on data points
  curve: keyof typeof curveOptions;
  lineWidth: number;
  pointRadius: number;
}

// Area chart specific configuration
export interface AreaChartConfig extends BaseChartConfig {
  disabledLines: string[];
  showPoints: boolean;
  showPointValues: boolean; // Show values on data points
  showStroke: boolean;
  curve: keyof typeof curveOptions;
  lineWidth: number;
  pointRadius: number;
  opacity: number;
  stackedMode: boolean;
}

// Bar chart specific configuration
export interface BarChartConfig extends BaseChartConfig {
  disabledBars: string[];
  barType: 'grouped' | 'stacked';
  barWidth: number;
  barSpacing: number;
}

// For backward compatibility, keep ChartConfig as LineChartConfig
export type ChartConfig = LineChartConfig;

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
