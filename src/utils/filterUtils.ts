import { formatDateUsingDayjs } from '@/utils/dateFormat';
import { formatNumberString } from '@/utils/dataProcessors';

export type SimpleColumnType = 'text' | 'number' | 'date';
export type DateGranularity = 'year' | 'year_month' | 'date' | 'datetime';
export type NumberFormat = { thousandsSeparator: string; decimalSeparator: string };
type FilterValueInput = string | number | null | undefined | (string | number | null | undefined)[];

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const humanizeOperator = (op: string): string => op.replace(/_/g, ' ');

export const getOperatorsForType = (type: SimpleColumnType): { value: string; label: string }[] => {
  switch (type) {
    case 'text':
      return [
        { value: 'contains', label: 'contains' },
        { value: 'not_contains', label: 'not contains' },
        { value: 'equals', label: 'equals' },
        { value: 'not_equals', label: 'not equals' },
        { value: 'starts_with', label: 'starts with' },
        { value: 'ends_with', label: 'ends with' },
        { value: 'is_empty', label: 'is empty' },
        { value: 'is_not_empty', label: 'is not empty' },
      ];
    case 'number':
      return [
        { value: 'greater_than', label: 'greater than' },
        { value: 'greater_or_equal', label: 'greater or equal' },
        { value: 'less_than', label: 'less than' },
        { value: 'less_or_equal', label: 'less or equal' },
        { value: 'equals', label: 'equals' },
        { value: 'not_equals', label: 'not equals' },
        { value: 'is_empty', label: 'is empty' },
        { value: 'is_not_empty', label: 'is not empty' },
      ];
    case 'date':
      return [
        { value: 'greater_than', label: 'after' },
        { value: 'greater_or_equal', label: 'on or after' },
        { value: 'less_than', label: 'before' },
        { value: 'less_or_equal', label: 'on or before' },
        { value: 'equals', label: 'equals' },
        { value: 'not_equals', label: 'not equals' },
        { value: 'is_empty', label: 'is empty' },
        { value: 'is_not_empty', label: 'is not empty' },
      ];
  }
};

// Validate a number condition: required, numeric, and range order for 'between'
export const validateNumberCondition = (
  operator: string,
  value: FilterValueInput,
  valueEnd?: string | number | null | undefined,
  includeStart?: boolean,
  includeEnd?: boolean
): string | null => {
  const isEmpty = (x: any) => x === null || x === undefined || x === '';
  const toNum = (x: any) => (typeof x === 'number' ? x : Number(x));
  // is_empty and is_not_empty don't require a value
  if (operator === 'is_empty' || operator === 'is_not_empty') {
    return null;
  }
  if (operator === 'equals' || operator === 'not_equals') {
    if (Array.isArray(value)) {
      return value.length === 0 ? 'Select at least one value.' : null;
    }
  }
  const isRange = operator === 'between' || operator === 'between_exclusive';
  if (isRange) {
    if (isEmpty(value) || isEmpty(valueEnd)) return 'Both values are required.';
    const a = toNum(value);
    const b = toNum(valueEnd);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return 'Values must be valid numbers.';
    const defaultIncludeStart = operator === 'between';
    const defaultIncludeEnd = operator === 'between';
    const leftInclusive = includeStart ?? defaultIncludeStart;
    const rightInclusive = includeEnd ?? defaultIncludeEnd;
    const allowEqual = leftInclusive && rightInclusive;
    if (allowEqual ? a > b : a >= b)
      return allowEqual
        ? 'Start must be less than or equal to end.'
        : 'Start must be less than end.';
    return null;
  }
  if (isEmpty(value)) return 'Value is required.';
  const a = toNum(value);
  if (!Number.isFinite(a)) return 'Value must be a valid number.';
  return null;
};

// Validate a text condition: required non-empty value
export const validateTextCondition = (operator: string, value: FilterValueInput): string | null => {
  const isEmpty = (x: any) => x === null || x === undefined || x === '';
  // is_empty and is_not_empty don't require a value
  if (operator === 'is_empty' || operator === 'is_not_empty') {
    return null;
  }
  if (operator === 'equals' || operator === 'not_equals') {
    if (Array.isArray(value)) {
      return value.length === 0 ? 'Select at least one value.' : null;
    }
  }
  if (isEmpty(value)) return 'Value is required.';
  return null;
};

// Normalize a localized numeric input string to canonical form with '.' as decimal and no thousands
export const normalizeNumberInput = (raw: string, nf?: NumberFormat): string => {
  if (raw == null) return '';
  const s = String(raw);
  if (!nf) return s.replace(/\s+/g, '');
  const t = nf.thousandsSeparator || '';
  const d = nf.decimalSeparator || '.';
  let cleaned = s.replace(new RegExp(`\\${t}`, 'g'), '');
  if (d !== '.') cleaned = cleaned.replace(new RegExp(`\\${d}`, 'g'), '.');
  return cleaned.replace(/\s+/g, '');
};

// Format a numeric string/number using NumberFormat separators for display
export const formatNumberDisplay = (
  value: string | number | null | undefined,
  nf?: NumberFormat
): string => {
  if (value == null || value === '') return '';
  if (!nf) return String(value);
  return formatNumberString(String(value), nf);
};

