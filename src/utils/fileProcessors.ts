/**
 * File Processing Utilities
 * General-purpose functions for processing various file types
 */

import Papa from 'papaparse';

// File validation configuration constants
export const ALLOWED_TYPES = [
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'text/csv', // .csv
  'text/plain', // .txt
  'application/json', // .json
  'text/tab-separated-values', // .tsv
];

export const ALLOWED_EXTENSIONS = ['.xls', '.xlsx', '.csv', '.txt', '.json', '.tsv'];
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Delimiter options for data parsing
export const DELIMITER_OPTIONS = [
  { value: ',', label: 'Comma (,)', description: 'CSV format' },
  { value: ';', label: 'Semicolon (;)', description: 'European CSV' },
  { value: '\t', label: 'Tab (\\t)', description: 'TSV format' },
  { value: '|', label: 'Pipe (|)', description: 'Pipe separated' },
];

export interface FileProcessingOptions {
  delimiter: string; // Make delimiter required
  encoding?: string;
  skipEmptyLines?: boolean;
  trimValues?: boolean;
  hasHeaders?: boolean;
}



/**
 * Determine the appropriate delimiter for a file
 */
export const getFileDelimiter = (file: File): string => {
  if (file.name.toLowerCase().endsWith('.tsv') || file.type === 'text/tab-separated-values') {
    return '\t';
  }
  if (file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv') {
    return ',';
  }
  return ','; // default fallback
};

/**
 * Handle duplicate headers by adding numeric suffixes
 * @param headers - Array of header names
 * @returns Array of unique header names with suffixes
 */
const handleDuplicateHeaders = (headers: string[]): string[] => {
  const headerCounts = new Map<string, number>();
  const processedHeaders: string[] = [];

  for (const header of headers) {
    const trimmedHeader = header.trim();
    const count = headerCounts.get(trimmedHeader) || 0;

    if (count === 0) {
      // First occurrence, use as is
      processedHeaders.push(trimmedHeader);
      headerCounts.set(trimmedHeader, 1);
    } else {
      // Duplicate, add suffix
      const newHeader = `${trimmedHeader}_${count}`;
      processedHeaders.push(newHeader);
      headerCounts.set(trimmedHeader, count + 1);
    }
  }

  return processedHeaders;
};

/**
 * Smart delimiter detector that analyzes the header row
 * @param text - The text content to analyze
 * @param candidates - Array of delimiter candidates to test
 * @returns The best delimiter string
 */
export const detectDelimiter = (
  text: string,
  candidates: string[] = [',', '\t', ';', '|']
): string => {
  // Split into lines and find the first non-empty, non-comment line
  const lines = text.split('\n');
  let headerLine = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('//')) {
      headerLine = trimmed;
      break;
    }
  }

  if (!headerLine) {
    // Fallback to comma if no valid header found
    return ',';
  }

  // Count occurrences of each delimiter in the header
  const counts: Record<string, number> = {};
  for (const delimiter of candidates) {
    counts[delimiter] = (headerLine.match(new RegExp(`\\${delimiter}`, 'g')) || []).length;
  }

  // Find delimiter with highest count
  let maxCount = -1;
  let bestDelimiter = ',';

  for (const delimiter of candidates) {
    if (counts[delimiter] > maxCount) {
      maxCount = counts[delimiter];
      bestDelimiter = delimiter;
    }
  }

  // Check for ties and resolve using priority order
  const tied = candidates.filter(d => counts[d] === maxCount);

  if (tied.length > 1) {
    for (const delimiter of [',', '\t', ';', '|']) {
      if (tied.includes(delimiter)) {
        bestDelimiter = delimiter;
        break;
      }
    }
  }


  return bestDelimiter;
};


/**
 * Parse tabular data from text content using Papa Parse
 */
