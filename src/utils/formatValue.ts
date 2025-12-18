/**
 * Comprehensive value formatting utilities for charts
 * Supports multiple formatter types with validation and fallback
 */

export type FormatterType =
  | 'none'
  | 'number'
  | 'currency'
  | 'percentage'
  | 'decimal'
  | 'scientific'
  | 'bytes'
  | 'duration'
  | 'date'
  | 'compact'
  | 'ordinal'
  | 'custom';

export interface FormatterConfig {
  type: FormatterType;
  customFormat?: string; // For custom type
  currencySymbol?: string; // For currency type (e.g., $, €, £, ¥)
  decimalPlaces?: number; // For decimal/percentage types
  locale?: string; // Locale for number formatting (e.g., en-US, de-DE, fr-FR)
  useGrouping?: boolean; // Whether to use thousands separator (default: true, set false for years)
  currencyStyle?: 'symbol' | 'code' | 'name'; // $1,234 | USD 1,234 | 1,234 US dollars
  numberNotation?: 'standard' | 'compact' | 'scientific' | 'engineering';
  dateFormat?:
    | 'auto'
    | 'numeric'
    | 'short'
    | 'medium'
    | 'long'
    | 'full'
    | 'relative'
    | 'year-only'
    | 'month-year'
    | 'iso';
  // auto (smart), numeric (1/15), short (Jan 15), medium (Jan 15, '25), long (Jan 15, 2025),
  // full (Monday, January 15, 2025), relative (2 days ago), year-only (2025), month-year (Jan '25), iso (2025-01-15)
  durationFormat?: 'short' | 'narrow' | 'long'; // 1h 23m | 1h23m | 1 hour 23 minutes
}

/**
 * Get symbol/prefix for formatter type
 */
export function getFormatterSymbol(type: FormatterType): string {
  switch (type) {
    case 'none':
      return '';
    case 'number':
      return '#';
    case 'currency':
      return '$';
    case 'percentage':
      return '%';
    case 'decimal':
      return '.00';
    case 'scientific':
      return 'E';
    case 'bytes':
      return 'B';
    case 'duration':
      return '⏱';
    case 'date':
      return '📅';
    case 'compact':
      return 'K/M/B';
    case 'ordinal':
      return '1st';
    case 'custom':
      return '✏️';
    default:
      return '';
  }
}

/**
 * Get human-readable label for formatter type
 */
export function getFormatterLabel(type: FormatterType): string {
  switch (type) {
    case 'none':
      return 'None (Raw Value)';
    case 'number':
      return 'Number';
    case 'currency':
      return 'Currency';
    case 'percentage':
      return 'Percentage';
    case 'decimal':
      return 'Decimal';
    case 'scientific':
      return 'Scientific Notation';
    case 'bytes':
      return 'Bytes (File Size)';
    case 'duration':
      return 'Duration (Time)';
    case 'date':
      return 'Date';
    case 'compact':
      return 'Compact (K/M/B)';
    case 'ordinal':
      return 'Ordinal (1st, 2nd, 3rd)';
    case 'custom':
      return 'Custom Format';
    default:
      return 'None';
  }
}

/**
 * Get description for formatter type
 */
export function getFormatterDescription(type: FormatterType): string {
  switch (type) {
    case 'none':
      return 'No formatting - displays raw numbers (e.g., 1234.56)';
    case 'number':
      return 'Adds thousand separators for readability (e.g., 1,234)';
    case 'currency':
      return 'Displays as currency with symbol (e.g., $1,234.56 or €1.234,56)';
    case 'percentage':
      return 'Displays as percentage with % symbol (e.g., 45.6%)';
    case 'decimal':
      return 'Fixed decimal places for precision (e.g., 1234.56)';
    case 'scientific':
      return 'Scientific notation for very large/small numbers (e.g., 1.23e+4)';
    case 'bytes':
      return 'File size format with units (e.g., 1.2 KB, 45.3 MB, 2.1 GB)';
    case 'duration':
      return 'Time duration in human-readable format (e.g., 1h 23m 45s)';
    case 'date':
      return 'Date format - choose compact formats (numeric, year-only) for large datasets (200+ records)';
    case 'compact':
      return 'Compact numbers with K/M/B suffixes (e.g., 1.2K, 45.3M, 2.1B)';
    case 'ordinal':
      return 'Ordinal numbers with suffix (e.g., 1st, 2nd, 3rd, 21st)';
    case 'custom':
      return 'Create your own format using placeholders like {value}, {round}, {fixed2}';
    default:
      return 'No formatting applied';
  }
}

/**
 * Format currency value with sub-options
 */
