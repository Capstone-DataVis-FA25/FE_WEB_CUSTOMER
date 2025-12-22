import type { DataHeader } from '@/utils/dataProcessors';
import type { SortLevel, DatasetFilterColumn } from '@/types/chart';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export type ColumnIndexMap = Map<string, number>;

export const buildColumnIndexMap = (headers: DataHeader[] | undefined): ColumnIndexMap => {
  const map = new Map<string, number>();
  (headers || []).forEach((c, idx) => {
    const cid = (c as any).id || (c as any).headerId;
    if (cid) map.set(String(cid), idx);
    if (c.name) map.set(String(c.name), idx);
  });
  return map;
};

const strIncludes = (hay: string, needle: string) =>
  hay.toLowerCase().includes(needle.toLowerCase());

const cmpNumbers = (a: string | undefined, b: string | undefined) => {
  const na = Number.parseFloat(a ?? '');
  const nb = Number.parseFloat(b ?? '');
  return { na, nb, va: Number.isNaN(na) ? null : na, vb: Number.isNaN(nb) ? null : nb };
};

/**
 * Parse a date string using the column's date format, with fallback to ISO format
 */
const parseDate = (s: string | undefined, dateFormat?: string): number => {
  if (!s || s.trim() === '') return NaN;

  // If dateFormat is provided, use dayjs with that format
  if (dateFormat) {
    // Normalize format (e.g., "DD Month YYYY" -> "DD MMMM YYYY")
    const normalizedFormat = dateFormat.replace(/Month/g, 'MMMM');
    const parsed = dayjs(s, normalizedFormat, true);
    if (parsed.isValid()) {
      return parsed.valueOf();
    }
  }

  // Fallback: try ISO format first, then dayjs auto-parse
  const isoParsed = dayjs(s, 'YYYY-MM-DD', true);
  if (isoParsed.isValid()) {
    return isoParsed.valueOf();
  }

  // Last resort: dayjs auto-parse
  const autoParsed = dayjs(s);
  if (autoParsed.isValid()) {
    return autoParsed.valueOf();
  }

  // Try native Date.parse as final fallback
  const nativeParsed = Date.parse(s);
  return Number.isNaN(nativeParsed) ? NaN : nativeParsed;
};

