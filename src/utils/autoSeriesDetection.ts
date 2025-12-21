import type { PivotDimension, PivotValue, SeriesConfig, MainChartConfig } from '@/types/chart';
import type { DataHeader } from '@/utils/dataProcessors';
import { filterHeadersByAxisType, isDataTypeValidForAxis } from '@/utils/chartValidation';
import colors from '@/theme/colors';

/**
 * Generate a color from palette sequentially
 */
const generateColor = (index: number): string => {
  const palette = colors.randomSeriesColor;
  return palette[index % palette.length];
};

/**
 * Get aggregation label for display
 */
const getAggregationLabel = (type: PivotValue['aggregationType']): string => {
  switch (type) {
    case 'sum':
      return 'Sum';
    case 'average':
      return 'Avg';
    case 'min':
      return 'Min';
    case 'max':
      return 'Max';
    case 'count':
      return 'Count';
    default:
      const typeStr = String(type);
      return typeStr.charAt(0).toUpperCase() + typeStr.slice(1);
  }
};

/**
 * Auto-detect series from pivot table configuration
 *
 * Logic:
 * - Requires: rows.length > 0 AND values.length > 0
 * - X-axis: first row dimension
 * - Series: all value columns
 *   - If columns exist: one series per column+value combination
 *   - If no columns: one series per value
 *
 * @param rows - Pivot row dimensions
 * @param columns - Pivot column dimensions (optional)
 * @param values - Pivot value aggregations
 * @returns Object with xAxisKey and seriesConfigs, or null if detection not possible
 */
export function detectSeriesFromPivot(
  rows: PivotDimension[],
  columns: PivotDimension[],
  values: PivotValue[]
): { xAxisKey: string; seriesConfigs: SeriesConfig[] } | null {
  // Minimum requirement: must have values AND (rows OR columns)
  if (values.length === 0) {
    return null;
  }

  // Need either rows or columns to have an X-axis
  if (rows.length === 0 && columns.length === 0) {
    return null;
  }

  // Use first row dimension as X-axis if available, otherwise use first column dimension
  const xAxisKey = rows.length > 0 ? rows[0].id : columns[0].id;
  const seriesConfigs: SeriesConfig[] = [];

  // For both cases, we use value.id as dataColumn
  // Chart matching will use valueId property on headers to match
  let seriesIndex = 0;

  for (const value of values) {
    // Series name: value name with aggregation type if multiple values
    const seriesName =
      values.length > 1
        ? `${value.name} (${getAggregationLabel(value.aggregationType)})`
        : value.name;

    // Data column: Use value.id - chart matching will use header.valueId to match
    // This works for both cases (with/without columns) since all value headers have valueId
    const dataColumn = value.id;

    seriesConfigs.push({
      id: `series-${value.id}-${Date.now()}-${seriesIndex}`,
      name: seriesName,
      color: generateColor(seriesIndex),
      visible: true,
      dataColumn,
    });

    seriesIndex++;
  }

  // Note: When columns exist, pivot creates multiple headers per value (one per column combination)
  // Each header has valueId = value.id, so we create one series per value
  // The chart rendering will need to handle multiple headers matching the same valueId
  // For now, this creates one series per value, which will match all headers with that valueId

  const result = seriesConfigs.length > 0 ? { xAxisKey, seriesConfigs } : null;
  return result;
}

/**
 * Check if chart type supports series auto-detection (line, bar, area, scatter)
 */
export function supportsSeriesAutoDetection(chartType: MainChartConfig['chartType']): boolean {
  return ['line', 'bar', 'area', 'scatter'].includes(chartType);
}

/**
 * Check if chart type supports pivot auto-configuration
 */
export function supportsPivotAutoConfig(chartType: MainChartConfig['chartType']): boolean {
  return [
    'line',
    'bar',
    'area',
    'scatter',
    'pie',
    'donut',
    'heatmap',
    'cycleplot',
    'histogram',
  ].includes(chartType);
}

/**
 * Auto-configure chart from pivot table
 *
 * This function detects and applies:
 * 1. X-axis key (from first row dimension)
 * 2. Series configs (from values, with or without columns)
 *
 * @param chartConfig - Current chart configuration
 * @param rows - Pivot row dimensions
 * @param columns - Pivot column dimensions
 * @param values - Pivot value aggregations
 * @returns Partial chart config with auto-detected settings, or null if not applicable
 */
