import type { ChartDataPoint } from '@/components/charts/D3LineChart';

// Backend response format for datasets
export interface BackendDataHeader {
  id: string;
  datasetId: string;
  name: string;
  type: string;
  index: number;
  encryptedData?: string;
  iv?: string;
  authTag?: string;
  encryptedDataKey?: string;
  data?: any[];
}

export interface BackendDatasetResponse {
  headers: BackendDataHeader[];
  // ... other dataset properties
}

/**
 * Convert array data to ChartDataPoint format
 * @param arrayData Array format: [headers, ...dataRows]
 * @param options Configuration options for conversion
 * @returns ChartDataPoint array
 */
export interface ConversionOptions {
  /** Transform header names (default: lowercase) */
  headerTransform?: (header: string) => string;
  /** Skip empty rows */
  skipEmptyRows?: boolean;
  /** Default value for missing/null data */
  defaultValue?: number | string;
  /** Validate data types */
  validateTypes?: boolean;
}

export const convertArrayToChartData = (
  arrayData: (string | number)[][],
  options: ConversionOptions = {}
): ChartDataPoint[] => {
  const {
    headerTransform = (header: string) => header.toLowerCase(),
    skipEmptyRows = true,
    defaultValue = 0,
    validateTypes = false,
  } = options;

  if (!arrayData || arrayData.length === 0) {
    return [];
  }

  const headers = arrayData[0] as string[];
  const dataRows = arrayData.slice(1);

  if (headers.length === 0) {
    return [];
  }

  return dataRows
    .filter(row => {
      if (!skipEmptyRows) return true;
      return row.some(cell => cell !== null && cell !== undefined && cell !== '');
    })
    .map(row => {
      const point: ChartDataPoint = {};

      headers.forEach((header, colIndex) => {
        const key = headerTransform(header);
        let value = row[colIndex];

        // Handle missing values
        if (value === null || value === undefined || value === '') {
          value = defaultValue;
        }

        // Type validation
        if (validateTypes && typeof value === 'string' && !isNaN(Number(value))) {
          value = Number(value);
        }

        point[key] = value;
      });

      return point;
    });
};

/**
 * Convert ChartDataPoint array back to array format
 * @param chartData ChartDataPoint array
 * @param headers Optional custom headers order
 * @returns Array format: [headers, ...dataRows]
 */
export const convertChartDataToArray = (
  chartData: ChartDataPoint[],
  headers?: string[]
): (string | number)[][] => {
  if (!chartData || chartData.length === 0) {
    return [];
  }

  // Get headers from first data point if not provided
  const dataHeaders = headers || Object.keys(chartData[0]);

  const dataRows = chartData.map(point => dataHeaders.map(header => point[header] ?? 0));

  return [dataHeaders, ...dataRows];
};

/**
 * Validate array data format
 * @param arrayData Array to validate
 * @returns Validation result with errors
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateArrayData = (arrayData: (string | number)[][]): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  if (!arrayData || arrayData.length === 0) {
    result.isValid = false;
    result.errors.push('Data array is empty');
    return result;
  }

  if (arrayData.length < 2) {
    result.isValid = false;
    result.errors.push('Data array must have at least headers and one data row');
    return result;
  }

  const headers = arrayData[0];
  const headerCount = headers.length;

  if (headerCount === 0) {
    result.isValid = false;
    result.errors.push('Headers row is empty');
    return result;
  }

  // Check for duplicate headers
  const headerNames = headers.map(h => String(h).toLowerCase());
  const uniqueHeaders = new Set(headerNames);
  if (uniqueHeaders.size !== headerNames.length) {
    result.warnings.push('Duplicate headers detected');
  }

  // Validate data rows
  arrayData.slice(1).forEach((row, index) => {
    if (row.length !== headerCount) {
      result.warnings.push(`Row ${index + 2} has ${row.length} columns, expected ${headerCount}`);
    }
  });

  return result;
};

/**
 * Get data statistics
 * @param chartData ChartDataPoint array
 * @returns Statistics object
 */
