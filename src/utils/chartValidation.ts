/**
 * Chart Validation Utilities
 * Defines rules for which data types are valid for each axis of different chart types
 */

import { ChartType } from '@/features/charts/chartTypes';

// Data type from dataset headers (standardized)
export type DataType = 'text' | 'number' | 'date';

// Axis type
export type AxisType = 'x' | 'y';

// Role type for non-Cartesian charts (e.g., Pie, Donut)
export type RoleType = 'label' | 'value';

/**
 * Chart type validation rules
 * Defines which data types are acceptable for X and Y axes for each chart type
 */
export const CHART_VALIDATION_RULES: Partial<
  Record<
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
  >
> = {
  [ChartType.Line]: {
    xAxis: {
      allowedTypes: ['text', 'date', 'number'],
      description: 'X-axis can be time series, categorical, or numeric (text/date/number)',
    },
    yAxis: {
      allowedTypes: ['number'],
      description: 'Y-axis must be numeric values',
    },
  },
  [ChartType.Bar]: {
    xAxis: {
      allowedTypes: ['text', 'date', 'number'],
      description: 'X-axis should be categorical data (text)',
    },
    yAxis: {
      allowedTypes: ['number', 'date'],
      description: 'Y-axis must be numeric values',
    },
  },
  [ChartType.Area]: {
    xAxis: {
      allowedTypes: ['text', 'date'],
      description: 'X-axis should be time series or categorical data (text/date)',
    },
    yAxis: {
      allowedTypes: ['number'],
      description: 'Y-axis must be numeric values',
    },
  },
  [ChartType.Scatter]: {
    xAxis: {
      allowedTypes: ['number'],
      description: 'X-axis must be numeric (continuous) for scatter charts',
    },
    yAxis: {
      allowedTypes: ['number'],
      description: 'Y-axis must be numeric values',
    },
  },
  [ChartType.CyclePlot]: {
    xAxis: {
      allowedTypes: ['text', 'number', 'date'],
      description: 'Period axis (e.g., Month, Quarter, Week) can be text, number, or date',
    },
    yAxis: {
      allowedTypes: ['number'],
      description: 'Value axis must be numeric values',
    },
  },
  [ChartType.Pie]: {
    xAxis: {
      allowedTypes: [],
      description: '',
    },
    yAxis: {
      allowedTypes: [],
      description: '',
    },
  },
  [ChartType.Donut]: {
    xAxis: {
      allowedTypes: [],
      description: '',
    },
    yAxis: {
      allowedTypes: [],
      description: '',
    },
  },
};

/**
 * Role-based validation for charts that do not use x/y axes
 * Keyed by chart type name (lowercase) to avoid hard enum coupling.
 */
export const CHART_ROLE_VALIDATION_RULES: Record<
  string,
  {
    label: { allowedTypes: DataType[]; description: string };
    value: { allowedTypes: DataType[]; description: string };
  }
> = {
  pie: {
    label: {
      allowedTypes: ['text', 'date'],
      description: 'Label should be categorical or date text',
    },
    value: {
      allowedTypes: ['number'],
      description: 'Value must be numeric',
    },
  },
  donut: {
    label: {
      allowedTypes: ['text', 'date'],
      description: 'Label should be categorical or date text',
    },
    value: {
      allowedTypes: ['number'],
      description: 'Value must be numeric',
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
export const getChartTypeKey = (chartType: ChartType | string): ChartType => {
  // If caller passed the enum value directly (number), return it
  if (typeof chartType === 'number') return chartType as ChartType;

  // If it's a string, map common names to enum
  if (typeof chartType === 'string') {
    switch (chartType.toLowerCase()) {
      case 'line':
        return ChartType.Line;
      case 'bar':
        return ChartType.Bar;
      case 'area':
        return ChartType.Area;
      case 'scatter':
        return ChartType.Scatter;
      case 'cycleplot':
      case 'cycle':
        return ChartType.CyclePlot;
      default:
        return ChartType.Line; // Default fallback
    }
  }

  // Fallback - return Line
  return ChartType.Line;
};

/**
 * Normalize data type strings to standard types
 * Handles common variations in type naming
 */
const normalizeDataType = (dataType: string): string => {
  const normalized = dataType.toLowerCase().trim();

  // Map common variations to standard types
  const typeMap: Record<string, string> = {
    str: 'text',
    varchar: 'text',
    char: 'text',
    string: 'text',
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
  if (!rules) return ['text', 'number', 'date']; // Allow all by default (standardized)

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
