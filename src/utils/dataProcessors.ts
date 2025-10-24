/**
 * Data Processing Utilities
 * General-purpose functions for processing various data types and formats
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  detectColumnFormats,
  applyDetectedFormats,
  FORMAT_APPLICATION_CONFIDENCE_THRESHOLD,
} from './smartColumnDetector';

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

export interface DataHeader {
  name: string;
  type: 'text' | 'number' | 'date';
  index: number;
  width?: number;
}

export interface ParsedDataResult {
  headers: DataHeader[];
  data: string[][];
  detectionResult?: any; // Smart detection results
  detectedDateFormat?: string | null; // Auto-detected date format
  detectedNumberFormat?: { thousandsSeparator: string; decimalSeparator: string } | null; // Auto-detected number format
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
 * Normalize 2D array data to ensure consistent row lengths and handle duplicate headers
 * @param data - 2D array of data
 * @returns Normalized 2D array with consistent row lengths
 */
const normalizeArrayData = (data: string[][]): string[][] => {
  if (data.length === 0) return data;

  // Normalize all rows to have the same length as the first row
  const headerLength = data[0].length;
  const normalizedData = data.map(row => {
    if (row.length > headerLength) {
      // Truncate rows that are too long
      return row.slice(0, headerLength);
    } else if (row.length < headerLength) {
      // Fill rows that are too short with empty strings
      return [...row, ...Array(headerLength - row.length).fill('')];
    }
    return row;
  });

  // Handle duplicate headers in the first row
  normalizedData[0] = handleDuplicateHeaders(normalizedData[0]);

  return normalizedData;
};

/**
 * Smart delimiter detector that analyzes the header row
 * @param text - The text content to analyze
 * @param candidates - Array of delimiter candidates to test, in priority order
 * @returns The best delimiter string
 */
export const detectDelimiter = (
  text: string,
  candidates: string[] = DELIMITER_OPTIONS.map(({ value }) => value)
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
    // If no valid header found, just use the first candidate
    return candidates[0];
  }

  // Count occurrences of each delimiter in the header
  const counts: Record<string, number> = {};
  for (const delimiter of candidates) {
    counts[delimiter] = (headerLine.match(new RegExp(`\\${delimiter}`, 'g')) || []).length;
  }

  // Pick delimiter with max count, breaking ties by candidate order
  let maxCount = -1;
  let bestDelimiter = candidates[0];

  for (const delimiter of candidates) {
    if (counts[delimiter] > maxCount) {
      maxCount = counts[delimiter];
      bestDelimiter = delimiter;
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
): ParsedDataResult => {
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
  let normalizedData: string[][];
  if (result.data.length > 0) {
    normalizedData = normalizeArrayData(result.data);
  } else {
    normalizedData = result.data;
  }

  // Separate headers and data
  const headerRow = normalizedData[0] || [];
  const dataRows = normalizedData.slice(1);

  // Create headers array with type detection (defaulting to text for now)
  const headers: DataHeader[] = headerRow.map((headerName, index) => ({
    name: headerName || `Column ${index + 1}`,
    type: 'text', // Default to text for now
    index: index,
  }));

  // Run smart detection on the data (exclude header row)
  const detectionResult = detectColumnFormats(dataRows, 20);

  // Apply detected column types to headers
  const smartHeaders = applyDetectedFormats(headers, detectionResult);

  return {
    headers: smartHeaders,
    data: dataRows,
    detectionResult,
    // Auto-apply detected formats if confidence is high enough
    detectedDateFormat:
      detectionResult.confidence.dateFormat >= FORMAT_APPLICATION_CONFIDENCE_THRESHOLD
        ? detectionResult.dateFormat
        : null,
    detectedNumberFormat:
      detectionResult.confidence.numberFormat >= FORMAT_APPLICATION_CONFIDENCE_THRESHOLD
        ? detectionResult.numberFormat
        : null,
  };
};

/**
 * Process file and return ParsedDataResult with headers and data
 * Accepts any readable text file and attempts to parse as tabular data
 */
export const processFileContent = async (
  file: File,
  options: FileProcessingOptions
): Promise<ParsedDataResult> => {
  if (!isValidFileType(file)) {
    throw new Error(`dataset_unsupportedFileType:${file.type || 'unknown'}`);
  }

  let textContent: string;

  // Handle Excel files differently
  if (isExcelFile(file)) {
    textContent = await readExcelAsText(file);
  } else {
    // Handle other text-based files
    textContent = await file.text();
  }

  return parseTabularContent(textContent, options);
};

/**
 * Validate file size
 */
export const validateFileSize = (
  file: File,
  maxSizeInBytes: number = 50 * 1024 * 1024
): boolean => {
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
 * Read text content from Excel files (.xls, .xlsx)
 * @param file - Excel file to read
 * @returns Promise that resolves to text content in CSV format
 */
export const readExcelAsText = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('dataset_excelReadDataFailed'));
          return;
        }

        // Parse the Excel file
        const workbook = XLSX.read(data, { type: 'array' });

        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          reject(new Error('dataset_excelNoWorksheets'));
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];

        // Convert worksheet to CSV format
        const csvText = XLSX.utils.sheet_to_csv(worksheet, {
          blankrows: false, // Skip completely empty rows
        });

        resolve(csvText);
      } catch (error) {
        reject(
          new Error(
            `dataset_excelParseFailed:${error instanceof Error ? error.message : 'Unknown error'}`
          )
        );
      }
    };

    reader.onerror = () => {
      reject(new Error('dataset_fileReadFailed'));
    };

    // Read the file as binary string for XLSX library
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Check if a file is an Excel file
 * @param file - File to check
 * @returns True if file is Excel format
 */
