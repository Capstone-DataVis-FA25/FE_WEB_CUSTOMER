/**
 * Chart Validation Utilities
 * Defines rules for which data types are valid for each axis of different chart types
 */

import { ChartType } from '@/features/charts/chartTypes';

// Data type from dataset headers
export type DataType = 'string' | 'number' | 'date' | 'text';

// Axis type
export type AxisType = 'x' | 'y';

/**
 * Chart type validation rules
 * Defines which data types are acceptable for X and Y axes for each chart type
 */
export const CHART_VALIDATION_RULES: Record<
  ChartType,
  {
    xAxis: {
      allowedTypes: DataType[];
      description: string;
    };
    yAxis: {
      allowedTypes: DataType[];
      description: string;
    };
  }
> = {
  [ChartType.Line]: {
    xAxis: {
      allowedTypes: ['text', 'date', 'string'],
      description: 'X-axis should be time series or categorical data (text/date)',
    },
    yAxis: {
      allowedTypes: ['number'],
      description: 'Y-axis must be numeric values',
    },
  },
  [ChartType.Bar]: {
    xAxis: {
      allowedTypes: ['text', 'string'],
      description: 'X-axis should be categorical data (text)',
    },
    yAxis: {
      allowedTypes: ['number'],
      description: 'Y-axis must be numeric values',
    },
  },
  [ChartType.Area]: {
    xAxis: {
      allowedTypes: ['text', 'date', 'string'],
      description: 'X-axis should be time series or categorical data (text/date)',
    },
    yAxis: {
      allowedTypes: ['number'],
      description: 'Y-axis must be numeric values',
    },
  },
};

/**
 * Check if a data type is valid for a specific axis in a chart type
 * @param chartType The type of chart (accepts both enum and string)
 * @param axisType Which axis (x or y)
 * @param dataType The data type to check
 * @returns true if valid, false otherwise
 */
export const isDataTypeValidForAxis = (
  chartType: ChartType | string,
  axisType: AxisType,
  dataType: string
): boolean => {
  // Convert string to enum if needed
  const chartTypeKey = getChartTypeKey(chartType);
  const rules = CHART_VALIDATION_RULES[chartTypeKey];
  if (!rules) return true; // If no rules defined, allow all

  const axisRules = axisType === 'x' ? rules.xAxis : rules.yAxis;

  // Normalize data type (handle variations)
  const normalizedType = normalizeDataType(dataType);

  return axisRules.allowedTypes.includes(normalizedType as DataType);
};

/**
 * Convert chart type string to enum key
 */
const getChartTypeKey = (chartType: ChartType | string): ChartType => {
  if (typeof chartType === 'object') return chartType; // Already enum

  // Map string values to enum
  switch (chartType.toLowerCase()) {
    case 'line':
      return ChartType.Line;
    case 'bar':
      return ChartType.Bar;
    case 'area':
      return ChartType.Area;
    default:
      return ChartType.Line; // Default fallback
  }
};

/**
 * Normalize data type strings to standard types
 * Handles common variations in type naming
 */
const normalizeDataType = (dataType: string): string => {
  const normalized = dataType.toLowerCase().trim();

  // Map common variations to standard types
  const typeMap: Record<string, string> = {
    str: 'string',
    varchar: 'string',
    char: 'string',
    int: 'number',
    integer: 'number',
    float: 'number',
    double: 'number',
    decimal: 'number',
    numeric: 'number',
    datetime: 'date',
    timestamp: 'date',
    time: 'date',
  };

  return typeMap[normalized] || normalized;
};

/**
 * Get description for axis requirements
 * @param chartType The type of chart (accepts both enum and string)
 * @param axisType Which axis (x or y)
 * @returns Description string
 */
export const getAxisRequirementDescription = (
  chartType: ChartType | string,
  axisType: AxisType
): string => {
  const chartTypeKey = getChartTypeKey(chartType);
  const rules = CHART_VALIDATION_RULES[chartTypeKey];
  if (!rules) return '';

  return axisType === 'x' ? rules.xAxis.description : rules.yAxis.description;
};

/**
 * Get allowed data types for an axis
 * @param chartType The type of chart (accepts both enum and string)
 * @param axisType Which axis (x or y)
 * @returns Array of allowed data types
 */
export const getAllowedDataTypes = (
  chartType: ChartType | string,
  axisType: AxisType
): DataType[] => {
  const chartTypeKey = getChartTypeKey(chartType);
  const rules = CHART_VALIDATION_RULES[chartTypeKey];
  if (!rules) return ['string', 'number', 'date', 'text']; // Allow all by default

  return axisType === 'x' ? rules.xAxis.allowedTypes : rules.yAxis.allowedTypes;
};

/**
 * Filter headers based on allowed data types for an axis
 * @param headers Array of dataset headers
 * @param chartType The type of chart (accepts both enum and string)
 * @param axisType Which axis (x or y)
 * @returns Filtered array of headers
 */
export const filterHeadersByAxisType = <T extends { type: string }>(
  headers: T[],
  chartType: ChartType | string,
  axisType: AxisType
): T[] => {
  return headers.filter(header => isDataTypeValidForAxis(chartType, axisType, header.type));
};

/**
 * Validate if a header can be used for a specific axis
 * @param header Dataset header with type information
 * @param chartType The type of chart (accepts both enum and string)
 * @param axisType Which axis (x or y)
 * @returns Validation result with message
 */
export const validateHeaderForAxis = (
  header: { name: string; type: string },
  chartType: ChartType | string,
  axisType: AxisType
): { isValid: boolean; message?: string } => {
  const isValid = isDataTypeValidForAxis(chartType, axisType, header.type);

  if (!isValid) {
    const allowedTypes = getAllowedDataTypes(chartType, axisType);
    return {
      isValid: false,
      message: `"${header.name}" (${header.type}) is not valid for ${axisType}-axis. Expected: ${allowedTypes.join(' or ')}`,
    };
  }

  return { isValid: true };
};
