import type { MainChartConfig } from '@/types/chart';
import type { DataHeader } from '@/utils/dataProcessors';

/**
 * Checks if a column ID exists in the current headers
 * Also checks valueId for pivot table headers
 */
const columnExists = (columnId: string | undefined, headers: DataHeader[]): boolean => {
  if (!columnId) return false;
  return headers.some(
    h =>
      (h as any).id === columnId ||
      (h as any).headerId === columnId ||
      h.name === columnId ||
      (h as any).valueId === columnId // Support pivot table valueId matching
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
    return config ?? null;
  }

  const cleaned = { ...config };
  let hasChanges = false;

  // Clean up axis configs (for line, bar, area, scatter, cycleplot)
  // Type guard to check if config has axisConfigs property
  if ('axisConfigs' in cleaned && cleaned.axisConfigs) {
    const axisConfigs = { ...cleaned.axisConfigs };

    // Clean xAxisKey
    if (axisConfigs.xAxisKey && !columnExists(axisConfigs.xAxisKey, currentHeaders)) {
      axisConfigs.xAxisKey = undefined;
      hasChanges = true;
    }

    // Clean seriesConfigs
    if (axisConfigs.seriesConfigs && Array.isArray(axisConfigs.seriesConfigs)) {
      const cleanedSeries = axisConfigs.seriesConfigs.filter((series: any) => {
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
      const cycleConfigs = axisConfigs as any;
      if (cycleConfigs.cycleKey && !columnExists(cycleConfigs.cycleKey, currentHeaders)) {
        cycleConfigs.cycleKey = undefined;
        hasChanges = true;
      }
      if (cycleConfigs.periodKey && !columnExists(cycleConfigs.periodKey, currentHeaders)) {
        cycleConfigs.periodKey = undefined;
        hasChanges = true;
      }
      if (cycleConfigs.valueKey && !columnExists(cycleConfigs.valueKey, currentHeaders)) {
        cycleConfigs.valueKey = undefined;
        hasChanges = true;
      }
    }

    if (hasChanges && 'axisConfigs' in cleaned) {
      (cleaned as any).axisConfigs = axisConfigs;
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
