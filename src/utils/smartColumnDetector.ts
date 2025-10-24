/**
 * Smart Column Header Detector
 * Analyzes the first 20 rows of a dataset to automatically detect:
 * - Date formats and patterns
 * - Number separators (thousands and decimal)
 * - Column data types
 */

import type { DateFormat, NumberFormat } from '@/contexts/DatasetContext';
import type { DataHeader } from '@/utils/dataProcessors';

// Confidence thresholds for smart detection
export const COLUMN_TYPE_CONFIDENCE_THRESHOLD = 0.6; // For column type detection (text/number/date)
export const FORMAT_APPLICATION_CONFIDENCE_THRESHOLD = 0.6; // For format application (date format, number separators)

export interface DetectionResult {
  dateFormat: DateFormat;
  numberFormat: NumberFormat;
  columnTypes: Array<'text' | 'number' | 'date'>;
  confidence: {
    dateFormat: number;
    numberFormat: number;
    columnTypes: number[];
  };
}

// Common date patterns with their regex and confidence scores
const DATE_PATTERNS = [
  {
    format: 'YYYY-MM-DD HH:mm:ss' as DateFormat,
    regex: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
    confidence: 0.95,
    validate: undefined,
  },
  {
    format: 'YYYY-MM-DD' as DateFormat,
    regex: /^\d{4}-\d{2}-\d{2}$/,
    confidence: 0.9,
    validate: undefined,
  },
  {
    format: 'YYYY/MM/DD' as DateFormat,
    regex: /^\d{4}\/\d{2}\/\d{2}$/,
    confidence: 0.9,
    validate: undefined,
  },
  {
    format: 'DD Month YYYY' as DateFormat,
    regex: /^\d{2} [A-Za-z]+ \d{4}$/,
    confidence: 0.85,
    validate: undefined,
  },
  // Ambiguous patterns - need validation
  {
    format: 'DD/MM/YYYY' as DateFormat,
    regex: /^\d{2}\/\d{2}\/\d{4}$/,
    confidence: 0.8,
    validate: (val: string) => {
      const [d, m] = val.split('/').map(Number);
      return d > 12 || m <= 12; // If day > 12, likely DD/MM format
    },
  },
  {
    format: 'MM/DD/YYYY' as DateFormat,
    regex: /^\d{2}\/\d{2}\/\d{4}$/,
    confidence: 0.8,
    validate: (val: string) => {
      const [first, second] = val.split('/').map(Number);
      return first <= 12 && second > 12; // If first <= 12 and second > 12, likely MM/DD
    },
  },
  {
    format: 'DD-MM-YYYY' as DateFormat,
    regex: /^\d{2}-\d{2}-\d{4}$/,
    confidence: 0.8,
    validate: (val: string) => {
      const [d, m] = val.split('-').map(Number);
      return d > 12 || m <= 12;
    },
  },
  {
    format: 'MM-DD-YYYY' as DateFormat,
    regex: /^\d{2}-\d{2}-\d{4}$/,
    confidence: 0.8,
    validate: (val: string) => {
      const [first, second] = val.split('-').map(Number);
      return first <= 12 && second > 12;
    },
  },
  {
    format: 'YYYY' as DateFormat,
    regex: /^\d{4}$/,
    confidence: 0.6, // Lower confidence to avoid matching plain numbers
    validate: (val: string) => {
      const year = Number(val);
      return year >= 1900 && year <= 2100; // Reasonable year range
    },
  },
];

// Common number patterns with separators
const NUMBER_PATTERNS = [
  {
    thousandsSeparator: ',',
    decimalSeparator: '.',
    regex: /^-?\d{1,3}(,\d{3})*(\.\d+)?$/,
    confidence: 0.9,
  },
  {
    thousandsSeparator: '.',
    decimalSeparator: ',',
    regex: /^-?\d{1,3}(\.\d{3})*(,\d+)?$/,
    confidence: 0.9,
  },
  {
    thousandsSeparator: ' ',
    decimalSeparator: '.',
    regex: /^-?\d{1,3}( \d{3})*(\.\d+)?$/,
    confidence: 0.8,
  },
  {
    thousandsSeparator: '',
    decimalSeparator: '.',
    regex: /^-?\d+(\.\d+)?$/,
    confidence: 0.7,
  },
  {
    thousandsSeparator: '',
    decimalSeparator: ',',
    regex: /^-?\d+(,\d+)?$/,
    confidence: 0.7,
  },
];

/**
 * Analyze a single column to determine its type and format
 */
