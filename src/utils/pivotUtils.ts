import type { DataHeader } from '@/utils/dataProcessors';
import type { PivotDimension, PivotValue } from '@/types/chart';
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

const parseNumber = (value: string): number => {
  if (!value || value === '') return 0;
  // Remove formatting (commas, spaces, currency symbols)
  const cleaned = value.replace(/[,\s$€£¥₹]/g, '');
  const num = Number.parseFloat(cleaned);
  return Number.isNaN(num) ? 0 : num;
};

const calculateMetric = (values: number[], metricType: PivotValue['aggregationType']): number => {
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

const getDimensionValue = (
  row: string[],
  dimension: PivotDimension,
  colIndex: ColumnIndexMap,
  headers: DataHeader[]
): string => {
  const colIdx = colIndex.get(dimension.columnId);
  if (colIdx == null) return '';
  const value = row[colIdx] ?? '';

  // If it's a date column with time unit, extract the time unit
  const header = headers[colIdx];
  if (header && (header as any).type === 'date' && dimension.timeUnit) {
    return extractTimeUnit(String(value), dimension.timeUnit);
  }
  return String(value);
};

export interface PivotedResult {
  data: string[][];
  headers: DataHeader[];
}

export const applyPivot = (
  data: string[][] | undefined,
  headers: DataHeader[] | undefined,
  pivot:
    | {
        rows?: PivotDimension[];
        columns?: PivotDimension[];
        values?: PivotValue[];
        filters?: PivotDimension[];
      }
    | undefined,
  colIndex: ColumnIndexMap
): PivotedResult | null => {
  if (!data || data.length === 0 || !headers || headers.length === 0) {
    return null;
  }

  if (!pivot || (!pivot.rows?.length && !pivot.columns?.length && !pivot.values?.length)) {
    return null; // No pivot to apply
  }

  const rows = pivot.rows || [];
  const columns = pivot.columns || [];
  const values = pivot.values || [];
  const filters = pivot.filters || [];

  // Allow rows/columns without values (just show unique values, like Excel)
  if (rows.length === 0 && columns.length === 0 && values.length === 0) {
    return null; // Need at least rows, columns, or values
  }

  // Step 1: Apply filters (if any)
  let filteredData = data;
  if (filters.length > 0) {
    // For now, we'll skip filter application in pivot (can be added later)
    // This would require implementing filter logic similar to applyDatasetFilters
    filteredData = data;
  }

  // Step 2: Build row keys and column keys
  // Row key: combination of all row dimension values
  // Column key: combination of all column dimension values + value ID (if values exist)
  // Map to store aggregated values: rowKey -> colKey -> number[]
  const pivotMap = new Map<string, Map<string, number[]>>();

  // Collect all unique row keys and column keys
  const rowKeysSet = new Set<string>();
  const colKeysSet = new Set<string>();

  for (const row of filteredData) {
    // Build row key
    const rowKey =
      rows.length > 0
        ? rows.map(dim => getDimensionValue(row, dim, colIndex, headers)).join('|')
        : '__all__';

    if (values.length > 0) {
      // Build column keys for each value
      for (const value of values) {
        // Column key format: [colDim1|colDim2|...]|valueId
        // If no columns, just use valueId
        const colDimValues =
          columns.length > 0
            ? columns.map(dim => getDimensionValue(row, dim, colIndex, headers)).join('|')
            : '';
        const colKey = colDimValues ? `${colDimValues}|${value.id}` : value.id;

        rowKeysSet.add(rowKey);
        colKeysSet.add(colKey);

        // Get the value to aggregate
        let valueToAggregate: number;
        if (value.aggregationType === 'count') {
          valueToAggregate = 1; // Count each row
        } else {
          const valueColIdx = colIndex.get(value.columnId);
          if (valueColIdx != null) {
            const rawValue = row[valueColIdx] ?? '';
            if (rawValue === '' || rawValue == null) {
              continue; // Skip empty values
            }
            valueToAggregate = parseNumber(rawValue);
            if (Number.isNaN(valueToAggregate)) {
              continue; // Skip non-numeric values
            }
          } else {
            continue; // Skip if column not found
          }
        }

        // Store in pivot map
        if (!pivotMap.has(rowKey)) {
          pivotMap.set(rowKey, new Map());
        }
        const rowMap = pivotMap.get(rowKey)!;
        if (!rowMap.has(colKey)) {
          rowMap.set(colKey, []);
        }
        rowMap.get(colKey)!.push(valueToAggregate);
      }
    } else {
      // No values: just track unique row/column combinations (like Excel)
      // Only create column keys if there are column dimensions
      if (columns.length > 0) {
        const colDimValues = columns
          .map(dim => getDimensionValue(row, dim, colIndex, headers))
          .join('|');
        const colKey = colDimValues;

        rowKeysSet.add(rowKey);
        colKeysSet.add(colKey);

        // Just mark that this combination exists (use 0 as default value)
        if (!pivotMap.has(rowKey)) {
          pivotMap.set(rowKey, new Map());
        }
        const rowMap = pivotMap.get(rowKey)!;
        if (!rowMap.has(colKey)) {
          rowMap.set(colKey, [0]); // Use 0 as default value when no values are specified
        }
      } else {
        // No columns and no values: just track unique rows
        rowKeysSet.add(rowKey);
        // Don't add any column keys - we'll just show row dimension columns
      }
    }
  }

  // Step 3: Build headers
  const pivotedHeaders: DataHeader[] = [];
  let headerIndex = 0;

  // Add row dimension headers first
  for (const rowDim of rows) {
    const originalColIdx = colIndex.get(rowDim.columnId);
    if (originalColIdx != null) {
      const originalHeader = headers[originalColIdx];
      pivotedHeaders.push({
        id: rowDim.id,
        name: rowDim.name,
        type: originalHeader.type,
        dateFormat: (originalHeader as any).dateFormat,
        index: headerIndex++,
      } as any);
    }
  }

  // Add column headers (combination of column dimensions + value names, or just column dimensions if no values)
  // Only add column headers if there are columns or values
  if (columns.length > 0 || values.length > 0) {
    // Sort column keys for consistent ordering
    const sortedColKeys = Array.from(colKeysSet).sort();

    for (const colKey of sortedColKeys) {
      if (values.length > 0) {
        // Extract value ID from colKey (last part after |)
        const parts = colKey.split('|');
        const valueId = parts[parts.length - 1];
        const value = values.find(v => v.id === valueId);
        if (!value) continue;

        // Build column name - always use "Operation of columnName (columnDimension)" format
        let colName: string;

        // Get operation label
        const operationLabel =
          value.aggregationType === 'count'
            ? 'Count'
            : value.aggregationType.charAt(0).toUpperCase() + value.aggregationType.slice(1);

        // Get original column name
        const columnHeader = headers.find(
          h => ((h as any).id || (h as any).headerId) === value.columnId
        );
        const columnName = columnHeader?.name || value.name;

        if (columns.length > 0) {
          // Has column dimensions: "Operation of columnName (col1 | col2)"
          const colDimParts = parts.slice(0, -1);
          const columnValues = colDimParts.join(' | ');
          colName = value.alias?.trim() || `${operationLabel} of ${columnName} (${columnValues})`;
        } else {
          // No column dimensions: "Operation of columnName"
          colName = value.alias?.trim() || `${operationLabel} of ${columnName}`;
        }

        // Generate simple sequential ID for header (just an identifier)
        // Store valueId separately for matching series
        const headerId = `col-${headerIndex}`;
        pivotedHeaders.push({
          id: headerId,
          name: colName,
          type: 'number',
          index: headerIndex++,
          // Store valueId for series matching (using type assertion since DataHeader doesn't have this property)
          ...({ valueId: value.id } as any),
        });
      } else {
        // No values: just show column dimension values
        // These columns contain numeric default values (0), so they should be type 'number'
        if (columns.length > 0) {
          const parts = colKey.split('|');
          const colName = parts.join(' | '); // Just join the values, no dimension names

          // Generate simple sequential ID for header (just an identifier)
          // No valueId needed for this case (no values, just column dimensions)
          const headerId = `col-${headerIndex}`;
          pivotedHeaders.push({
            id: headerId,
            name: colName,
            type: 'number', // Changed from 'text' to 'number' since default value is 0
            index: headerIndex++,
          });
        }
        // If no columns and no values, don't add any column headers
      }
    }
  }

  // Step 4: Build pivoted data
  const pivotedData: string[][] = [];
  const sortedRowKeys = Array.from(rowKeysSet).sort();

  for (const rowKey of sortedRowKeys) {
    const pivotedRow: string[] = [];

    // Add row dimension values
    if (rows.length > 0) {
      const rowParts = rowKey.split('|');
      for (let i = 0; i < rows.length; i++) {
        pivotedRow.push(rowParts[i] || '');
      }
    }

    // Add cell values for each column (only if there are columns or values)
    if (columns.length > 0 || values.length > 0) {
      const sortedColKeys = Array.from(colKeysSet).sort();
      const rowMap = pivotMap.get(rowKey);
      for (const colKey of sortedColKeys) {
        const valueArray = rowMap?.get(colKey);

        if (values.length > 0) {
          // Has values: calculate aggregation
          if (valueArray && valueArray.length > 0) {
            // Extract value ID to get the aggregation type
            const parts = colKey.split('|');
            const valueId = parts[parts.length - 1];
            const value = values.find(v => v.id === valueId);
            if (value) {
              const result = calculateMetric(valueArray, value.aggregationType);
              pivotedRow.push(String(result));
            } else {
              pivotedRow.push('0');
            }
          } else {
            pivotedRow.push('0');
          }
        } else {
          // No values: just mark if combination exists (show "0" or empty)
          if (valueArray && valueArray.length > 0) {
            pivotedRow.push('0'); // Default value when no values are specified
          } else {
            pivotedRow.push('');
          }
        }
      }
    }
    // If no columns and no values, just show the row dimension values (no additional columns)

    pivotedData.push(pivotedRow);
  }

  return {
    data: pivotedData,
    headers: pivotedHeaders,
  };
};
