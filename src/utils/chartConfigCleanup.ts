import type { MainChartConfig, DataHeader } from '@/types/chart';

/**
 * Checks if a column ID exists in the current headers
 */
const columnExists = (columnId: string | undefined, headers: DataHeader[]): boolean => {
  if (!columnId) return false;
  return headers.some(
    h => (h as any).id === columnId || (h as any).headerId === columnId || h.name === columnId
  );
};

/**
 * Cleans up chart configuration by removing references to columns that no longer exist.
 * This is needed when aggregation changes, as aggregated columns may be removed.
 */
export const cleanupChartConfig = (
  config: MainChartConfig | null | undefined,
  currentHeaders: DataHeader[] | undefined
): MainChartConfig | null => {
  if (!config || !currentHeaders || currentHeaders.length === 0) {
    return config;
  }

  const cleaned = { ...config };
  let hasChanges = false;

  // Clean up axis configs (for line, bar, area, scatter, cycleplot)
  if (cleaned.axisConfigs) {
    const axisConfigs = { ...cleaned.axisConfigs };

    // Clean xAxisKey
    if (axisConfigs.xAxisKey && !columnExists(axisConfigs.xAxisKey, currentHeaders)) {
      axisConfigs.xAxisKey = undefined;
      hasChanges = true;
    }

    // Clean seriesConfigs
    if (axisConfigs.seriesConfigs && Array.isArray(axisConfigs.seriesConfigs)) {
      const cleanedSeries = axisConfigs.seriesConfigs.filter(series => {
        const exists = columnExists(series.dataColumn, currentHeaders);
        if (!exists) {
          hasChanges = true;
        }
        return exists;
      });
      if (cleanedSeries.length !== axisConfigs.seriesConfigs.length) {
        axisConfigs.seriesConfigs = cleanedSeries;
        hasChanges = true;
      }
    }

    // Clean cycleplot keys
    if (cleaned.chartType === 'cycleplot') {
      if (axisConfigs.cycleKey && !columnExists(axisConfigs.cycleKey, currentHeaders)) {
        axisConfigs.cycleKey = undefined;
        hasChanges = true;
      }
      if (axisConfigs.periodKey && !columnExists(axisConfigs.periodKey, currentHeaders)) {
        axisConfigs.periodKey = undefined;
        hasChanges = true;
      }
      if (axisConfigs.valueKey && !columnExists(axisConfigs.valueKey, currentHeaders)) {
        axisConfigs.valueKey = undefined;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      cleaned.axisConfigs = axisConfigs;
    }
  }

  // Clean up pie/donut configs
  if (cleaned.config && (cleaned.chartType === 'pie' || cleaned.chartType === 'donut')) {
    const subConfig = { ...cleaned.config };
    let configChanged = false;

    // labelKey and valueKey are required, so we set them to empty string if column doesn't exist
    if (subConfig.labelKey && !columnExists(subConfig.labelKey, currentHeaders)) {
      subConfig.labelKey = '';
      configChanged = true;
    }
    if (subConfig.valueKey && !columnExists(subConfig.valueKey, currentHeaders)) {
      subConfig.valueKey = '';
      configChanged = true;
    }

    if (configChanged) {
      cleaned.config = subConfig;
      hasChanges = true;
    }
  }

  return hasChanges ? cleaned : config;
};