export function autoConfigureChartFromPivot(
  chartConfig: MainChartConfig,
  rows: PivotDimension[],
  columns: PivotDimension[],
  values: PivotValue[]
): Partial<MainChartConfig> | null {
  // Check if chart type supports series
  if (!supportsSeriesAutoDetection(chartConfig.chartType)) {
    return null;
  }

  // Minimum requirement: values AND (rows OR columns)
  if (values.length === 0) {
    return null;
  }

  // Need either rows or columns to have an X-axis
  if (rows.length === 0 && columns.length === 0) {
    return null;
  }

  // Detect X-axis and series
  const detected = detectSeriesFromPivot(rows, columns, values);
  if (!detected) {
    return null;
  }

  const { xAxisKey, seriesConfigs } = detected;

  // Build updates for chart config
  const updates: Partial<MainChartConfig> = {
    axisConfigs: {
      ...((chartConfig as any).axisConfigs || {}),
      xAxisKey,
      seriesConfigs,
    } as any,
  };

  return updates;
}

// Maximum number of series to auto-select (prevents overload)
export const MAX_AUTO_SERIES = 20;

/**
 * Helper: Separate row dimensions from value columns in pivot headers
 * Row dimensions come first (no valueId), value columns come after (have valueId)
 * Column dimension headers (when no values) also don't have valueId but should be treated as series
 */
function separatePivotColumns(headers: DataHeader[]): {
  rowDimensions: DataHeader[];
  valueColumns: DataHeader[];
  columnDimensionHeaders: DataHeader[]; // Headers from column dimensions (when no values)
} {
  const rowDimensions: DataHeader[] = [];
  const valueColumns: DataHeader[] = [];
  const columnDimensionHeaders: DataHeader[] = [];

  // First pass: identify value columns (have valueId)
  const valueColumnHeaders: DataHeader[] = [];
  const nonValueHeaders: DataHeader[] = [];

  for (const header of headers) {
    if ((header as any).valueId) {
      valueColumnHeaders.push(header);
    } else {
      nonValueHeaders.push(header);
    }
  }

  // If there are value columns, the first non-value headers are row dimensions
  if (valueColumnHeaders.length > 0) {
    // Has values: first non-value headers are row dimensions
    rowDimensions.push(...nonValueHeaders);
    valueColumns.push(...valueColumnHeaders);
  } else {
    // No values: need to distinguish row dimensions from column dimension headers
    // When there are no values, headers structure is:
    // - First N headers: row dimensions (from pivot rows)
    // - Remaining headers: column dimension headers (from pivot columns)
    // But we can't tell which is which from headers alone
    // So we'll use a heuristic: if headers are type='text' and look like column values, they're column dimension headers
    // Actually, simpler: when no values, ALL headers that aren't explicitly row dimensions should be treated as series candidates
    // For now, we'll treat all non-value headers as potential series (column dimension headers)
    // The auto-selection logic will handle distinguishing rows vs columns based on pivot config if needed
    rowDimensions.push(...nonValueHeaders);
    // Note: We can't distinguish here, so we'll handle it in autoSelectLineBarAreaScatter
  }

  return { rowDimensions, valueColumns, columnDimensionHeaders };
}

/**
 * Auto-select for Line/Bar/Area/Scatter charts
 * Strategy:
 * - X-axis: First row dimension (if exists)
 * - Series: ALL value columns (if exist)
 *
 * Cases:
 * 1. Rows + Values: X-axis = first row, Series = all values
 * 2. Rows + Columns + Values: X-axis = first row, Series = all values (with parentheses)
 * 3. Only Rows (no values): X-axis = first row, Series = empty
 * 4. Only Values (no rows): X-axis = undefined, Series = all values
 * 5. Columns + Values (no rows): X-axis = undefined, Series = all values
 */
