import type { ChartDataPoint } from '@/components/charts/D3LineChart';

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
    validateTypes = false
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
    .map((row) => {
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
  
  const dataRows = chartData.map(point => 
    dataHeaders.map(header => point[header] ?? 0)
  );

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
    warnings: []
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
      missingValues: {}
    };
  }

  const headers = Object.keys(chartData[0]);
  const stats: DataStatistics = {
    totalRows: chartData.length,
    totalColumns: headers.length,
    numericColumns: [],
    stringColumns: [],
    missingValues: {}
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
  snakeCase: (header: string) => 
    header.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '_'),
  
  /** Keep original */
  original: (header: string) => header,
  
  /** Remove spaces and special characters */
  clean: (header: string) => 
    header.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
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
    statistics: getDataStatistics(convertArrayToChartData(arrayData))
  };
};