// Validate a single date condition. Returns an error message string or null if valid.
export const validateDateCondition = (
  g: DateGranularity,
  operator: string,
  value: FilterValueInput,
  valueEnd?: string | number | null | undefined,
  includeStart?: boolean,
  includeEnd?: boolean
): string | null => {
  const isEmpty = (x: any) => x === null || x === undefined || x === '';
  // is_empty and is_not_empty don't require a value
  if (operator === 'is_empty' || operator === 'is_not_empty') {
    return null;
  }
  if (operator === 'equals' || operator === 'not_equals') {
    if (Array.isArray(value)) {
      return value.length === 0 ? 'Select at least one value.' : null;
    }
  }
  const isRange = operator === 'between' || operator === 'between_exclusive';
  if (isRange) {
    if (isEmpty(value) || isEmpty(valueEnd)) return 'Both values are required.';
  } else {
    if (isEmpty(value)) return 'Value is required.';
  }
  if (g === 'year') {
    const a = Number(value);
    if (!Number.isFinite(a) || a < 0) return 'Year must be a non-negative number.';
    if (isRange) {
      const b = Number(valueEnd);
      if (!Number.isFinite(b) || b < 0) return 'Year must be a non-negative number.';
      const defaultIncludeStart = operator === 'between';
      const defaultIncludeEnd = operator === 'between';
      const leftInclusive = includeStart ?? defaultIncludeStart;
      const rightInclusive = includeEnd ?? defaultIncludeEnd;
      const allowEqual = leftInclusive && rightInclusive;
      if (allowEqual ? a > b : a >= b)
        return allowEqual
          ? 'Start year must be before or equal to end year.'
          : 'Start year must be before end year.';
    }
    return null;
  }
  if (isRange && typeof value === 'string' && typeof valueEnd === 'string') {
    const toTime = (s: string) => {
      if (g === 'year_month') return new Date(`${s}-01`).getTime();
      if (g === 'date' || g === 'datetime') return new Date(s).getTime();
      return NaN;
    };
    const a = toTime(value);
    const b = toTime(valueEnd);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return 'Start must be before end.';
    const defaultIncludeStart = operator === 'between';
    const defaultIncludeEnd = operator === 'between';
    const leftInclusive = includeStart ?? defaultIncludeStart;
    const rightInclusive = includeEnd ?? defaultIncludeEnd;
    const allowEqual = leftInclusive && rightInclusive;
    if (allowEqual ? a > b : a >= b)
      return allowEqual ? 'Start must be before or equal to end.' : 'Start must be before end.';
  }
  return null;
};

export const getOperatorLabelLower = (type: SimpleColumnType, operator: string): string => {
  const ops = getOperatorsForType(type);
  return ops.find(o => o.value === operator)?.label || humanizeOperator(operator);
};

export const getGranularityFromFormat = (fmt?: string): DateGranularity => {
  if (!fmt) return 'date';
  // Work with the original tokens (our DateFormat union uses uppercase tokens)
  const f = String(fmt);

  // Known explicit formats mapping
  const known: Record<string, DateGranularity> = {
    YYYY: 'year',
    'YYYY-MM': 'year_month',
    'YY-MM': 'year_month',
    'MM/YY': 'year_month',
    'MM/YYYY': 'year_month',
    'DD Month YYYY': 'date',
    'YYYY-MM-DD': 'date',
    'DD/MM/YYYY': 'date',
    'MM/DD/YYYY': 'date',
    'YYYY/MM/DD': 'date',
    'DD-MM-YYYY': 'date',
    'MM-DD-YYYY': 'date',
    'YYYY-MM-DD HH:mm:ss': 'datetime',
    'YYYY-MM-DDTHH:mm:ss': 'datetime',
  };
  if (known[f as keyof typeof known]) return known[f as keyof typeof known];

  // Fallback heuristics using safe token checks (avoid matching letters inside words like 'Month')
  const hasColon = f.includes(':');
  const hasHH = /H{1,2}/.test(f);
  const hasDayToken = /D{1,2}/.test(f);
  const hasMonthToken = /M{1,2}/.test(f) || f.includes('Month');
  const hasYearToken = /Y{2,4}/.test(f);

  if (hasHH || hasColon) return 'datetime';
  if (hasDayToken) return 'date';
  if (hasYearToken && hasMonthToken) return 'year_month';
  return 'year';
};

export const formatDateDisplay = (
  g: DateGranularity,
  v?: string | number | null,
  fmt?: string
): string => {
  if (v == null || v === '') return '?';
  const s = String(v);

  // If explicit format provided, format using dayjs helper
  if (fmt) {
    // Map non-dayjs token to a valid one
    const toPattern = (f: string) => (f === 'DD Month YYYY' ? 'DD MMMM YYYY' : f);
    try {
      console.log('[formatDateDisplay] formatting via dayjs', {
        value: s,
        fmt: toPattern(fmt),
      });
      return formatDateUsingDayjs(s, toPattern(fmt));
    } catch (err) {
      console.warn('[formatDateDisplay] failed to format with dayjs', {
        value: s,
        fmt,
        error: err,
      });
      return s.replace('T', ' ');
    }
  }

  if (g === 'datetime') return s.replace('T', ' ');
  return s;
};