export interface DataStatistics {
  totalRows: number;
  totalColumns: number;
  numericColumns: string[];
  stringColumns: string[];
  missingValues: Record<string, number>;
}

export const getDataStatistics = (chartData: ChartDataPoint[]): DataStatistics => {
  if (!chartData || chartData.length === 0) {
    return {
      totalRows: 0,
      totalColumns: 0,
      numericColumns: [],
      stringColumns: [],
      missingValues: {},
    };
  }

  const headers = Object.keys(chartData[0]);
  const stats: DataStatistics = {
    totalRows: chartData.length,
    totalColumns: headers.length,
    numericColumns: [],
    stringColumns: [],
    missingValues: {},
  };

  headers.forEach(header => {
    let numericCount = 0;
    let missingCount = 0;

    chartData.forEach(point => {
      const value = point[header];
      if (value === null || value === undefined || value === '') {
        missingCount++;
      } else if (typeof value === 'number') {
        numericCount++;
      }
    });

    if (numericCount > chartData.length / 2) {
      stats.numericColumns.push(header);
    } else {
      stats.stringColumns.push(header);
    }

    if (missingCount > 0) {
      stats.missingValues[header] = missingCount;
    }
  });

  return stats;
};

/**
 * Common header transformations
 */
export const HeaderTransforms = {
  /** Convert to lowercase */
  lowercase: (header: string) => header.toLowerCase(),

  /** Convert to camelCase */
  camelCase: (header: string) =>
    header.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase()),

  /** Convert to snake_case */
  snakeCase: (header: string) => header.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '_'),

  /** Keep original */
  original: (header: string) => header,

  /** Remove spaces and special characters */
  clean: (header: string) => header.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(),
};

/**
 * Quick conversion with default options
 */
export const quickConvert = (arrayData: (string | number)[][]) =>
  convertArrayToChartData(arrayData);

/**
 * Conversion with validation
 */
export const safeConvert = (arrayData: (string | number)[][]) => {
  const validation = validateArrayData(arrayData);
  if (!validation.isValid) {
    throw new Error(`Invalid data: ${validation.errors.join(', ')}`);
  }

  return {
    data: convertArrayToChartData(arrayData, { validateTypes: true }),
    warnings: validation.warnings,
    statistics: getDataStatistics(convertArrayToChartData(arrayData)),
  };
};

// === BACKEND FORMAT CONVERTERS ===

/**
 * Convert backend dataset response (with headers containing data arrays) to ChartDataPoint format
 * @param backendData Backend dataset response with headers containing data arrays
 * @param options Configuration options for conversion
 * @returns ChartDataPoint array
 */
export const convertBackendDataToChartData = (
  backendData: BackendDatasetResponse | BackendDataHeader[],
  options: ConversionOptions = {}
): ChartDataPoint[] => {
  const {
    headerTransform = (header: string) => header.toLowerCase(),
    skipEmptyRows = true,
    defaultValue = 0,
    validateTypes = false,
  } = options;

  // Handle both formats: full response or just headers array
  const headers = Array.isArray(backendData) ? backendData : backendData.headers;

  if (!headers || headers.length === 0) {
    return [];
  }

  // Sort headers by index to ensure correct order
  const sortedHeaders = [...headers].sort((a, b) => a.index - b.index);

  // Determine the number of rows from the first header's data length
  const rowCount = sortedHeaders[0]?.data?.length || 0;
  if (rowCount === 0) {
    return [];
  }

  // Create chart data points by iterating through rows
  const chartData: ChartDataPoint[] = [];

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const point: ChartDataPoint = {};
    let isEmpty = true;

    sortedHeaders.forEach(header => {
      const key = headerTransform(header.name);
      let value = header.data?.[rowIndex];

      // Handle missing values
      if (value === null || value === undefined || value === '') {
        value = defaultValue;
      } else {
        isEmpty = false;
      }

      // Type validation and conversion based on header type
      if (
        header.type === 'number' ||
        (validateTypes && typeof value === 'string' && !isNaN(Number(value)))
      ) {
        value = Number(value);
      }

      point[key] = value;
    });

    // Skip empty rows if requested
    if (!skipEmptyRows || !isEmpty) {
      chartData.push(point);
    }
  }

  return chartData;
};