export function formatCurrency(
  value: number,
  symbol: string = '$',
  locale: string = 'en-US',
  style: 'symbol' | 'code' | 'name' = 'symbol',
  compact: boolean = true
): string {
  try {
    // Handle large numbers with K/M/B abbreviations (if compact enabled)
    if (compact) {
      const absValue = Math.abs(value);
      if (absValue >= 1_000_000_000) {
        return `${symbol}${(value / 1_000_000_000).toFixed(2)}B`;
      }
      if (absValue >= 1_000_000) {
        return `${symbol}${(value / 1_000_000).toFixed(2)}M`;
      }
      if (absValue >= 1_000) {
        return `${symbol}${(value / 1_000).toFixed(2)}K`;
      }
    }

    // Different currency display styles
    if (style === 'symbol') {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
        .format(value)
        .replace(/[A-Z]{3}/, symbol);
    } else if (style === 'code') {
      // USD 1,234.56
      const formatted = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
      return `USD ${formatted}`;
    } else {
      // 1,234.56 US dollars
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
        currencyDisplay: 'name',
      }).format(value);
    }
  } catch {
    return `${symbol}${value.toFixed(2)}`;
  }
}

/**
 * Format percentage value
 */
export function formatPercentage(value: number, decimalPlaces: number = 1): string {
  return `${value.toFixed(decimalPlaces)}%`;
}

/**
 * Format number with thousand separators and notation options
 */
export function formatNumber(
  value: number,
  locale: string = 'en-US',
  notation: 'standard' | 'compact' | 'scientific' | 'engineering' = 'standard',
  useGrouping: boolean = true
): string {
  try {
    // For standard notation with auto K/M/B for large numbers
    if (notation === 'standard') {
      const absValue = Math.abs(value);

      // Only apply K/M/B shorthand if grouping is enabled and value is large enough
      if (useGrouping) {
        if (absValue >= 1_000_000_000) {
          return `${(value / 1_000_000_000).toFixed(2)}B`;
        }
        if (absValue >= 1_000_000) {
          return `${(value / 1_000_000).toFixed(2)}M`;
        }
        if (absValue >= 10_000) {
          return `${(value / 1_000).toFixed(1)}K`;
        }
      }

      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        useGrouping: useGrouping, // Control thousands separator
      }).format(value);
    }

    // Use Intl.NumberFormat with notation
    return new Intl.NumberFormat(locale, {
      notation: notation,
      compactDisplay: 'short',
      maximumFractionDigits: 2,
      useGrouping: useGrouping,
    } as any).format(value);
  } catch {
    return value.toString();
  }
}

/**
 * Format decimal with fixed decimal places
 */
export function formatDecimal(value: number, decimalPlaces: number = 2): string {
  return value.toFixed(decimalPlaces);
}

/**
 * Format in scientific notation
 */
export function formatScientific(value: number, precision: number = 2): string {
  return value.toExponential(precision);
}

/**
 * Format bytes (file size)
 */
export function formatBytes(value: number): string {
  if (value === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(Math.abs(value)) / Math.log(k));
  const formattedValue = (value / Math.pow(k, i)).toFixed(2);

  return `${formattedValue} ${sizes[i]}`;
}

/**
 * Format duration (seconds to human-readable) with format options
 */
export function formatDuration(
  value: number,
  format: 'short' | 'narrow' | 'long' = 'short'
): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  const days = Math.floor(absValue / 86400);
  const hours = Math.floor((absValue % 86400) / 3600);
  const minutes = Math.floor((absValue % 3600) / 60);
  const seconds = Math.floor(absValue % 60);

  if (format === 'long') {
    // 1 day 2 hours 3 minutes 4 seconds
    const parts: string[] = [];
    if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
    if (seconds > 0 && parts.length < 2) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
    return sign + (parts.length > 0 ? parts.join(' ') : '0 seconds');
  }

  if (format === 'narrow') {
    // 1d2h3m4s (no spaces)
    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 && parts.length < 3) parts.push(`${seconds}s`);
    return sign + (parts.length > 0 ? parts.join('') : '0s');
  }

  // Short format (default): 1d 2h 3m
  if (absValue < 60) {
    return `${sign}${seconds}s`;
  }
  if (absValue < 3600) {
    return seconds > 0 ? `${sign}${minutes}m ${seconds}s` : `${sign}${minutes}m`;
  }
  if (absValue < 86400) {
    return minutes > 0 ? `${sign}${hours}h ${minutes}m` : `${sign}${hours}h`;
  }
  return hours > 0 ? `${sign}${days}d ${hours}h` : `${sign}${days}d`;
}

/**
 * Format date value with multiple format options
 * Enhanced with ultra-compact formats for large datasets (200+ records)
 */