export const applyDatasetFilters = (
  data: string[][] | undefined,
  filters: DatasetFilterColumn[] | undefined,
  colIndex: ColumnIndexMap,
  headers?: DataHeader[]
): string[][] | undefined => {
  if (!data || data.length === 0) return data;
  if (!filters || filters.length === 0) return data;

  // Build a map from column index to header (for date format lookup)
  const headerMap = new Map<number, DataHeader>();
  if (headers) {
    headers.forEach((header, idx) => {
      headerMap.set(idx, header);
    });
  }

  const toComparableString = (value: unknown) => (value == null ? '' : String(value));

  // AND semantics across columns, AND semantics within a column's conditions
  // (OR logic is already covered by equals/not_equals with multiple values)
  const keep = (row: string[]): boolean => {
    for (const col of filters) {
      const idx = colIndex.get(String(col.columnId));
      if (idx == null) continue; // unknown column -> ignore filter
      const value = row[idx] ?? '';
      const valueAsString = toComparableString(value);

      // Get date format from header if available
      const header = headerMap.get(idx);
      const dateFormat = header?.type === 'date' ? header.dateFormat : undefined;

      const passThisColumn = (col.conditions || []).every(cond => {
        const op = cond.operator;
        if (op === 'between' || op === 'between_exclusive') {
          // Legacy operator: treat invalid inputs as "ignore this condition"
          const { va } = cmpNumbers(value, undefined);
          const inclusive = op === 'between';
          if (va != null) {
            const a = Number.parseFloat(String(cond.value ?? ''));
            const b = Number.parseFloat(String(cond.valueEnd ?? ''));
            if (Number.isNaN(a) || Number.isNaN(b)) return true;
            const lo = Math.min(a, b);
            const hi = Math.max(a, b);
            return inclusive ? va >= lo && va <= hi : va > lo && va < hi;
          }
          const tv = parseDate(value, dateFormat);
          const ta = parseDate(String(cond.value ?? ''), dateFormat);
          const tb = parseDate(String(cond.valueEnd ?? ''), dateFormat);
          if (Number.isNaN(tv) || Number.isNaN(ta) || Number.isNaN(tb)) return true;
          const lo = Math.min(ta, tb);
          const hi = Math.max(ta, tb);
          return inclusive ? tv >= lo && tv <= hi : tv > lo && tv < hi;
        }
        switch (op) {
          case 'is_empty': {
            // Check if value is null, undefined, or empty string
            // For all types (text, number, date), empty means: null, undefined, '', or whitespace-only
            const rawValue = row[idx];
            if (rawValue == null) return true;
            const str = String(rawValue).trim();
            return str === '';
          }
          case 'is_not_empty': {
            // Check if value is not null, undefined, or empty string
            // For all types (text, number, date), not empty means: has actual content (even if invalid)
            const rawValue = row[idx];
            if (rawValue == null) return false;
            const str = String(rawValue).trim();
            return str !== '';
          }
          case 'equals': {
            const candidates = Array.isArray(cond.value) ? cond.value : [cond.value];
            if (!candidates || candidates.length === 0) return true;

            // For date columns, compare parsed timestamps instead of strings
            if (header?.type === 'date' && dateFormat) {
              const valueTimestamp = parseDate(value, dateFormat);
              if (!Number.isNaN(valueTimestamp)) {
                return candidates.some(candidate => {
                  const candidateTimestamp = parseDate(String(candidate ?? ''), dateFormat);
                  return !Number.isNaN(candidateTimestamp) && valueTimestamp === candidateTimestamp;
                });
              }
            }

            // For non-date or if date parsing fails, fall back to string comparison
            return candidates.some(candidate => valueAsString === toComparableString(candidate));
          }
          case 'not_equals': {
            const candidates = Array.isArray(cond.value) ? cond.value : [cond.value];
            if (!candidates || candidates.length === 0) return true;

            // For date columns, compare parsed timestamps instead of strings
            if (header?.type === 'date' && dateFormat) {
              const valueTimestamp = parseDate(value, dateFormat);
              if (!Number.isNaN(valueTimestamp)) {
                return !candidates.some(candidate => {
                  const candidateTimestamp = parseDate(String(candidate ?? ''), dateFormat);
                  return !Number.isNaN(candidateTimestamp) && valueTimestamp === candidateTimestamp;
                });
              }
            }

            // For non-date or if date parsing fails, fall back to string comparison
            return !candidates.some(candidate => valueAsString === toComparableString(candidate));
          }
          case 'contains':
            return strIncludes(valueAsString, toComparableString(cond.value ?? ''));
          case 'not_contains':
            return !strIncludes(valueAsString, toComparableString(cond.value ?? ''));
          case 'starts_with':
            return valueAsString
              .toLowerCase()
              .startsWith(toComparableString(cond.value ?? '').toLowerCase());
          case 'ends_with':
            return valueAsString
              .toLowerCase()
              .endsWith(toComparableString(cond.value ?? '').toLowerCase());
          case 'greater_than':
          case 'greater_or_equal': {
            const { va } = cmpNumbers(value, undefined);
            const vb = Number.parseFloat(String(cond.value ?? ''));
            if (va != null && !Number.isNaN(vb)) {
              return op === 'greater_than' ? va > vb : va >= vb;
            }
            const tv = parseDate(value, dateFormat);
            const ta = parseDate(String(cond.value ?? ''), dateFormat);
            if (!Number.isNaN(tv) && !Number.isNaN(ta)) {
              return op === 'greater_than' ? tv > ta : tv >= ta;
            }
            // Invalid compare value → ignore this condition
            return true;
          }
          case 'less_than':
          case 'less_or_equal': {
            const { va } = cmpNumbers(value, undefined);
            const vb = Number.parseFloat(String(cond.value ?? ''));
            if (va != null && !Number.isNaN(vb)) {
              return op === 'less_than' ? va < vb : va <= vb;
            }
            const tv = parseDate(value, dateFormat);
            const ta = parseDate(String(cond.value ?? ''), dateFormat);
            if (!Number.isNaN(tv) && !Number.isNaN(ta)) {
              return op === 'less_than' ? tv < ta : tv <= ta;
            }
            // Invalid compare value → ignore this condition
            return true;
          }
          case 'after': {
            const tv = parseDate(value, dateFormat);
            const ta = parseDate(String(cond.value ?? ''), dateFormat);
            if (!Number.isNaN(tv) && !Number.isNaN(ta)) {
              return tv > ta;
            }
            return true;
          }
          case 'before': {
            const tv = parseDate(value, dateFormat);
            const ta = parseDate(String(cond.value ?? ''), dateFormat);
            if (!Number.isNaN(tv) && !Number.isNaN(ta)) {
              return tv < ta;
            }
            return true;
          }
          default:
            return true; // unknown operator -> ignore
        }
      });
      if (!passThisColumn) return false;
    }
    return true;
  };

  return data.filter(keep);
};

export const applyMultiLevelSort = (
  data: string[][] | undefined,
  levels: SortLevel[] | undefined,
  colIndex: ColumnIndexMap
): string[][] | undefined => {
  if (!data || data.length === 0) return data;
  if (!levels || levels.length === 0) return data;

  const copy = [...data];
  const lvls = [...levels];

  copy.sort((a, b) => {
    for (let i = 0; i < lvls.length; i++) {
      const lvl = lvls[i];
      const colIdx = colIndex.get(String(lvl.columnId));
      if (colIdx == null) continue;
      const va = a[colIdx] ?? '';
      const vb = b[colIdx] ?? '';
      if (va === vb) continue;
      const dir = lvl.direction === 'desc' ? -1 : 1;
      const cmp = String(va).localeCompare(String(vb), undefined, {
        numeric: true,
        sensitivity: 'base',
      });
      if (cmp !== 0) return cmp * dir;
    }
    return 0;
  });

  return copy;
};
