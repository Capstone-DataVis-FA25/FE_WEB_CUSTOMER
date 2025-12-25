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
  console.log('[DEBUG][CleanupFunction] cleanupChartConfig called');
  console.log('[DEBUG][CleanupFunction] config exists:', !!config);
  console.log('[DEBUG][CleanupFunction] currentHeaders count:', currentHeaders?.length);

  if (!config || !currentHeaders || currentHeaders.length === 0) {
    console.log('[DEBUG][CleanupFunction] Early return - missing config or headers');
    return config ?? null;
  }

  const cleaned = { ...config };
  let hasChanges = false;

  console.log(
    '[DEBUG][CleanupFunction] Available header IDs:',
    currentHeaders.map(h => (h as any).id || h.name)
  );

  // Clean up axis configs (for line, bar, area, scatter, cycleplot)
  // Type guard to check if config has axisConfigs property
  if ('axisConfigs' in cleaned && cleaned.axisConfigs) {
    const axisConfigs = { ...cleaned.axisConfigs };

    // Clean xAxisKey
    if (axisConfigs.xAxisKey) {
      const exists = columnExists(axisConfigs.xAxisKey, currentHeaders);
      console.log('[DEBUG][CleanupFunction] xAxisKey:', axisConfigs.xAxisKey, 'exists:', exists);
      if (!exists) {
        console.log('[DEBUG][CleanupFunction] REMOVING xAxisKey:', axisConfigs.xAxisKey);
        axisConfigs.xAxisKey = undefined;
        hasChanges = true;
      }
    }

    // Clean seriesConfigs
    if (axisConfigs.seriesConfigs && Array.isArray(axisConfigs.seriesConfigs)) {
      console.log('[DEBUG][CleanupFunction] Checking', axisConfigs.seriesConfigs.length, 'series');
      const cleanedSeries = axisConfigs.seriesConfigs.filter((series: any) => {
        const exists = columnExists(series.dataColumn, currentHeaders);
        console.log(
          '[DEBUG][CleanupFunction] Series:',
          series.name,
          'dataColumn:',
          series.dataColumn,
          'exists:',
          exists
        );
        if (!exists) {
          console.log('[DEBUG][CleanupFunction] REMOVING series:', series.name);
          hasChanges = true;
        }
        return exists;
      });
      if (cleanedSeries.length !== axisConfigs.seriesConfigs.length) {
        console.log(
          '[DEBUG][CleanupFunction] Series count changed:',
          axisConfigs.seriesConfigs.length,
          '->',
          cleanedSeries.length
        );
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

  console.log('[DEBUG][CleanupFunction] hasChanges:', hasChanges);
  return hasChanges ? cleaned : config;
};