function autoSelectLineBarAreaScatter(
  chartConfig: MainChartConfig,
  processedHeaders: DataHeader[],
  pivotConfig?: any
): { config: Partial<MainChartConfig>; skippedCount: number } | null {
  const { rowDimensions, valueColumns } = separatePivotColumns(processedHeaders);

  // Special handling for scatter charts: need numeric X and Y axes
  const isScatter = chartConfig.chartType === 'scatter';

  // Determine X-axis: First row dimension (if exists)
  // But when there are no values, rowDimensions might actually be column dimension headers
  let xAxisKey: string | undefined;
  let seriesCandidates: DataHeader[] = [];

  if (valueColumns.length > 0) {
    // Has values: rowDimensions are actual row dimensions, valueColumns are series
    if (rowDimensions.length > 0) {
      const xAxisHeader = rowDimensions[0];
      // Validate X-axis type for scatter charts (must be number)
      if (isScatter && !isDataTypeValidForAxis(chartConfig.chartType, 'x', xAxisHeader.type)) {
        // For scatter: find first numeric column from all headers
        const numericHeader = processedHeaders.find(
          h => h.type === 'number' && isDataTypeValidForAxis(chartConfig.chartType, 'x', h.type)
        );
        if (numericHeader) {
          xAxisKey = (numericHeader as any).id || numericHeader.name;
        } else {
          xAxisKey = undefined;
        }
      } else {
        xAxisKey = (xAxisHeader as any).id || xAxisHeader.name;
      }
    } else if (isScatter) {
      // No row dimensions but scatter chart: find first numeric column
      const numericHeader = processedHeaders.find(
        h => h.type === 'number' && isDataTypeValidForAxis(chartConfig.chartType, 'x', h.type)
      );
      if (numericHeader) {
        xAxisKey = (numericHeader as any).id || numericHeader.name;
      }
    }
    seriesCandidates = valueColumns;
  } else {
    // No values: need to distinguish row dimensions from column dimension headers
    // When no values exist, headers structure is:
    // - First N headers: row dimensions (if pivot has rows)
    // - Remaining headers: column dimension headers (if pivot has columns)
    // Since we can't tell from headers alone, we use a simple heuristic:
    // If all headers are type='text', they're likely all column dimension headers (no rows)
    // Otherwise, first header is likely a row dimension, rest are column dimension headers

    // Use pivot config to know how many row dimensions exist
    const pivotRowsCount = pivotConfig?.rows?.length ?? 0;
    const pivotColumnsCount = pivotConfig?.columns?.length ?? 0;

    if (pivotRowsCount > 0) {
      // Has row dimensions: first N headers are row dimensions, rest are column dimension headers
      const actualRowDimensions = rowDimensions.slice(0, pivotRowsCount);
      const columnDimensionHeaders = rowDimensions.slice(pivotRowsCount);

      // First row dimension is X-axis (validate for scatter charts)
      if (actualRowDimensions.length > 0) {
        const xAxisHeader = actualRowDimensions[0];
        // Validate X-axis type for scatter charts (must be number)
        if (isScatter && !isDataTypeValidForAxis(chartConfig.chartType, 'x', xAxisHeader.type)) {
          // For scatter: find first numeric column from all headers
          const numericHeader = processedHeaders.find(
            h => h.type === 'number' && isDataTypeValidForAxis(chartConfig.chartType, 'x', h.type)
          );
          if (numericHeader) {
            xAxisKey = (numericHeader as any).id || numericHeader.name;
          } else {
            xAxisKey = undefined;
          }
        } else {
          xAxisKey = (xAxisHeader as any).id || xAxisHeader.name;
        }
      } else if (isScatter) {
        // No row dimensions but scatter chart: find first numeric column
        const numericHeader = processedHeaders.find(
          h => h.type === 'number' && isDataTypeValidForAxis(chartConfig.chartType, 'x', h.type)
        );
        if (numericHeader) {
          xAxisKey = (numericHeader as any).id || numericHeader.name;
        }
      }

      // Column dimension headers are series candidates
      seriesCandidates = columnDimensionHeaders;
    } else if (pivotColumnsCount > 0) {
      // No rows, only columns: all headers are column dimension headers (series)
      seriesCandidates = rowDimensions;
    } else {
      // No rows, no columns: nothing to select
      seriesCandidates = [];
    }
  }

  // Filter series candidates by chart type
  // For scatter charts: Y-axis must also be numeric, so filter accordingly
  let validSeriesCandidates: DataHeader[] = [];

  if (isScatter) {
    // For scatter: Y-axis must be numeric, and exclude the column used for X-axis
    const xAxisId = xAxisKey;
    validSeriesCandidates = seriesCandidates.filter(header => {
      // Exclude the X-axis column
      const headerId = (header as any).id || header.name;
      if (headerId === xAxisId) {
        return false;
      }
      // Must be numeric
      return (
        header.type === 'number' && isDataTypeValidForAxis(chartConfig.chartType, 'y', header.type)
      );
    });

    // If no valid series candidates from the original list, search all headers for next numeric column
    if (validSeriesCandidates.length === 0 && xAxisKey) {
      const xAxisId = xAxisKey;
      const allNumericHeaders = processedHeaders.filter(
        h =>
          h.type === 'number' &&
          isDataTypeValidForAxis(chartConfig.chartType, 'y', h.type) &&
          ((h as any).id || h.name) !== xAxisId
      );
      if (allNumericHeaders.length > 0) {
        // Use the first numeric column that's not the X-axis
        validSeriesCandidates = [allNumericHeaders[0]];
      }
    }
  } else {
    // For other charts: use normal filtering
    validSeriesCandidates = seriesCandidates.filter(header => {
      // If it's a value column, use normal filtering
      if ((header as any).valueId) {
        return filterHeadersByAxisType([header], chartConfig.chartType, 'y').length > 0;
      }
      // For column dimension headers (type='text'), allow them (they represent categories)
      // The chart rendering will handle them appropriately
      return true;
    });
  }

  const limitedSeriesCandidates = validSeriesCandidates.slice(0, MAX_AUTO_SERIES);
  const skippedCount = validSeriesCandidates.length - limitedSeriesCandidates.length;

  // If no X-axis AND no series candidates, return null (nothing to select)
  if (!xAxisKey && seriesCandidates.length === 0) {
    return null;
  }

  // Get existing series to preserve custom names (Option 3: only if header name hasn't changed)
  const existingSeries = ((chartConfig as any).axisConfigs?.seriesConfigs || []) as SeriesConfig[];
  const existingSeriesMap = new Map(existingSeries.map((s: any) => [s.dataColumn, s]));

  // Create series configs from series candidates
  const seriesConfigs: SeriesConfig[] = limitedSeriesCandidates.map((header, index) => {
    const headerId = (header as any).id || header.name;
    const existingSeriesConfig = existingSeriesMap.get(headerId);

    // Option 3: Preserve custom name only if header name hasn't changed
    // Logic: If existing series name is different from current header name, it was customized.
    // We preserve it (assuming header name hasn't changed). If header name changed,
    // the existing name won't match the new header name, so we use the new header name.
    let seriesName = header.name;
    if (existingSeriesConfig) {
      const existingName = existingSeriesConfig.name;
      // If existing name is different from current header name, it was customized
      // Preserve it (this works because if header name changed, existing name won't match anyway)
      if (existingName !== header.name) {
        seriesName = existingName; // Preserve custom name
      }
      // If existing name matches header name, use header name (no customization or header changed)
    }

    // Preserve existing color if available, otherwise generate new one
    const existingColor = existingSeriesConfig?.color;
    const color = existingColor || generateColor(index);

    return {
      id: existingSeriesConfig?.id || `series-${headerId}-${Date.now()}-${index}`,
      name: seriesName,
      color,
      visible: existingSeriesConfig?.visible !== false,
      dataColumn: headerId,
    };
  });

  return {
    config: {
      axisConfigs: {
        ...((chartConfig as any).axisConfigs || {}),
        xAxisKey,
        seriesConfigs,
      } as any,
    },
    skippedCount,
  };
}

