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

export interface FileProcessingOptions {
  delimiter?: string;
  encoding?: string;
  skipEmptyLines?: boolean;
  trimValues?: boolean;
  hasHeaders?: boolean;
}

/**
 * Check if a file type can be read as text content
 */
export const isReadableTextFile = (file: File): boolean => {
  const readableExtensions = ['.csv', '.txt', '.tsv', '.json'];
  const readableMimeTypes = [
    'text/plain',
    'text/csv',
    'text/tab-separated-values',
    'application/json',
  ];

  return (
    readableMimeTypes.includes(file.type) ||
    readableExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
  );
};

/**
 * Check if a file contains tabular data (CSV/TSV)
 */
export const isTabularDataFile = (file: File): boolean => {
  const tabularExtensions = ['.csv', '.tsv'];
  const tabularMimeTypes = ['text/csv', 'text/tab-separated-values'];

  return (
    tabularMimeTypes.includes(file.type) ||
    tabularExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
  );
};

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
  file: File,
  options: FileProcessingOptions = {}
): Papa.ParseResult<string[]> => {
  const config: Papa.ParseConfig = {
    delimiter: options.delimiter || getFileDelimiter(file),
    header: false, // Return array of arrays instead of objects
    skipEmptyLines: options.skipEmptyLines ?? true,
    transform: options.trimValues ? (value: string) => value.trim() : undefined,
    comments: false, // Don't treat any lines as comments
    fastMode: false, // Use robust parsing for quoted fields
    dynamicTyping: false, // Keep all values as strings
  };

  const result = Papa.parse(text, config);

  // Normalize all rows to have the same length as the header (first row)
  if (result.data.length > 0) {
    const headerLength = result.data[0].length;
    result.data = result.data.map(row =>
      row.length > headerLength ? row.slice(0, headerLength) : row
    );
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
    throw new Error(`File type ${file.type || 'unknown'} is not supported.`);
  }

  try {
    const textContent = await file.text();
    return parseTabularContent(textContent, file, options);
  } catch (error) {
    throw new Error(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Validate file size
 */
export const validateFileSize = (file: File, maxSizeInBytes: number = 50 * 1024 * 1024): boolean => {
  return file.size <= maxSizeInBytes;
};

/**
 * Validate file type against allowed types
 */
export const validateFileType = (file: File, allowedTypes: string[], allowedExtensions: string[]): boolean => {
  return (
    allowedTypes.includes(file.type) ||
    allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
  );
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
};

/**
 * Check if file is a specific type
 */
export const isFileType = (file: File, extensions: string[], mimeTypes: string[] = []): boolean => {
  return (
    mimeTypes.includes(file.type) ||
    extensions.some(ext => file.name.toLowerCase().endsWith(ext.toLowerCase()))
  );
};

/**
 * Validate if file type is allowed for dataset upload
 */
export const isValidFileType = (file: File): boolean => {
  return validateFileType(file, ALLOWED_TYPES, ALLOWED_EXTENSIONS);
};