export function formatDate(
  value: number | string | Date,
  format:
    | 'auto'
    | 'numeric'
    | 'short'
    | 'medium'
    | 'long'
    | 'full'
    | 'relative'
    | 'year-only'
    | 'month-year'
    | 'iso' = 'short',
  locale: string = 'en-US'
): string {
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return String(value);
    }

    // Auto format: intelligently pick format based on data density
    if (format === 'auto') {
      // For x-axis with many points, use most compact format
      // This will be overridden by user preference in most cases
      format = 'numeric'; // Default to most compact
    }

    // Ultra-compact formats for large datasets
    if (format === 'numeric') {
      // Numeric format: 1/15 or 1/15/25 (shortest possible)
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}/${day}`; // Ultra compact for axis labels
    }

    if (format === 'year-only') {
      // Year only: 2025 (useful for yearly data)
      return date.getFullYear().toString();
    }

    if (format === 'month-year') {
      // Month-Year: Jan '25 (compact month-year format)
      const monthShort = date.toLocaleDateString(locale, { month: 'short' });
      const year = date.getFullYear() % 100;
      return `${monthShort} '${year.toString().padStart(2, '0')}`;
    }

    if (format === 'iso') {
      // ISO format: 2025-01-15 (international standard)
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    if (format === 'relative') {
      // Relative time format (e.g., "2 days ago", "in 3 hours")
      const now = new Date();
      const diffMs = date.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (Math.abs(diffDays) >= 1) {
        return diffDays > 0 ? `in ${diffDays} days` : `${Math.abs(diffDays)} days ago`;
      }
      if (Math.abs(diffHours) >= 1) {
        return diffHours > 0 ? `in ${diffHours} hours` : `${Math.abs(diffHours)} hours ago`;
      }
      if (Math.abs(diffMinutes) >= 1) {
        return diffMinutes > 0 ? `in ${diffMinutes} min` : `${Math.abs(diffMinutes)} min ago`;
      }
      return 'just now';
    }

    // Standard format options
    const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
      short: { month: 'short', day: 'numeric' }, // Jan 15
      medium: { month: 'short', day: 'numeric', year: '2-digit' }, // Jan 15, '25 (2-digit year for compactness)
      long: { month: 'short', day: 'numeric', year: 'numeric' }, // Jan 15, 2025
      full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }, // Monday, January 15, 2025
    };

    return date.toLocaleDateString(locale, formatOptions[format]);
  } catch {
    return String(value);
  }
}

/**
 * Format as compact notation (K/M/B)
 * Always uses K/M/B suffixes regardless of size
 */
export function formatCompact(value: number, decimalPlaces: number = 1): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1_000_000_000) {
    return `${sign}${(absValue / 1_000_000_000).toFixed(decimalPlaces)}B`;
  }
  if (absValue >= 1_000_000) {
    return `${sign}${(absValue / 1_000_000).toFixed(decimalPlaces)}M`;
  }
  if (absValue >= 1_000) {
    return `${sign}${(absValue / 1_000).toFixed(decimalPlaces)}K`;
  }

  return value.toString();
}

/**
 * Format as ordinal number (1st, 2nd, 3rd, etc.)
 */
export function formatOrdinal(value: number): string {
  const num = Math.round(value);
  const absNum = Math.abs(num);

  // Handle special cases for 11th, 12th, 13th
  if (absNum % 100 >= 11 && absNum % 100 <= 13) {
    return `${num}th`;
  }

  // Handle other cases
  const lastDigit = absNum % 10;
  switch (lastDigit) {
    case 1:
      return `${num}st`;
    case 2:
      return `${num}nd`;
    case 3:
      return `${num}rd`;
    default:
      return `${num}th`;
  }
}

/**
 * Apply custom format string
 * Supports placeholders: {value}, {round}, {abs}, {sign}
 */
export function formatCustom(value: number, formatString: string): string {
  try {
    let result = formatString;

    // Replace placeholders
    result = result.replace('{value}', value.toString());
    result = result.replace('{round}', Math.round(value).toString());
    result = result.replace('{abs}', Math.abs(value).toString());
    result = result.replace('{sign}', value >= 0 ? '+' : '-');
    result = result.replace('{fixed1}', value.toFixed(1));
    result = result.replace('{fixed2}', value.toFixed(2));
    result = result.replace('{fixed3}', value.toFixed(3));

    return result;
  } catch {
    return value.toString();
  }
}

/**
 * Main formatter function - applies formatting based on config
 */
