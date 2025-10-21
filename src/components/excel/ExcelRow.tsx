'use client';

import React, { memo, useCallback } from 'react';
import ExcelCell from './ExcelCell';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { DataHeader } from '@/utils/dataProcessors';

interface ExcelRowProps {
  rowIndex: number;
  rowData: string[];
  columns: DataHeader[];
  isSelected: boolean;
  mode: 'edit' | 'view';
  validationErrors: {
    duplicateColumns?: {
      duplicateColumnIndices: number[];
    };
    excelErrors?: {
      parseErrors: Record<number, number[]>;
    };
  };
  onRowSelect: (rowIndex: number | null) => void;
  onCellChange: (rowIndex: number, columnIndex: number, newValue: string) => void;
  onDataChange?: (data: string[][], columns: DataHeader[]) => void;
}

const ExcelRow = memo(function ExcelRow({
  rowIndex,
  rowData,
  columns,
  isSelected,
  mode,
  validationErrors,
  onRowSelect,
  onCellChange,
  onDataChange,
}: ExcelRowProps) {
  const handleRowClick = useCallback(() => {
    onRowSelect(isSelected ? null : rowIndex);
  }, [isSelected, rowIndex, onRowSelect]);

  const handleDeselect = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onRowSelect(null);
    },
    [onRowSelect]
  );

  return (
    <tr
      className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
        isSelected ? 'bg-blue-100 dark:bg-blue-900/50' : ''
      }`}
      onClick={handleRowClick}
    >
      {/* Row number cell */}
      <td className="sticky left-0 z-20 bg-gray-100 dark:bg-gray-700 border-r border-b border-gray-300 dark:border-gray-600 text-center text-gray-600 dark:text-gray-300 px-2 text-xs">
        {rowIndex + 1}
        {isSelected && (
          <Button size="icon" variant="ghost" onClick={handleDeselect} className="w-4 h-4 ml-1">
            <X size={10} className="text-blue-500" />
          </Button>
        )}
      </td>

      {/* Data cells */}
      {columns.map((col, columnIndex) => {
        const isDuplicate =
          validationErrors.duplicateColumns?.duplicateColumnIndices.includes(columnIndex) || false;
        const hasParseError =
          validationErrors.excelErrors?.parseErrors[rowIndex + 1]?.includes(columnIndex) || false;

        return (
          <ExcelCell
            key={columnIndex}
            rowIndex={rowIndex}
            columnIndex={columnIndex}
            value={rowData[columnIndex] || ''}
            columnType={col.type}
            isDuplicate={isDuplicate}
            hasParseError={hasParseError}
            mode={mode}
            onDataChange={onDataChange}
            onCellChange={onCellChange}
          />
        );
      })}
    </tr>
  );
});

export default ExcelRow;