/**
 * Convert backend dataset response to legacy array format for backward compatibility
 * @param backendData Backend dataset response with headers containing data arrays
 * @returns Array format: [headers, ...dataRows]
 */
export const convertBackendDataToArray = (
  backendData: BackendDatasetResponse | BackendDataHeader[]
): (string | number)[][] => {
  // Handle both formats: full response or just headers array
  const headers = Array.isArray(backendData) ? backendData : backendData.headers;

  if (!headers || headers.length === 0) {
    return [];
  }

  // Sort headers by index to ensure correct order
  const sortedHeaders = [...headers].sort((a, b) => a.index - b.index);

  // Get header names
  const headerNames = sortedHeaders.map(h => h.name);

  // Determine the number of rows from the first header's data length
  const rowCount = sortedHeaders[0]?.data?.length || 0;
  if (rowCount === 0) {
    return [headerNames];
  }

  // Create data rows
  const dataRows: (string | number)[][] = [];
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const row = sortedHeaders.map(header => header.data?.[rowIndex] ?? '');
    dataRows.push(row);
  }

  return [headerNames, ...dataRows];
};

/**
 * Validate backend dataset response format
 * @param backendData Backend dataset response to validate
 * @returns Validation result with errors
 */
export const validateBackendData = (
  backendData: BackendDatasetResponse | BackendDataHeader[]
): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  if (!backendData) {
    result.isValid = false;
    result.errors.push('Backend data is null or undefined');
    return result;
  }

  // Handle both formats: full response or just headers array
  const headers = Array.isArray(backendData) ? backendData : backendData.headers;

  if (!headers || headers.length === 0) {
    result.isValid = false;
    result.errors.push('Headers array is empty');
    return result;
  }

  // Check for required fields in headers
  headers.forEach((header, index) => {
    if (!header.name) {
      result.errors.push(`Header at index ${index} is missing name`);
    }
    if (!header.type) {
      result.warnings.push(`Header "${header.name}" is missing type`);
    }
    if (header.index === undefined || header.index === null) {
      result.warnings.push(`Header "${header.name}" is missing index`);
    }
    if (!Array.isArray(header.data)) {
      result.errors.push(`Header "${header.name}" data is not an array`);
    }
  });

  // Check for consistent data lengths
  if (headers.length > 0 && headers[0].data) {
    const expectedLength = headers[0].data.length;
    headers.forEach((header, index) => {
      if (header.data && header.data.length !== expectedLength) {
        result.warnings.push(
          `Header "${header.name}" has ${header.data.length} data points, expected ${expectedLength}`
        );
      }
    });
  }

  // Check for duplicate header names
  const headerNames = headers.map(h => h.name.toLowerCase());
  const uniqueHeaders = new Set(headerNames);
  if (uniqueHeaders.size !== headerNames.length) {
    result.warnings.push('Duplicate header names detected');
  }

  // Check for duplicate indices
  const indices = headers.map(h => h.index).filter(i => i !== undefined && i !== null);
  const uniqueIndices = new Set(indices);
  if (uniqueIndices.size !== indices.length) {
    result.warnings.push('Duplicate header indices detected');
  }

  if (result.errors.length > 0) {
    result.isValid = false;
  }

  return result;
};

/**
 * Quick conversion from backend format with default options
 */
export const quickConvertBackend = (backendData: BackendDatasetResponse | BackendDataHeader[]) =>
  convertBackendDataToChartData(backendData);

/**
 * Safe conversion from backend format with validation
 */
export const safeConvertBackend = (backendData: BackendDatasetResponse | BackendDataHeader[]) => {
  const validation = validateBackendData(backendData);
  if (!validation.isValid) {
    throw new Error(`Invalid backend data: ${validation.errors.join(', ')}`);
  }

  return {
    data: convertBackendDataToChartData(backendData, { validateTypes: true }),
    warnings: validation.warnings,
    statistics: getDataStatistics(convertBackendDataToChartData(backendData)),
  };
};
