'use client';

import React, { memo, useCallback } from 'react';
import ExcelCell from './ExcelCell';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { DataHeader } from '@/utils/dataProcessors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setSelectedRow,
  selectIsRowSelected,
  selectRowParseErrors,
  setSelectedColumn, // Import the action to reset column selection
} from '@/features/excelUI';

interface ExcelRowProps {
  rowIndex: number;
  rowData: string[];
  columns: DataHeader[];
  mode: 'edit' | 'view';
  onCellChange: (rowIndex: number, columnIndex: number, newValue: string) => void;
  onCellFocus: (rowIndex: number, columnIndex: number) => void;
  onDataChange?: (data: string[][], columns: DataHeader[]) => void;
}

const ExcelRow = memo(function ExcelRow({
  rowIndex,
  rowData,
  columns,
  mode,
  onCellChange,
  onCellFocus,
  onDataChange,
}: ExcelRowProps) {
  const isSelected = useAppSelector(selectIsRowSelected(rowIndex));
  const dispatch = useAppDispatch();

  // Reset both row and column selection when data changes
  React.useEffect(() => {
    if (onDataChange) {
      dispatch(setSelectedRow(null));
      dispatch(setSelectedColumn(null)); // Add this line
    }
  }, [rowData, columns, dispatch, onDataChange]);

  // Get validation errors for this specific row - only re-renders when this row's validation changes
  const handleRowClick = useCallback(() => {
    // Always select this row (this will deselect any other selected row)
    dispatch(setSelectedRow(rowIndex));
  }, [rowIndex, dispatch]);

  const handleDeselect = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch(setSelectedRow(null));
    },
    [dispatch]
  );

  return (
    <tr
      className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
        isSelected ? 'bg-blue-100 dark:bg-blue-900/50' : ''
      }`}
      onClick={handleRowClick}
    >
      {/* Row number cell */}
      <td className="sticky left-0 z-20 bg-gray-100 dark:bg-gray-700 border-r border-b border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-2 text-xs">
        <div className="flex flex-col items-center min-h-[2rem] justify-between py-1">
          <span>{rowIndex + 1}</span>
          {(isSelected as boolean) && (
            <Button size="icon" variant="ghost" onClick={handleDeselect} className="w-4 h-4">
              <X size={10} className="text-blue-500" />
            </Button>
          )}
        </div>
      </td>

      {/* Data cells */}
      {columns.map((col, columnIndex) => {
        return (
          <ExcelCell
            key={columnIndex}
            rowIndex={rowIndex}
            columnIndex={columnIndex}
            value={rowData[columnIndex] || ''}
            columnType={col.type}
            mode={mode}
            onDataChange={onDataChange}
            onCellChange={onCellChange}
            onCellFocus={onCellFocus}
          />
        );
      })}
    </tr>
  );
});

export default ExcelRow;
