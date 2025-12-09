import { memo } from 'react';
import { useAppSelector } from '@/store/hooks';
import {
  selectParseErrors,
  selectEmptyColumns,
  selectDateFormat,
  selectNumberFormat,
  selectColumns,
} from '@/features/excelUI';
import type { DateFormat, NumberFormat } from '@/contexts/DatasetContext';
import { t } from 'i18next';

interface ValidationDisplayProps {
  columns: Array<{ name: string; type: string }>;
}

// Build a concrete example string for common date formats
const getDateExample = (dateFormat: DateFormat): string => {
  switch (dateFormat) {
    case 'DD/MM/YYYY':
      return '25/12/2024';
    case 'MM/DD/YYYY':
      return '12/25/2024';
    case 'YYYY-MM-DD':
      return '2024-12-25';
    case 'YYYY/MM/DD':
      return '2024/12/25';
    case 'YYYY-MM':
      return '2024-12';
    case 'MM/YYYY':
      return '12/2024';
    case 'MM/YY':
      return '12/24';
    case 'DD-MM-YYYY':
      return '25-12-2024';
    case 'MM-DD-YYYY':
      return '12-25-2024';
    case 'YYYY-MM-DD HH:mm:ss':
      return '2024-12-25 14:30:45';
    case 'YYYY-MM-DDTHH:mm:ss':
      return '2024-12-25T14:30:45';
    case 'YYYY-MM-DD HH:mm':
      return '2024-12-25 14:30';
    case 'YYYY-[Q]Q':
      return '2024-Q4';
    case 'DD Month YYYY':
      return '25 December 2024';
    case 'YYYY':
      return '2024';
    case 'MMMM':
      return 'February';
    case 'MMM':
      return 'Feb';
    case 'MMMM YYYY':
      return 'February 2024';
    case 'MMM YYYY':
      return 'Feb 2024';
    case 'MMMM DD':
      return 'February 25';
    case 'MMM DD':
      return 'Feb 25';
    default:
      return '2024-12-25';
  }
};

const getExpectedFormat = (
  columnType: string,
  dateFormat: DateFormat,
  numberFormat: NumberFormat
): string => {
  switch (columnType) {
    case 'number': {
      const { thousandsSeparator, decimalSeparator } = numberFormat;
      return t('expectedFormat.number', {
        example: `123${thousandsSeparator}456${decimalSeparator}78`,
      });
    }
    case 'date': {
      const example = getDateExample(dateFormat);
      const base = t('expectedFormat.date', { format: dateFormat });
      return `${base} (e.g. ${example})`;
    }
    case 'text':
      return t('expectedFormat.text');
    default:
      return t('expectedFormat.default');
  }
};

const ValidationDisplay = memo(function ValidationDisplay({ columns }: ValidationDisplayProps) {
  // This component subscribes to parseErrors and emptyColumns independently
  const parseErrors = useAppSelector(selectParseErrors);
  const emptyColumns = useAppSelector(selectEmptyColumns);
  const dateFormat = useAppSelector(selectDateFormat);
  const numberFormat = useAppSelector(selectNumberFormat);
  const reduxColumns = useAppSelector(selectColumns);

  const parseMap = parseErrors || {};
  const rows = Object.keys(parseMap)
    .map(n => Number(n))
    .filter(n => !Number.isNaN(n))
    .sort((a, b) => a - b);

  // Check for empty columns
  const hasEmptyColumns = emptyColumns.length > 0;
  const hasParseErrors = rows.length > 0;

  if (!hasEmptyColumns && !hasParseErrors) return null;

  // Show empty column error first
  if (hasEmptyColumns) {
    const emptyColumnNames = emptyColumns
      .map(idx => columns[idx]?.name || t('excelErrors.columnIndex', { index: idx + 1 }))
      .join(', ');

    return (
      <div className="text-red-600 dark:text-red-400 flex items-start gap-2">
        <span>{t('excelErrors.emptyColumns', { names: emptyColumnNames })}</span>
      </div>
    );
  }

  // Show parse errors
  const firstRow = rows[0];
  const firstColIdx = (parseMap[firstRow] || [])[0] ?? 0;
  const colName = columns[firstColIdx]?.name ?? '';
  const colType = columns[firstColIdx]?.type ?? 'text';
  // Prefer per-column dateFormat from Redux if available; fall back to global dateFormat
  const columnDateFormat =
    (reduxColumns[firstColIdx] as any)?.dateFormat || (dateFormat as DateFormat);
  const expectedFormat = getExpectedFormat(colType, columnDateFormat as DateFormat, numberFormat);
  const remaining = Math.max(0, rows.length - 1);
  const msg =
    remaining > 0
      ? t('excelErrors.invalidData.withRemaining', {
          row: firstRow + 1,
          column: colName,
          expectedFormat,
          remaining,
        })
      : t('excelErrors.invalidData.base', {
          row: firstRow + 1,
          column: colName,
          expectedFormat,
        });

  return (
    <div className="text-red-600 dark:text-red-400 flex items-start gap-2">
      <span>{msg}</span>
    </div>
  );
});

export default ValidationDisplay;
