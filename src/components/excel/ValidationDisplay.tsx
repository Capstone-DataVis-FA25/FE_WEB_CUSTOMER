'use client';

import { memo } from 'react';
import { useAppSelector } from '@/store/hooks';
import {
  selectParseErrors,
  selectEmptyColumns,
  selectDateFormat,
  selectNumberFormat,
} from '@/features/excelUI';
import type { DateFormat, NumberFormat } from '@/contexts/DatasetContext';

interface ValidationDisplayProps {
  columns: Array<{ name: string; type: string }>;
}

// Helper function to get expected format for each column type
const getExpectedFormat = (
  columnType: string,
  dateFormat: DateFormat,
  numberFormat: NumberFormat
): string => {
  switch (columnType) {
    case 'number':
      const { thousandsSeparator, decimalSeparator } = numberFormat;
      return `số (ví dụ: 123${thousandsSeparator}456${decimalSeparator}78)`;
    case 'date':
      return `ngày tháng (định dạng: ${dateFormat})`;
    case 'text':
      return 'văn bản';
    default:
      return 'dữ liệu hợp lệ';
  }
};

const ValidationDisplay = memo(function ValidationDisplay({ columns }: ValidationDisplayProps) {
  // This component subscribes to parseErrors and emptyColumns independently
  const parseErrors = useAppSelector(selectParseErrors);
  const emptyColumns = useAppSelector(selectEmptyColumns);
  const dateFormat = useAppSelector(selectDateFormat);
  const numberFormat = useAppSelector(selectNumberFormat);

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
      .map(idx => columns[idx]?.name || `Cột ${idx + 1}`)
      .join(', ');
    const msg = `Lỗi: Tên cột không được để trống: ${emptyColumnNames}`;
    return (
      <div className="text-red-600 dark:text-red-400 flex items-start gap-2">
        <span>{msg}</span>
      </div>
    );
  }

  // Show parse errors
  const firstRow = rows[0];
  const firstColIdx = (parseMap[firstRow] || [])[0] ?? 0;
  const colName = columns[firstColIdx]?.name ?? '';
  const colType = columns[firstColIdx]?.type ?? 'text';
  const expectedFormat = getExpectedFormat(colType, dateFormat as DateFormat, numberFormat);
  const remaining = Math.max(0, rows.length - 1);
  const base = `Lỗi: Dữ liệu không đúng định dạng tại hàng ${firstRow + 1}, cột "${colName}". Định dạng mong đợi: ${expectedFormat}`;
  const msg = remaining > 0 ? `${base}. Còn ${remaining} hàng khác gặp vấn đề.` : `${base}.`;

  return (
    <div className="text-red-600 dark:text-red-400 flex items-start gap-2">
      <span>{msg}</span>
    </div>
  );
});

export default ValidationDisplay;
