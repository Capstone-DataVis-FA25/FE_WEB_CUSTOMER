import type { DataHeader } from '@/utils/dataProcessors';
import type { GroupByColumn, AggregationMetric } from '@/types/chart';
import type { ColumnIndexMap } from './datasetOps';

const extractTimeUnit = (
  dateValue: string,
  timeUnit: 'second' | 'minute' | 'hour' | 'day' | 'month' | 'quarter' | 'year'
): string => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  switch (timeUnit) {
    case 'year':
      return `${year}`;
    case 'quarter':
      return `${year}-Q${Math.floor(month / 3) + 1}`;
    case 'month':
      return `${year}-${String(month).padStart(2, '0')}`;
    case 'day':
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    case 'hour':
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:00`;
    case 'minute':
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    case 'second':
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
    default:
      return dateValue;
  }
};

const getGroupKey = (
  row: string[],
  groupByColumns: GroupByColumn[],
  colIndex: ColumnIndexMap,
  headers: DataHeader[]
): string => {
  return groupByColumns
    .map(gb => {
      const colIdx = colIndex.get(gb.id);
      if (colIdx == null) return '';
      const value = row[colIdx] ?? '';

      // If it's a date column with time unit, extract the time unit
      const header = headers[colIdx];
      if (header && (header as any).type === 'date' && gb.timeUnit) {
        return extractTimeUnit(String(value), gb.timeUnit);
      }
      return String(value);
    })
    .join('|');
};

const parseNumber = (value: string): number => {
  if (!value || value === '') return 0;
  // Remove formatting (commas, spaces, currency symbols)
  const cleaned = value.replace(/[,\s$€£¥₹]/g, '');
  const num = Number.parseFloat(cleaned);
  return Number.isNaN(num) ? 0 : num;
};

const calculateMetric = (values: number[], metricType: AggregationMetric['type']): number => {
  if (values.length === 0) return 0;

  switch (metricType) {
    case 'sum':
      return values.reduce((a, b) => a + b, 0);
    case 'average':
      return values.reduce((a, b) => a + b, 0) / values.length;
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
    case 'count':
      return values.length;
    default:
      return 0;
  }
};

export interface AggregatedResult {
  data: string[][];
  headers: DataHeader[];
}

export const applyAggregation = (
  data: string[][] | undefined,
  headers: DataHeader[] | undefined,
  aggregation: { groupBy?: GroupByColumn[]; metrics?: AggregationMetric[] } | undefined,
  colIndex: ColumnIndexMap
): AggregatedResult | null => {
  if (!data || data.length === 0 || !headers || headers.length === 0) {
    return null;
  }

  if (!aggregation || (!aggregation.groupBy?.length && !aggregation.metrics?.length)) {
    return null; // No aggregation to apply
  }

  const groupByColumns = aggregation.groupBy || [];
  const metrics = aggregation.metrics || [];

  if (metrics.length === 0) {
    return null; // Need at least one metric
  }

  // Group data by groupBy columns
  const groups = new Map<string, string[][]>();

  for (const row of data) {
    const groupKey =
      groupByColumns.length > 0 ? getGroupKey(row, groupByColumns, colIndex, headers) : '__all__'; // Single group if no groupBy

    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(row);
  }

  // Calculate metrics for each group
  const aggregatedData: string[][] = [];
  const aggregatedHeaders: DataHeader[] = [];

  // Add groupBy columns to headers
  // Track used names to prevent duplicates (includes both groupBy and metrics)
  const usedNames = new Set<string>();
  const getUniqueName = (baseName: string): string => {
    if (!usedNames.has(baseName)) {
      usedNames.add(baseName);
      return baseName;
    }
    // If duplicate, add numeric suffix
    let counter = 1;
    let uniqueName = `${baseName}_${counter}`;
    while (usedNames.has(uniqueName)) {
      counter++;
      uniqueName = `${baseName}_${counter}`;
    }
    usedNames.add(uniqueName);
    return uniqueName;
  };

  let headerIndex = 0;
  for (const gb of groupByColumns) {
    const originalColIdx = colIndex.get(gb.id);
    if (originalColIdx != null) {
      const originalHeader = headers[originalColIdx];
      const baseName = gb.name + (gb.timeUnit ? ` (${gb.timeUnit})` : '');
      const uniqueName = getUniqueName(baseName);
      aggregatedHeaders.push({
        id: gb.id,
        name: uniqueName,
        type: originalHeader.type,
        index: headerIndex++,
      });
    }
  }

  // Add metric columns to headers

  for (const metric of metrics) {
    const baseMetricName =
      metric.alias ||
      (metric.type === 'count'
        ? 'count()'
        : metric.columnId
          ? `${metric.type}(${
              headers.find(h => ((h as any).id || (h as any).headerId) === metric.columnId)?.name ||
              metric.columnId
            })`
          : `${metric.type}()`);

    const metricName = getUniqueName(baseMetricName);

    aggregatedHeaders.push({
      id: metric.id,
      name: metricName,
      type: 'number',
      index: headerIndex++,
    });
  }

  // Process each group
  for (const [, groupRows] of groups.entries()) {
    const aggregatedRow: string[] = [];

    // Add groupBy values
    if (groupByColumns.length > 0) {
      const firstRow = groupRows[0];
      for (const gb of groupByColumns) {
        const colIdx = colIndex.get(gb.id);
        if (colIdx != null) {
          let value = firstRow[colIdx] ?? '';

          // Apply time unit extraction for date columns
          const header = headers[colIdx];
          if (header && (header as any).type === 'date' && gb.timeUnit) {
            value = extractTimeUnit(String(value), gb.timeUnit);
          }

          aggregatedRow.push(String(value));
        } else {
          aggregatedRow.push('');
        }
      }
    }

    // Calculate metrics
    // NOTE: We return raw numeric strings here. Formatting will be applied by preformatDataToFormats in DataTab
    for (const metric of metrics) {
      if (metric.type === 'count') {
        const countValue = String(groupRows.length);
        aggregatedRow.push(countValue);
      } else if (metric.columnId) {
        const metricColIdx = colIndex.get(metric.columnId);
        if (metricColIdx != null) {
          const values = groupRows
            .map(row => {
              const rawValue = row[metricColIdx] ?? '';
              // Skip empty strings, but include '0' as a valid value
              if (rawValue === '' || rawValue == null) return NaN;
              return parseNumber(rawValue);
            })
            .filter(v => !Number.isNaN(v));

          const result = values.length > 0 ? calculateMetric(values, metric.type) : 0;
          // Return raw numeric string - formatting will be applied by preformatDataToFormats
          aggregatedRow.push(String(result));
        } else {
          aggregatedRow.push('0');
        }
      } else {
        aggregatedRow.push('0');
      }
    }

    aggregatedData.push(aggregatedRow);
  }

  return {
    data: aggregatedData,
    headers: aggregatedHeaders,
  };
};