function analyzeColumn(columnData: string[]): {
  type: 'text' | 'number' | 'date';
  confidence: number;
  detectedFormat?: any;
} {
  const sampleSize = Math.min(20, columnData.length);
  const samples = columnData.slice(0, sampleSize).filter(val => val.trim() !== '');

  if (samples.length === 0) {
    return { type: 'text', confidence: 0 };
  }

  // Test for date patterns with validation
  let dateScore = 0;
  let bestDatePattern = null;
  for (const pattern of DATE_PATTERNS) {
    const matches = samples.filter(val => {
      const trimmed = val.trim();
      if (!pattern.regex.test(trimmed)) return false;
      if (pattern.validate) {
        return pattern.validate(trimmed);
      }
      return true;
    });
    const matchRatio = matches.length / samples.length;
    const score = matchRatio * pattern.confidence;
    if (score > dateScore) {
      dateScore = score;
      bestDatePattern = pattern;
    }
  }

  // 🧩 FIXED NUMBER PATTERN ANALYSIS
  let numberScore = 0;
  let bestNumberPattern = null;
  for (const pattern of NUMBER_PATTERNS) {
    const matches = samples.filter(val => pattern.regex.test(val.trim()));
    const matchRatio = matches.length / samples.length;
    let score = matchRatio * pattern.confidence;

    // 🩹 Penalize if no thousands separator appears in the actual data
    if (
      pattern.thousandsSeparator &&
      !samples.some(val => val.includes(pattern.thousandsSeparator))
    ) {
      score *= 0.7; // reduce confidence if separator isn't used at all
    }

    if (score > numberScore) {
      numberScore = score;
      bestNumberPattern = pattern;
    }
  }

  // Debug logging
  console.log('🔍 Column analysis:', {
    samples: samples.slice(0, 3),
    dateScore,
    numberScore,
    bestDatePattern: bestDatePattern?.format,
    bestNumberPattern: bestNumberPattern
      ? `${bestNumberPattern.thousandsSeparator}|${bestNumberPattern.decimalSeparator}`
      : null,
  });

  // Determine final type
  if (dateScore > 0.6 && dateScore > numberScore) {
    return { type: 'date', confidence: dateScore, detectedFormat: bestDatePattern };
  } else if (numberScore > 0.6 && numberScore > dateScore) {
    return { type: 'number', confidence: numberScore, detectedFormat: bestNumberPattern };
  } else {
    return { type: 'text', confidence: 0.5 };
  }
}

/**
 * Detect the most common date format across all columns
 */
function detectDateFormat(
  columnAnalyses: Array<{ type: string; confidence: number; detectedFormat?: any }>,
  data: string[][]
): { format: DateFormat; confidence: number } {
  const formatCounts: Record<string, number> = {};
  const formatConfidences: Record<string, number[]> = {};

  // Iterate through columns and collect format information
  columnAnalyses.forEach((col, colIndex) => {
    if (col.type === 'date' && col.detectedFormat) {
      const format = col.detectedFormat.format;
      const columnData = data.map(row => row[colIndex]).filter(val => val && val.trim() !== '');

      // Count valid matches for this format
      const matches = columnData.filter(val => {
        const trimmed = val.trim();
        if (!col.detectedFormat.regex.test(trimmed)) return false;
        if (col.detectedFormat.validate) {
          return col.detectedFormat.validate(trimmed);
        }
        return true;
      });

      if (matches.length > 0) {
        formatCounts[format] = (formatCounts[format] || 0) + matches.length;
        if (!formatConfidences[format]) {
          formatConfidences[format] = [];
        }
        formatConfidences[format].push(col.confidence);
      }
    }
  });

  if (Object.keys(formatCounts).length === 0) {
    return { format: 'YYYY-MM-DD', confidence: 0 };
  }

  let bestFormat = 'YYYY-MM-DD';
  let bestConfidence = 0;

  Object.entries(formatCounts).forEach(([format, count]) => {
    const avgConfidence =
      formatConfidences[format].reduce((a, b) => a + b, 0) / formatConfidences[format].length;

    if (avgConfidence > bestConfidence) {
      bestConfidence = avgConfidence;
      bestFormat = format;
    }
  });

  return {
    format: bestFormat as DateFormat,
    confidence: bestConfidence,
  };
}

/**
 * Detect the most common number format across all columns
 */
