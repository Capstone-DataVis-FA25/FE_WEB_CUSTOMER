/**
 * Smart Column Header Detector
 * Analyzes the first 20 rows of a dataset to automatically detect:
 * - Date formats and patterns
 * - Number separators (thousands and decimal)
 * - Column data types
 */

import type { DateFormat, NumberFormat } from '@/contexts/DatasetContext';
import type { DataHeader } from '@/utils/dataProcessors';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

// Confidence thresholds for smart detection
export const COLUMN_TYPE_CONFIDENCE_THRESHOLD = 0.6;
export const FORMAT_APPLICATION_CONFIDENCE_THRESHOLD = 0.6;

export interface DetectionResult {
  dateFormat: DateFormat;
  numberFormat: NumberFormat;
  columnTypes: Array<'text' | 'number' | 'date'>;
  perColumnDateFormat?: Array<DateFormat | null>;
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
    validate: (val: string) => dayjs(val, 'YYYY-MM-DD HH:mm:ss', true).isValid(),
  },
  {
    format: 'YYYY-MM-DD' as DateFormat,
    regex: /^\d{4}-\d{2}-\d{2}$/,
    confidence: 0.9,
    validate: (val: string) => dayjs(val, 'YYYY-MM-DD', true).isValid(),
  },
  {
    format: 'YYYY/MM/DD' as DateFormat,
    regex: /^\d{4}\/\d{2}\/\d{2}$/,
    confidence: 0.9,
    validate: (val: string) => dayjs(val, 'YYYY/MM/DD', true).isValid(),
  },
  {
    format: 'YYYY-MM' as DateFormat,
    regex: /^\d{4}-\d{2}$/,
    confidence: 0.85,
    validate: (val: string) => dayjs(val, 'YYYY-MM', true).isValid(),
  },
  {
    format: 'YY-MM' as DateFormat,
    regex: /^\d{2}-\d{2}$/,
    confidence: 0.8,
    validate: (val: string) => dayjs(val, 'YY-MM', true).isValid(),
  },
  {
    format: 'MM/YY' as DateFormat,
    regex: /^\d{2}\/\d{2}$/,
    confidence: 0.8,
    validate: (val: string) => dayjs(val, 'MM/YY', true).isValid(),
  },
  {
    format: 'MM/YYYY' as DateFormat,
    regex: /^\d{2}\/\d{4}$/,
    confidence: 0.85,
    validate: (val: string) => dayjs(val, 'MM/YYYY', true).isValid(),
  },
  {
    format: 'DD Month YYYY' as DateFormat,
    regex: /^\d{2} [A-Za-z]+ \d{4}$/,
    confidence: 0.85,
    validate: (val: string) => dayjs(val, 'DD MMMM YYYY', true).isValid(),
  },
  {
    format: 'DD/MM/YYYY' as DateFormat,
    regex: /^\d{2}\/\d{2}\/\d{4}$/,
    confidence: 0.8,
    validate: (val: string) => dayjs(val, 'DD/MM/YYYY', true).isValid(),
  },
  {
    format: 'MM/DD/YYYY' as DateFormat,
    regex: /^\d{2}\/\d{2}\/\d{4}$/,
    confidence: 0.8,
    validate: (val: string) => dayjs(val, 'MM/DD/YYYY', true).isValid(),
  },
  {
    format: 'DD-MM-YYYY' as DateFormat,
    regex: /^\d{2}-\d{2}-\d{4}$/,
    confidence: 0.8,
    validate: (val: string) => dayjs(val, 'DD-MM-YYYY', true).isValid(),
  },
  {
    format: 'MM-DD-YYYY' as DateFormat,
    regex: /^\d{2}-\d{2}-\d{4}$/,
    confidence: 0.8,
    validate: (val: string) => dayjs(val, 'MM-DD-YYYY', true).isValid(),
  },
  {
    format: 'YYYY' as DateFormat,
    regex: /^\d{4}$/,
    confidence: 0.8,
    validate: (val: string) =>
      dayjs(val, 'YYYY', true).isValid() && Number(val) >= 1900 && Number(val) <= 2100,
  },
  {
    format: 'YYYY-MM-DDTHH:mm:ss' as DateFormat,
    regex: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,
    confidence: 0.95,
    validate: (val: string) => dayjs(val, 'YYYY-MM-DDTHH:mm:ss', true).isValid(),
  },
  {
    format: 'YYYY-MM-DD HH:mm' as DateFormat,
    regex: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
    confidence: 0.9,
    validate: (val: string) => dayjs(val, 'YYYY-MM-DD HH:mm', true).isValid(),
  },
  {
    format: 'YYYY-[Q]Q' as DateFormat,
    regex: /^\d{4}-Q[1-4]$/,
    confidence: 0.8,
    validate: (val: string) => /^(\d{4})-Q([1-4])$/.test(val.trim()),
  },
  {
    format: 'DD Month YYYY' as DateFormat,
    regex: /^\d{1,2} [A-Za-z]+ \d{4}$/,
    confidence: 0.85,
    validate: (val: string) => dayjs(val, 'DD MMMM YYYY', true).isValid(),
  },
  {
    format: 'MMMM' as DateFormat,
    regex: /^[A-Za-z]+$/,
    confidence: 0.7,
    validate: (val: string) => dayjs(val, 'MMMM', true).isValid(),
  },
  {
    format: 'MMM' as DateFormat,
    regex: /^[A-Za-z]{3}$/,
    confidence: 0.7,
    validate: (val: string) => dayjs(val, 'MMM', true).isValid(),
  },
  {
    format: 'MMMM YYYY' as DateFormat,
    regex: /^[A-Za-z]+ \d{4}$/,
    confidence: 0.8,
    validate: (val: string) => dayjs(val, 'MMMM YYYY', true).isValid(),
  },
  {
    format: 'MMM YYYY' as DateFormat,
    regex: /^[A-Za-z]{3} \d{4}$/,
    confidence: 0.8,
    validate: (val: string) => dayjs(val, 'MMM YYYY', true).isValid(),
  },
  {
    format: 'MMMM DD' as DateFormat,
    regex: /^[A-Za-z]+ \d{1,2}$/,
    confidence: 0.75,
    validate: (val: string) => dayjs(val, 'MMMM DD', true).isValid(),
  },
  {
    format: 'MMM DD' as DateFormat,
    regex: /^[A-Za-z]{3} \d{1,2}$/,
    confidence: 0.75,
    validate: (val: string) => dayjs(val, 'MMM DD', true).isValid(),
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
 * Validates that a number pattern's separators are used correctly
 */
function validatePatternSeparators(
  value: string,
  pattern: { thousandsSeparator: string; decimalSeparator: string }
): boolean {
  const trimmed = value.trim();

  // Validate thousands separator usage
  if (pattern.thousandsSeparator && pattern.thousandsSeparator !== '') {
    if (trimmed.includes(pattern.thousandsSeparator)) {
      const decimalSep = pattern.decimalSeparator;
      const parts = decimalSep ? trimmed.split(decimalSep) : [trimmed];
      const integerPart = parts[0].replace(/^-/, '');

      // Thousands separator must appear in groups of exactly 3 digits
      const escaped = pattern.thousandsSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const thousandsRegex = new RegExp(`^\\d{1,3}(\\${escaped}\\d{3})*$`);
      if (!thousandsRegex.test(integerPart)) {
        return false;
      }
    } else {
      // Large numbers without thousands separator when pattern expects it
      const numStr = trimmed.replace(/[^\d]/g, '');
      if (numStr.length > 3) {
        return false;
      }
    }
  }

  // Validate decimal separator usage
  if (pattern.decimalSeparator && trimmed.includes(pattern.decimalSeparator)) {
    const parts = trimmed.split(pattern.decimalSeparator);
    if (parts.length !== 2 || !parts[1] || !/^\d+$/.test(parts[1])) {
      return false;
    }
  }

  // Special case: if pattern expects "." as thousands and "," as decimal,
  // but value has "." with digits after (like "39166.593"),
  // then "." is likely the decimal, not thousands
  if (pattern.thousandsSeparator === '.' && pattern.decimalSeparator === ',') {
    if (trimmed.includes('.') && !trimmed.includes(',')) {
      const dotParts = trimmed.split('.');
      if (dotParts.length === 2 && /^\d+$/.test(dotParts[0]) && /^\d+$/.test(dotParts[1])) {
        return false;
      }
    }
  }

  return true;
}

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

  // Test for date patterns
  let dateScore = 0;
  let bestDatePattern = null;
  for (const pattern of DATE_PATTERNS) {
    const matches = samples.filter(val => {
      const trimmed = val.trim();
      if (!pattern.regex.test(trimmed)) return false;
      return pattern.validate ? pattern.validate(trimmed) : true;
    });
    const matchRatio = matches.length / samples.length;
    const score = matchRatio * pattern.confidence;
    if (score > dateScore) {
      dateScore = score;
      bestDatePattern = pattern;
    }
  }

  // Test for number patterns
  let numberScore = 0;
  let bestNumberPattern = null;

  for (const pattern of NUMBER_PATTERNS) {
    const matches = samples.filter(val => pattern.regex.test(val.trim()));
    const matchRatio = matches.length / samples.length;
    let score = matchRatio * pattern.confidence;

    // Penalize if thousands separator doesn't appear in data
    if (
      pattern.thousandsSeparator &&
      !samples.some(val => val.includes(pattern.thousandsSeparator))
    ) {
      score *= 0.7;
    }

    // Validate separator usage
    if (matches.length > 0) {
      const validMatches = matches.filter(val => validatePatternSeparators(val, pattern)).length;
      const validRatio = validMatches / matches.length;

      if (validRatio < 0.5) {
        score *= 0.2; // Heavy penalty for invalid patterns
      } else if (validRatio < 0.8) {
        score *= 0.5; // Moderate penalty
      }
    }

    if (score > numberScore) {
      numberScore = score;
      bestNumberPattern = pattern;
    }
  }

  // Heuristic fallback for custom separators
  if (numberScore <= 0.6) {
    const candidateSet = new Set<string>();
    samples.forEach(s => {
      s.replace(/[-\d]/g, '')
        .split('')
        .forEach(c => candidateSet.add(c));
    });

    const CANDIDATES = Array.from(candidateSet).filter(c => " ,._'#@".includes(c));
    let inferredDecimal: string | null = null;
    let inferredThousands: string | null = null;

    for (const s of samples) {
      for (const c of CANDIDATES.sort((a, b) => s.lastIndexOf(b) - s.lastIndexOf(a))) {
        const idx = s.lastIndexOf(c);
        if (idx > 0) {
          const right = s.slice(idx + c.length);
          if (/^\d{1,3}$/.test(right)) {
            inferredDecimal = c;
            break;
          }
        }
      }
      if (inferredDecimal) break;
    }

    if (inferredDecimal) {
      const example = samples.find(v => v.includes(inferredDecimal!)) || samples[0];
      const left = example.split(inferredDecimal)[0];
      const others = CANDIDATES.filter(c => c !== inferredDecimal);
      inferredThousands = others.find(c => left.includes(c)) || '';

      const esc = (ch: string) => (ch ? ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '');
      const thou = inferredThousands ? `(${esc(inferredThousands)}\\d{3})*` : '';
      const dec = inferredDecimal ? `(${esc(inferredDecimal)}\\d+)?` : '';
      const dyn = new RegExp(`^-?\\d{1,3}${thou}${dec}$`);

      const dynMatches = samples.filter(v => dyn.test(v.trim()));
      const ratio = dynMatches.length / samples.length;
      if (ratio >= 0.6) {
        numberScore = ratio * 0.9;
        bestNumberPattern = {
          thousandsSeparator: inferredThousands || '',
          decimalSeparator: inferredDecimal,
          regex: dyn,
          confidence: 0.9,
        } as any;
      }
    }
  }

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

  columnAnalyses.forEach((col, colIndex) => {
    if (col.type === 'date' && col.detectedFormat) {
      const format = col.detectedFormat.format;
      const columnData = data.map(row => row[colIndex]).filter(val => val && val.trim() !== '');

      const matches = columnData.filter(val => {
        const trimmed = val.trim();
        if (!col.detectedFormat.regex.test(trimmed)) return false;
        return col.detectedFormat.validate ? col.detectedFormat.validate(trimmed) : true;
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

  Object.entries(formatCounts).forEach(([format]) => {
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
 * Calculate weighted score considering both confidence and match count
 */
function calculateWeightedScore(avgConfidence: number, count: number): number {
  return avgConfidence * (1 + Math.log10(count + 1) / 10);
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

  // Collect separator information from number columns
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

  // Handle case where no thousands separator is detected
  if (Object.keys(thousandsCounts).length === 0) {
    const detectedDecimal =
      Object.keys(decimalCounts).length > 0
        ? Object.entries(decimalCounts).reduce(
            (best, [sep, data]) => {
              const avgConf = data.confidences.reduce((a, b) => a + b, 0) / data.confidences.length;
              const bestAvgConf =
                best.data.confidences.reduce((a, b) => a + b, 0) / best.data.confidences.length;
              return avgConf > bestAvgConf ? { sep, data } : best;
            },
            { sep: '.', data: { confidences: [0] } }
          ).sep
        : '.';
    return {
      format: { thousandsSeparator: '', decimalSeparator: detectedDecimal },
      confidence: 0,
    };
  }

  // Find best thousands separator
  let bestThousands = '';
  let bestThousandsScore = 0;
  const hasNoThousands = thousandsCounts[''] !== undefined;

  Object.entries(thousandsCounts).forEach(([separator, data]) => {
    const avgConfidence = data.confidences.reduce((a, b) => a + b, 0) / data.confidences.length;
    const count = data.count;
    const weightedScore = calculateWeightedScore(avgConfidence, count);

    if (separator === '' && count > 0 && avgConfidence >= 0.5) {
      const boostedScore = weightedScore * 1.2; // Prefer no-thousands if common
      if (boostedScore > bestThousandsScore) {
        bestThousandsScore = boostedScore;
        bestThousands = separator;
      }
    } else if (separator !== '' && weightedScore > bestThousandsScore) {
      if (!hasNoThousands || bestThousandsScore < 0.5) {
        bestThousandsScore = weightedScore;
        bestThousands = separator;
      }
    }
  });

  // Find best decimal separator (must be different from thousands)
  let bestDecimal = '.';
  let bestDecimalScore = 0;

  Object.entries(decimalCounts).forEach(([separator, data]) => {
    if (separator === bestThousands) return;

    const avgConfidence = data.confidences.reduce((a, b) => a + b, 0) / data.confidences.length;
    const count = data.count;
    const weightedScore = calculateWeightedScore(avgConfidence, count);

    if (weightedScore > bestDecimalScore) {
      bestDecimalScore = weightedScore;
      bestDecimal = separator;
    }
  });

  // Default to dot if no decimal separator detected
  if (Object.keys(decimalCounts).length === 0 && Object.keys(thousandsCounts).length > 0) {
    bestDecimal = '.';
  }

  // Ensure separators are different
  if (bestThousands === bestDecimal) {
    bestThousands = '';
    bestDecimal = '.';
  }

  const overallConfidence = (bestThousandsScore + bestDecimalScore) / 2;

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

  // Build per-column date format list
  const perColumnDateFormat: Array<DateFormat | null> = columnAnalyses.map(col =>
    col.type === 'date' && col.detectedFormat ? (col.detectedFormat.format as DateFormat) : null
  );

  return {
    dateFormat: dateFormatResult.format,
    numberFormat: numberFormatResult.format,
    columnTypes: columnAnalyses.map(col => col.type),
    perColumnDateFormat,
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

    if (confidence > COLUMN_TYPE_CONFIDENCE_THRESHOLD) {
      if (detectedType === 'date') {
        const formatFromDetection =
          detectionResult.perColumnDateFormat?.[index] || detectionResult.dateFormat;
        return {
          ...header,
          type: 'date',
          dateFormat: formatFromDetection,
        } as DataHeader;
      }
      return { ...header, type: detectedType } as DataHeader;
    }

    return header;
  });
}