/**
 * Auto-select for Pie/Donut charts
 * Strategy: First row dimension = labelKey, first value column = valueKey
 */
function autoSelectPieDonut(
  chartConfig: MainChartConfig,
  processedHeaders: DataHeader[]
): { config: Partial<MainChartConfig>; skippedCount: number } | null {
  const { rowDimensions, valueColumns } = separatePivotColumns(processedHeaders);

  // Need at least 1 row dimension and 1 value column
  if (rowDimensions.length === 0) {
    return null;
  }

  if (valueColumns.length === 0) {
    return null;
  }

  const labelHeader = rowDimensions[0];
  const valueHeader = valueColumns[0];

  // Value must be number type
  if (valueHeader.type !== 'number') {
    return null;
  }

  const labelKey = (labelHeader as any).id || labelHeader.name;
  const valueKey = (valueHeader as any).id || valueHeader.name;

  return {
    config: {
      config: {
        ...((chartConfig as any).config || {}),
        labelKey,
        valueKey,
      },
    } as any,
    skippedCount: 0,
  };
}

/**
 * Auto-select for Heatmap charts
 * Strategy: First row dimension = xAxisKey, second row dimension (or first if only one) = yAxisKey, first value column = valueKey
 */
function autoSelectHeatmap(
  chartConfig: MainChartConfig,
  processedHeaders: DataHeader[]
): { config: Partial<MainChartConfig>; skippedCount: number } | null {
  const { rowDimensions, valueColumns } = separatePivotColumns(processedHeaders);

  // Need at least 1 row dimension and 1 value column
  if (rowDimensions.length === 0) {
    return null;
  }

  if (valueColumns.length === 0) {
    return null;
  }

  const xHeader = rowDimensions[0];
  // Use second row dimension if available, otherwise use first (fallback)
  const yHeader = rowDimensions.length > 1 ? rowDimensions[1] : rowDimensions[0];
  const valueHeader = valueColumns[0];

  // Value must be number type
  if (valueHeader.type !== 'number') {
    return null;
  }

  const xAxisKey = (xHeader as any).id || xHeader.name;
  const yAxisKey = (yHeader as any).id || yHeader.name;
  const valueKey = (valueHeader as any).id || valueHeader.name;

  return {
    config: {
      axisConfigs: {
        ...((chartConfig as any).axisConfigs || {}),
        xAxisKey,
        yAxisKey,
        valueKey,
      } as any,
    },
    skippedCount: 0,
  };
}

