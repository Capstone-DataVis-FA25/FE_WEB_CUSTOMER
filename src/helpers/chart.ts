import type { ChartConfig, SeriesConfig } from '@/types/chart';

/**
 * Helper function to check if a column is available for a specific series
 * @param axisConfigs - Array of series configurations
 * @param config - Chart configuration
 * @param column  - Column name to check
 * @param seriesId - Series ID
 * @returns - True if the column is available for the series, false otherwise
 */
export const isColumnAvailableForSeries = (
  axisConfigs: SeriesConfig[],
  config: ChartConfig,
  column: string,
  seriesId: string
) => {
  const isNotXAxis = column !== config.xAxisKey;
  const currentSeries = axisConfigs.find(s => s.id === seriesId);
  const isCurrentColumn = currentSeries?.dataColumn === column;
  const isUsedByOther = axisConfigs.some(s => s.id !== seriesId && s.dataColumn === column);

  return isNotXAxis && (isCurrentColumn || !isUsedByOther);
};

/**
 * Calculate responsive default dimensions
 * @returns
 */
export const getResponsiveDefaults = () => {
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const containerWidth = Math.min(screenWidth * 0.7, 1000); // 70% of screen, max 1000px
  const aspectRatio = 16 / 9; // Golden ratio for charts

  return {
    width: Math.max(600, Math.min(containerWidth, 1000)), // Min 600px, max 1000px
    height: Math.max(300, Math.min(containerWidth / aspectRatio, 600)), // Min 300px, max 600px
  };
};

/**
 * Calculate responsive fontSize based on chart dimensions
 * @returns
 */
export const getResponsiveFontSize = (config: ChartConfig) => {
  const baseSize = Math.min(config.width, config.height);
  if (baseSize <= 300) return { axis: 10, label: 12, title: 14 };
  if (baseSize <= 500) return { axis: 11, label: 13, title: 16 };
  if (baseSize <= 700) return { axis: 12, label: 14, title: 18 };
  if (baseSize <= 900) return { axis: 13, label: 15, title: 20 };
  return { axis: 14, label: 16, title: 22 };
};