export const isExcelFile = (file: File): boolean => {
  const excelTypes = [
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  ];

  const excelExtensions = ['.xls', '.xlsx'];

  return (
    excelTypes.includes(file.type) ||
    excelExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
  );
};

/**
 * Check if text content is valid JSON format
 * @param text - Text content to check
 * @returns True if text is valid JSON
 */
export const isJsonFormat = (text: string): boolean => {
  if (!text.trim()) return false;

  try {
    const parsed = JSON.parse(text);
    // Check if it's a 2D array (array of arrays)
    return Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0]);
  } catch {
    return false;
  }
};

/**
 * Parse JSON content and return ParsedDataResult with headers and data
 * @param jsonText - JSON text content
 * @returns ParsedDataResult format
 */
export const parseJsonDirectly = (jsonText: string): ParsedDataResult => {
  try {
    const parsed = JSON.parse(jsonText);

    // Validate JSON structure: must be 2D array with at least 2 rows
    if (!Array.isArray(parsed) || parsed.length < 2 || !Array.isArray(parsed[0])) {
      throw new Error('dataset_jsonInvalidFormat');
    }

    // Ensure all elements are arrays
    const data: (string | number | boolean | null)[][] = parsed.map(row => {
      if (!Array.isArray(row)) {
        throw new Error('dataset_jsonElementsNotArrays');
      }
      return row;
    });

    // Convert to string format for consistency
    const stringData: string[][] = data.map(row => row.map(cell => String(cell ?? '')));

    // Normalize the data directly
    const normalizedData = normalizeArrayData(stringData);

    // Separate headers and data
    const headerRow = normalizedData[0] || [];
    const dataRows = normalizedData.slice(1);

    // Create headers array with type detection (defaulting to text for now)
    const headers: DataHeader[] = headerRow.map((headerName, index) => ({
      name: headerName || `Column ${index + 1}`,
      type: 'text', // Default to text for now
      index: index,
    }));

    // Run smart detection on the data (exclude header row)
    const detectionResult = detectColumnFormats(dataRows, 20);

    // Apply detected column types to headers
    const smartHeaders = applyDetectedFormats(headers, detectionResult);

    return {
      headers: smartHeaders,
      data: dataRows,
      detectionResult,
      // Auto-apply detected formats if confidence is high enough
      detectedDateFormat:
        detectionResult.confidence.dateFormat >= FORMAT_APPLICATION_CONFIDENCE_THRESHOLD
          ? detectionResult.dateFormat
          : null,
      detectedNumberFormat:
        detectionResult.confidence.numberFormat >= FORMAT_APPLICATION_CONFIDENCE_THRESHOLD
          ? detectionResult.numberFormat
          : null,
    };
  } catch (error) {
    // If it's already a translation key, throw it directly
    if (error instanceof Error && error.message.startsWith('dataset_')) {
      throw error;
    }
    // Otherwise, throw the unknown error key with the error message
    throw new Error(
      `dataset_jsonUnknownError:${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};