function detectNumberFormat(
  columnAnalyses: Array<{ type: string; confidence: number; detectedFormat?: any }>,
  data: string[][]
): { format: NumberFormat; confidence: number } {
  const thousandsCounts: Record<string, { count: number; confidences: number[] }> = {};
  const decimalCounts: Record<string, { count: number; confidences: number[] }> = {};

  // Iterate through number columns and collect separator information
  columnAnalyses.forEach((col, colIndex) => {
    if (col.type === 'number' && col.detectedFormat) {
      const columnData = data.map(row => row[colIndex]).filter(val => val && val.trim() !== '');
      const matches = columnData.filter(val => col.detectedFormat.regex.test(val.trim()));

      if (matches.length > 0) {
        const thousands = col.detectedFormat.thousandsSeparator;
        const decimal = col.detectedFormat.decimalSeparator;

        if (!thousandsCounts[thousands]) {
          thousandsCounts[thousands] = { count: 0, confidences: [] };
        }
        if (!decimalCounts[decimal]) {
          decimalCounts[decimal] = { count: 0, confidences: [] };
        }

        thousandsCounts[thousands].count += matches.length;
        thousandsCounts[thousands].confidences.push(col.confidence);

        decimalCounts[decimal].count += matches.length;
        decimalCounts[decimal].confidences.push(col.confidence);
      }
    }
  });

  if (Object.keys(thousandsCounts).length === 0) {
    return {
      format: { thousandsSeparator: ',', decimalSeparator: '.' },
      confidence: 0,
    };
  }

  // Find best thousands separator
  let bestThousands = ',';
  let bestThousandsConfidence = 0;

  Object.entries(thousandsCounts).forEach(([separator, data]) => {
    const avgConfidence = data.confidences.reduce((a, b) => a + b, 0) / data.confidences.length;

    if (avgConfidence > bestThousandsConfidence) {
      bestThousandsConfidence = avgConfidence;
      bestThousands = separator;
    }
  });

  // Find best decimal separator (must be different from thousands)
  let bestDecimal = '.';
  let bestDecimalConfidence = 0;

  Object.entries(decimalCounts).forEach(([separator, data]) => {
    // Skip if same as thousands separator
    if (separator === bestThousands) return;

    const avgConfidence = data.confidences.reduce((a, b) => a + b, 0) / data.confidences.length;

    if (avgConfidence > bestDecimalConfidence) {
      bestDecimalConfidence = avgConfidence;
      bestDecimal = separator;
    }
  });

  // Validate that separators are different
  if (bestThousands === bestDecimal) {
    // If they're the same, prefer the more common convention
    if (bestThousands === ',') {
      bestDecimal = '.';
    } else {
      bestThousands = ',';
    }
  }

  const overallConfidence = (bestThousandsConfidence + bestDecimalConfidence) / 2;

  return {
    format: {
      thousandsSeparator: bestThousands,
      decimalSeparator: bestDecimal,
    },
    confidence: overallConfidence,
  };
}

/**
 * Main function to detect column types and formats from dataset
 */
export function detectColumnFormats(data: string[][], maxRows: number = 20): DetectionResult {
  if (!data || data.length === 0) {
    return {
      dateFormat: 'YYYY-MM-DD',
      numberFormat: { thousandsSeparator: ',', decimalSeparator: '.' },
      columnTypes: [],
      confidence: { dateFormat: 0, numberFormat: 0, columnTypes: [] },
    };
  }

  // Limit analysis to first maxRows rows
  const analysisData = data.slice(0, maxRows);
  const columnCount = analysisData[0]?.length || 0;

  if (columnCount === 0) {
    return {
      dateFormat: 'YYYY-MM-DD',
      numberFormat: { thousandsSeparator: ',', decimalSeparator: '.' },
      columnTypes: [],
      confidence: { dateFormat: 0, numberFormat: 0, columnTypes: [] },
    };
  }

  // Analyze each column
  const columnAnalyses: Array<{
    type: 'text' | 'number' | 'date';
    confidence: number;
    detectedFormat?: any;
  }> = [];

  for (let colIndex = 0; colIndex < columnCount; colIndex++) {
    const columnData = analysisData.map(row => row[colIndex] || '');
    const analysis = analyzeColumn(columnData);
    columnAnalyses.push(analysis);
  }

  // Detect overall formats
  const dateFormatResult = detectDateFormat(columnAnalyses, analysisData);
  const numberFormatResult = detectNumberFormat(columnAnalyses, analysisData);

  console.log('🎯 Final detection results:', {
    dateFormat: dateFormatResult.format,
    dateConfidence: dateFormatResult.confidence,
    numberFormat: numberFormatResult.format,
    numberConfidence: numberFormatResult.confidence,
    columnTypes: columnAnalyses.map(col => col.type),
  });

  return {
    dateFormat: dateFormatResult.format,
    numberFormat: numberFormatResult.format,
    columnTypes: columnAnalyses.map(col => col.type),
    confidence: {
      dateFormat: dateFormatResult.confidence,
      numberFormat: numberFormatResult.confidence,
      columnTypes: columnAnalyses.map(col => col.confidence),
    },
  };
}

/**
 * Apply detected formats to data headers
 */
export function applyDetectedFormats(
  headers: DataHeader[],
  detectionResult: DetectionResult
): DataHeader[] {
  return headers.map((header, index) => {
    const detectedType = detectionResult.columnTypes[index];
    const confidence = detectionResult.confidence.columnTypes[index] || 0;

    // Only apply detected type if confidence is high enough
    if (confidence > COLUMN_TYPE_CONFIDENCE_THRESHOLD) {
      return {
        ...header,
        type: detectedType,
      };
    }

    return header;
  });
}
