import type { DataHeader } from '@/utils/dataProcessors';
import type { SortLevel, DatasetFilterColumn } from '@/types/chart';

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

const parseDate = (s: string | undefined) => {
  if (!s) return NaN;
  const t = Date.parse(s);
  return Number.isNaN(t) ? NaN : t;
};

export const applyDatasetFilters = (
  data: string[][] | undefined,
  filters: DatasetFilterColumn[] | undefined,
  colIndex: ColumnIndexMap
): string[][] | undefined => {
  if (!data || data.length === 0) return data;
  if (!filters || filters.length === 0) return data;

  const toComparableString = (value: unknown) => (value == null ? '' : String(value));

  // AND semantics across columns, OR semantics within a column's conditions
  const keep = (row: string[]): boolean => {
    for (const col of filters) {
      const idx = colIndex.get(String(col.columnId));
      if (idx == null) continue; // unknown column -> ignore filter
      const value = row[idx] ?? '';
      const valueAsString = toComparableString(value);
      const passThisColumn = (col.conditions || []).some(cond => {
        const op = cond.operator;
        if (op === 'between') {
          // numeric or date range; try number first then date
          const { va } = cmpNumbers(value, undefined);
          if (va != null) {
            const a = Number.parseFloat(String(cond.value ?? ''));
            const b = Number.parseFloat(String(cond.valueEnd ?? ''));
            if (Number.isNaN(a) || Number.isNaN(b)) return false;
            const lo = Math.min(a, b);
            const hi = Math.max(a, b);
            return va >= lo && va <= hi;
          }
          const tv = parseDate(value);
          const ta = parseDate(String(cond.value ?? ''));
          const tb = parseDate(String(cond.valueEnd ?? ''));
          if (Number.isNaN(tv) || Number.isNaN(ta) || Number.isNaN(tb)) return false;
          const lo = Math.min(ta, tb);
          const hi = Math.max(ta, tb);
          return tv >= lo && tv <= hi;
        }
        switch (op) {
          case 'equals': {
            const candidates = Array.isArray(cond.value) ? cond.value : [cond.value];
            if (!candidates || candidates.length === 0) return true;
            return candidates.some(candidate => valueAsString === toComparableString(candidate));
          }
          case 'not_equals': {
            const candidates = Array.isArray(cond.value) ? cond.value : [cond.value];
            if (!candidates || candidates.length === 0) return true;
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
          case 'greater_than': {
            const { va } = cmpNumbers(value, undefined);
            const vb = Number.parseFloat(String(cond.value ?? ''));
            return va != null && !Number.isNaN(vb) && va > vb;
          }
          case 'less_than': {
            const { va } = cmpNumbers(value, undefined);
            const vb = Number.parseFloat(String(cond.value ?? ''));
            return va != null && !Number.isNaN(vb) && va < vb;
          }
          case 'after': {
            const tv = parseDate(value);
            const ta = parseDate(String(cond.value ?? ''));
            return !Number.isNaN(tv) && !Number.isNaN(ta) && tv > ta;
          }
          case 'before': {
            const tv = parseDate(value);
            const ta = parseDate(String(cond.value ?? ''));
            return !Number.isNaN(tv) && !Number.isNaN(ta) && tv < ta;
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
