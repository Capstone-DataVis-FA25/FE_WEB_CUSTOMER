export type SimpleColumnType = 'text' | 'number' | 'date';
export type DateGranularity = 'year' | 'year_month' | 'date' | 'datetime';
export type NumberFormat = { thousandsSeparator: string; decimalSeparator: string };

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const humanizeOperator = (op: string): string => op.replace(/_/g, ' ');

export const getOperatorsForType = (type: SimpleColumnType): { value: string; label: string }[] => {
  switch (type) {
    case 'text':
      return [
        { value: 'equals', label: 'equals' },
        { value: 'contains', label: 'contains' },
        { value: 'not_contains', label: 'not contains' },
        { value: 'starts_with', label: 'starts with' },
        { value: 'ends_with', label: 'ends with' },
      ];
    case 'number':
      return [
        { value: 'equals', label: 'equals' },
        { value: 'greater_than', label: 'greater than' },
        { value: 'less_than', label: 'less than' },
        { value: 'between', label: 'between' },
      ];
    case 'date':
      return [
        { value: 'equals', label: 'equals' },
        { value: 'greater_than', label: 'greater than' },
        { value: 'less_than', label: 'less than' },
        { value: 'between', label: 'between' },
      ];
  }
};

// Validate a number condition: required, numeric, and range order for 'between'
export const validateNumberCondition = (
  operator: string,
  value: string | number | null | undefined,
  valueEnd?: string | number | null | undefined
): string | null => {
  const isEmpty = (x: any) => x === null || x === undefined || x === '';
  const toNum = (x: any) => (typeof x === 'number' ? x : Number(x));
  if (operator === 'between') {
    if (isEmpty(value) || isEmpty(valueEnd)) return 'Both values are required.';
    const a = toNum(value);
    const b = toNum(valueEnd);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return 'Values must be valid numbers.';
    if (a > b) return 'Start must be less than or equal to end.';
    return null;
  }
  if (isEmpty(value)) return 'Value is required.';
  const a = toNum(value);
  if (!Number.isFinite(a)) return 'Value must be a valid number.';
  return null;
};

// Validate a text condition: required non-empty value
export const validateTextCondition = (
  operator: string,
  value: string | number | null | undefined
): string | null => {
  const isEmpty = (x: any) => x === null || x === undefined || x === '';
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
  try {
    // Defer to existing formatter in dataProcessors
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { formatNumberString } = require('@/utils/dataProcessors');
    return formatNumberString(String(value), nf);
  } catch {
    return String(value);
  }
};

// Validate a single date condition. Returns an error message string or null if valid.
export const validateDateCondition = (
  g: DateGranularity,
  operator: string,
  value: string | number | null | undefined,
  valueEnd?: string | number | null | undefined
): string | null => {
  const isEmpty = (x: any) => x === null || x === undefined || x === '';
  if (operator === 'between') {
    if (isEmpty(value) || isEmpty(valueEnd)) return 'Both values are required.';
  } else {
    if (isEmpty(value)) return 'Value is required.';
  }
  if (g === 'year') {
    const a = Number(value);
    if (!Number.isFinite(a) || a < 0) return 'Year must be a non-negative number.';
    if (operator === 'between') {
      const b = Number(valueEnd);
      if (!Number.isFinite(b) || b < 0) return 'Year must be a non-negative number.';
      if (a > b) return 'Start year must be before or equal to end year.';
    }
    return null;
  }
  if (operator === 'between' && typeof value === 'string' && typeof valueEnd === 'string') {
    const toTime = (s: string) => {
      if (g === 'year_month') return new Date(`${s}-01`).getTime();
      if (g === 'date' || g === 'datetime') return new Date(s).getTime();
      return NaN;
    };
    const a = toTime(value);
    const b = toTime(valueEnd);
    if (!Number.isFinite(a) || !Number.isFinite(b) || a > b)
      return 'Start must be before or equal to end.';
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
      // Use our shared helper to format
      // Lazy import to avoid heavier deps at top-level bundle
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { formatDateUsingDayjs } = require('@/utils/dateFormat');
      return formatDateUsingDayjs(s, toPattern(fmt));
    } catch {
      // Fallback to plain string if helper not available in this context
      return s.replace('T', ' ');
    }
  }

  if (g === 'datetime') return s.replace('T', ' ');
  return s;
};
