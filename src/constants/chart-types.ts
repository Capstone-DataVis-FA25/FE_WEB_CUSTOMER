/**
 * Chart Types Constants
 * Centralized definitions for supported chart types across the application
 */

/**
 * Chart types supported for creation and editing
 * These types are validated when creating charts from gallery or editor
 */
export const SUPPORTED_CHART_TYPES = [
  'line',
  'bar',
  'area',
  'scatter',
  'pie',
  'donut',
  'cycleplot',
  'heatmap',
] as const;

/**
 * Type helper for supported chart types
 */
export type SupportedChartType = (typeof SUPPORTED_CHART_TYPES)[number];

/**
 * Check if a chart type is supported for creation
 */
export const isSupportedChartType = (type: string): type is SupportedChartType => {
  return SUPPORTED_CHART_TYPES.includes(type as any);
};

/**
 * All available chart types (including those not yet supported for creation)
 */
export const ALL_CHART_TYPES = [
  ...SUPPORTED_CHART_TYPES,
  'column',
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