/**
 * Auto-select for CyclePlot charts
 * Strategy: First row dimension = cycleKey, second row dimension (or first if only one) = periodKey, first value column = valueKey
 */
function autoSelectCyclePlot(
  chartConfig: MainChartConfig,
  processedHeaders: DataHeader[]
): { config: Partial<MainChartConfig>; skippedCount: number } | null {
  const { rowDimensions, valueColumns } = separatePivotColumns(processedHeaders);

  // Need at least 1 row dimension and 1 value column
  if (rowDimensions.length === 0) {
    return null;
  }

  if (valueColumns.length === 0) {
    return null;
  }

  const cycleHeader = rowDimensions[0];
  // Use second row dimension if available, otherwise use first (fallback)
  const periodHeader = rowDimensions.length > 1 ? rowDimensions[1] : rowDimensions[0];
  const valueHeader = valueColumns[0];

  // Value must be number type
  if (valueHeader.type !== 'number') {
    return null;
  }

  const cycleKey = (cycleHeader as any).id || cycleHeader.name;
  const periodKey = (periodHeader as any).id || periodHeader.name;
  const valueKey = (valueHeader as any).id || valueHeader.name;

  return {
    config: {
      axisConfigs: {
        ...((chartConfig as any).axisConfigs || {}),
        cycleKey,
        periodKey,
        valueKey,
      } as any,
    },
    skippedCount: 0,
  };
}

/**
 * Auto-select for Histogram charts
 * Strategy (in priority order):
 * 1. Value columns (from pivot aggregations) - BEST: These are aggregated measurements
 * 2. Column dimension headers that are numeric (when no values) - GOOD: These represent categories with counts
 * 3. All number columns excluding row dimensions - OK: Raw numeric data, but exclude categorical row dimensions
 * 4. All number columns (fallback) - LAST RESORT: Use everything numeric
 *
 * Histogram uses seriesConfigs (not xAxisKey)
 */