export const parseTabularContent = (
  text: string,
  options: FileProcessingOptions
): Papa.ParseResult<string[]> => {
  const delimiter = options.delimiter;

  const config: Papa.ParseConfig = {
    delimiter: delimiter,
    header: false, // Return array of arrays instead of objects
    skipEmptyLines: options.skipEmptyLines ?? true,
    transform: options.trimValues ? (value: string) => value.trim() : undefined,
    comments: false, // Don't treat any lines as comments
    fastMode: delimiter === '\t', // Use fast mode for tab-separated files to handle quotes differently
    dynamicTyping: false, // Keep all values as strings
    quoteChar: '"',
    escapeChar: '"',
  };

  const result = Papa.parse(text, config);

  // Validate that we have data beyond just headers
  if (result.data.length <= 1) {
    throw new Error('dataset_cannotParse');
  }

  // Normalize all rows to have the same length as the header (first row)
  if (result.data.length > 0) {
    const headerLength = result.data[0].length;
    result.data = result.data.map(row => {
      if (row.length > headerLength) {
        // Truncate rows that are too long
        return row.slice(0, headerLength);
      } else if (row.length < headerLength) {
        // Fill rows that are too short with empty strings
        return [...row, ...Array(headerLength - row.length).fill('')];
      }
      // Row is exactly the right length
      return row;
    });

    // Handle duplicate headers in the first row
    result.data[0] = handleDuplicateHeaders(result.data[0]);
  }

  return result;
};

/**
 * Process file and return Papa Parse result directly
 * Accepts any readable text file and attempts to parse as tabular data
 */
export const processFileContent = async (
  file: File,
  options: FileProcessingOptions
): Promise<Papa.ParseResult<string[]>> => {
  if (!isValidFileType(file)) {
    throw new Error(`dataset_unsupportedFileType:${file.type || 'unknown'}`);
  }

  const textContent = await file.text();
  return parseTabularContent(textContent, options);
};

/**
 * Validate file size
 */
export const validateFileSize = (file: File, maxSizeInBytes: number = 50 * 1024 * 1024): boolean => {
  return file.size <= maxSizeInBytes;
};

/**
 * Validate if file type is allowed for dataset upload
 */
export const isValidFileType = (file: File): boolean => {
  return (
    ALLOWED_TYPES.includes(file.type) ||
    ALLOWED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext))
  );
};

/**
 * Transforms data from wide format to long format (melt operation)
 * @param data - 2D array of data with headers in first row
 * @param transformationColumn - Column name to use as identifier
 * @returns Transformed data in long format
 */
export const transformWideToLong = (
  data: string[][],
  transformationColumn: string
): string[][] => {
  if (!data || data.length === 0) return data;

  const headers = data[0];
  const columnIndex = headers?.indexOf(transformationColumn);
  if (columnIndex === undefined || columnIndex < 0) return data;

  // Get all other columns (excluding the selected transformation column)
  const otherColumns = headers.filter((_, index) => index !== columnIndex);

  // Create new headers: [selectedColumn, 'variable', 'value']
  const transformed: string[][] = [];
  transformed.push([transformationColumn, 'variable', 'value']);

  // Process each data row
  for (let i = 1; i < data.length; i += 1) {
    const row = data[i] || [];
    const idValue = (row[columnIndex] ?? '').toString();

    // For each other column, create a new row
    for (let j = 0; j < otherColumns.length; j += 1) {
      const otherColumnIndex = headers.indexOf(otherColumns[j]);
      const cellValue = (row[otherColumnIndex] ?? '').toString();
      transformed.push([idValue, otherColumns[j], cellValue]);
    }
  }

  return transformed;
};

/**
 * Extract original headers from text content using specified delimiter
 * @param textContent - Original text content
 * @param delimiter - Delimiter to use for parsing
 * @returns Array of header names
 */
export const getOriginalHeaders = (
  textContent: string,
  delimiter: string
): string[] => {
  if (!textContent) return [];
  try {
    const result = parseTabularContent(textContent, { delimiter });
    return result.data?.[0] || [];
  } catch {
    return [];
  }
};




