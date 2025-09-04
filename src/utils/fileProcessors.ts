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
  delimiter?: string;
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
 * Parse tabular data from text content using Papa Parse
 */
export const parseTabularContent = (
  text: string,
  file?: File,
  options: FileProcessingOptions = {}
): Papa.ParseResult<string[]> => {
  const delimiter = options.delimiter || (file ? getFileDelimiter(file) : ',');

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
  }

  return result;
};

/**
 * Process file and return Papa Parse result directly
 * Accepts any readable text file and attempts to parse as tabular data
 */
export const processFileContent = async (
  file: File,
  options: FileProcessingOptions = {}
): Promise<Papa.ParseResult<string[]>> => {
  if (!isValidFileType(file)) {
    throw new Error(`dataset_unsupportedFileType:${file.type || 'unknown'}`);
  }

  const textContent = await file.text();
  return parseTabularContent(textContent, file, options);

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