export function formatValue(value: number | string, config?: FormatterConfig): string {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return '';
  }

  // Handle non-numeric values
  if (typeof value === 'string') {
    // Return empty string for empty strings
    if (value.trim() === '') {
      return '';
    }

    // Try to parse as number
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return value; // Return as-is if not a number
    }
    value = numValue;
  }

  // Check if the numeric value is NaN
  if (typeof value === 'number' && isNaN(value)) {
    return '';
  }

  // No config means no formatting
  if (!config || config.type === 'none') {
    return typeof value === 'number' ? value.toString() : String(value);
  }

  const numValue = value as number;

  switch (config.type) {
    case 'number':
      return formatNumber(
        numValue,
        config.locale,
        config.numberNotation,
        config.useGrouping !== false // Default to true
      );

    case 'currency':
      return formatCurrency(
        numValue,
        config.currencySymbol,
        config.locale,
        config.currencyStyle,
        true // compact enabled by default
      );

    case 'percentage':
      return formatPercentage(numValue, config.decimalPlaces);

    case 'decimal':
      return formatDecimal(numValue, config.decimalPlaces);

    case 'scientific':
      return formatScientific(numValue, config.decimalPlaces);

    case 'bytes':
      return formatBytes(numValue);

    case 'duration':
      return formatDuration(numValue, config.durationFormat);

    case 'date':
      return formatDate(numValue, config.dateFormat, config.locale);

    case 'compact':
      return formatCompact(numValue, config.decimalPlaces);

    case 'ordinal':
      return formatOrdinal(numValue);

    case 'custom':
      return formatCustom(numValue, config.customFormat || '{value}');

    default:
      return numValue.toString();
  }
}

/**
 * Create a formatter function from config (for use in chart props)
 */
export function createFormatter(config?: FormatterConfig): (value: number) => string {
  return (value: number) => formatValue(value, config);
}

/**
 * Validate custom format string
 */
export function validateCustomFormat(formatString: string): { valid: boolean; error?: string } {
  if (!formatString || formatString.trim() === '') {
    return { valid: false, error: 'Format string cannot be empty' };
  }

  // Check if it contains at least one placeholder
  const hasPlaceholder =
    formatString.includes('{value}') ||
    formatString.includes('{round}') ||
    formatString.includes('{abs}') ||
    formatString.includes('{sign}') ||
    formatString.includes('{fixed1}') ||
    formatString.includes('{fixed2}') ||
    formatString.includes('{fixed3}');

  if (!hasPlaceholder) {
    return {
      valid: false,
      error:
        'Format string must contain at least one placeholder: {value}, {round}, {abs}, {sign}, {fixed1}, {fixed2}, {fixed3}',
    };
  }

  return { valid: true };
}

/**
 * Get example output for formatter type
 */
export function getFormatterExample(type: FormatterType, sampleValue: number = 1234.56): string {
  const config: FormatterConfig = {
    type,
    currencySymbol: '$',
    decimalPlaces: 2,
  };

  return formatValue(sampleValue, config);
}

/**
 * Auto-detect appropriate formatter type based on data column type
 * Maps dataset column types to suitable formatter types
 * @param dataType - Column type from dataset ('text' | 'number' | 'date')
 * @returns Appropriate FormatterType for the data
 */
export function getFormatterTypeFromDataType(dataType: 'text' | 'number' | 'date'): FormatterType {
  switch (dataType) {
    case 'number':
      return 'number'; // Default to number formatter for numeric columns
    case 'date':
      return 'date'; // Use date formatter for date columns
    case 'text':
    default:
      return 'none'; // No formatting for text columns
  }
}

/**
 * Detect if numeric data represents years (like 2020, 2021, 2024)
 * @param data - Array of numeric values to check
 * @returns true if data appears to be years
 */
export function isYearData(data: (number | string | null | undefined)[]): boolean {
  if (!data || data.length === 0) return false;

  // Filter valid numbers
  const numbers = data
    .filter(v => v !== null && v !== undefined && v !== '')
    .map(v => (typeof v === 'string' ? parseFloat(v) : v))
    .filter(n => !isNaN(n as number)) as number[];

  if (numbers.length === 0) return false;

  // Check if most values are in year range (1900-2100) and are integers
  const yearLikeCount = numbers.filter(n => {
    return Number.isInteger(n) && n >= 1900 && n <= 2100;
  }).length;

  // If at least 70% of values look like years, consider it year data
  return yearLikeCount / numbers.length >= 0.7;
}

/**
 * Get appropriate number notation based on data characteristics
 * @param data - Sample data to analyze
 * @returns Suitable number notation ('standard' | 'compact' | 'scientific' | 'engineering')
 */
export function detectNumberNotation(
  data: (number | string | null | undefined)[]
): 'standard' | 'compact' | 'scientific' | 'engineering' {
  // If data looks like years, use grouping: false style (no thousands separator)
  if (isYearData(data)) {
    return 'standard'; // Will be handled specially to disable grouping
  }

  // For other numeric data, use standard with grouping
  return 'standard';
}