function autoSelectHistogram(
  chartConfig: MainChartConfig,
  processedHeaders: DataHeader[],
  pivotConfig?: any
): { config: Partial<MainChartConfig>; skippedCount: number } | null {
  const { rowDimensions, valueColumns } = separatePivotColumns(processedHeaders);

  // Collect number columns with smart prioritization
  let numberColumns: DataHeader[] = [];

  // Strategy 1: Prefer value columns (from pivot aggregations) - BEST
  // These are aggregated measurements like "Sum of score", "Average of price", etc.
  if (valueColumns.length > 0) {
    const numberValueColumns = valueColumns.filter(h => h.type === 'number');
    if (numberValueColumns.length > 0) {
      numberColumns = numberValueColumns;
    }
  }

  // Strategy 2: If no value columns, use column dimension headers that are numeric
  // When pivot has columns but no values, these represent counts/values per category
  if (numberColumns.length === 0) {
    const pivotColumnsCount = pivotConfig?.columns?.length ?? 0;
    if (pivotColumnsCount > 0) {
      // Column dimension headers come after row dimensions
      const pivotRowsCount = pivotConfig?.rows?.length ?? 0;
      const columnDimensionHeaders = processedHeaders.slice(pivotRowsCount);
      const numericColumnHeaders = columnDimensionHeaders.filter(h => h.type === 'number');
      if (numericColumnHeaders.length > 0) {
        numberColumns = numericColumnHeaders;
      }
    }
  }

  // Strategy 3: Exclude row dimensions (even if numeric) - they're usually categorical
  // Use all number columns BUT exclude row dimensions
  if (numberColumns.length === 0) {
    const rowDimensionIds = new Set(rowDimensions.map(h => (h as any).id || h.name));
    const allNumberColumns = processedHeaders.filter(
      h => h.type === 'number' && !rowDimensionIds.has((h as any).id || h.name)
    );
    if (allNumberColumns.length > 0) {
      numberColumns = allNumberColumns;
    }
  }

  // Strategy 4: Fallback - use ALL number columns (last resort)
  if (numberColumns.length === 0) {
    numberColumns = processedHeaders.filter(h => h.type === 'number');
    if (numberColumns.length > 0) {
    }
  }

  // No valid number columns found
  if (numberColumns.length === 0) {
    return null;
  }

  // Limit to MAX_AUTO_SERIES
  const limitedColumns = numberColumns.slice(0, MAX_AUTO_SERIES);
  const skippedCount = numberColumns.length - limitedColumns.length;

  // Get existing series to preserve custom names and colors
  const existingSeries = ((chartConfig as any).axisConfigs?.seriesConfigs || []) as SeriesConfig[];
  const existingSeriesMap = new Map(existingSeries.map((s: any) => [s.dataColumn, s]));

  // Create series configs from all number columns
  const seriesConfigs: SeriesConfig[] = limitedColumns.map((header, index) => {
    const headerId = (header as any).id || header.name;
    const existingSeriesConfig = existingSeriesMap.get(headerId);

    // Preserve custom name only if header name hasn't changed
    let seriesName = header.name;
    if (existingSeriesConfig) {
      const existingName = existingSeriesConfig.name;
      if (existingName !== header.name) {
        seriesName = existingName;
      }
    }

    // Preserve existing color if available, otherwise generate new one
    const existingColor = existingSeriesConfig?.color;
    const color = existingColor || generateColor(index);

    return {
      id: existingSeriesConfig?.id || `series-${headerId}-${Date.now()}-${index}`,
      name: seriesName,
      color,
      visible: existingSeriesConfig?.visible ?? true,
      dataColumn: headerId,
    };
  });

  return {
    config: {
      axisConfigs: {
        ...((chartConfig as any).axisConfigs || {}),
        seriesConfigs,
      } as any,
    },
    skippedCount,
  };
}

/**
 * Auto-configure chart from processed headers (after pivot transformation)
 *
 * Uses chart-specific selection strategies:
 * - Line/Bar/Area/Scatter: First row dimension = X-axis, value columns = Series
 * - Pie/Donut: First row dimension = labelKey, first value column = valueKey
 * - Heatmap: First row dimension = xAxisKey, second row = yAxisKey, first value = valueKey
 * - CyclePlot: First row dimension = cycleKey, second row = periodKey, first value = valueKey
 * - Histogram: First value column = xAxisKey
 *
 * @param chartConfig - Current chart configuration
 * @param processedHeaders - Headers after pivot transformation
 * @returns Object with config and skippedCount, or null if not applicable
 */
export function autoConfigureFromProcessedHeaders(
  chartConfig: MainChartConfig,
  processedHeaders: DataHeader[] | undefined,
  pivotConfig?: any // Optional pivot config to help distinguish row dimensions from column dimension headers
): { config: Partial<MainChartConfig>; skippedCount: number } | null {
  // Check if chart type supports pivot auto-configuration
  if (!supportsPivotAutoConfig(chartConfig.chartType)) {
    return null;
  }

  // Need at least 1 header
  if (!processedHeaders || processedHeaders.length === 0) {
    return null;
  }

  const chartType = chartConfig.chartType;

  // Route to chart-specific selection function
  if (chartType === 'pie' || chartType === 'donut') {
    return autoSelectPieDonut(chartConfig, processedHeaders);
  }

  if (chartType === 'heatmap') {
    return autoSelectHeatmap(chartConfig, processedHeaders);
  }

  if (chartType === 'cycleplot') {
    return autoSelectCyclePlot(chartConfig, processedHeaders);
  }

  if (chartType === 'histogram') {
    return autoSelectHistogram(chartConfig, processedHeaders, pivotConfig);
  }

  if (supportsSeriesAutoDetection(chartType)) {
    return autoSelectLineBarAreaScatter(chartConfig, processedHeaders, pivotConfig);
  }

  // Fallback: chart type not handled
  return null;
}
