'use client';

import React, { memo, useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectCellValidation, selectDateFormat } from '@/features/excelUI';

interface ExcelCellProps {
  rowIndex: number;
  columnIndex: number;
  value: string;
  columnType: 'text' | 'number' | 'date';
  mode: 'edit' | 'view';
  onDataChange?: (data: string[][], columns: any[]) => void;
  onCellChange?: (rowIndex: number, columnIndex: number, newValue: string) => void;
  onCellFocus?: (rowIndex: number, columnIndex: number) => void;
}

const ExcelCell = memo(
  function ExcelCell({
    rowIndex,
    columnIndex,
    value,
    columnType,
    mode,
    onDataChange,
    onCellChange,
    onCellFocus,
  }: ExcelCellProps) {
    // Get validation state for this specific cell - only re-renders when this cell's validation changes
    const { hasParseError } = useAppSelector(selectCellValidation(rowIndex, columnIndex));
    const dateFormat = useAppSelector(selectDateFormat);
    const [tempValue, setTempValue] = useState(value);
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Memoize the cell key to prevent unnecessary re-renders
    const cellKey = useMemo(() => `${rowIndex}-${columnIndex}`, [rowIndex, columnIndex]);

    // Update temp value when prop value changes
    useEffect(() => {
      if (!isEditing) {
        setTempValue(value);
      }
    }, [value, isEditing]);

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsEditing(true);
        setTempValue(value);
        // Notify parent to select the column
        if (onCellFocus) {
          onCellFocus(rowIndex, columnIndex);
        }
      },
      [value, onCellFocus, rowIndex, columnIndex]
    );

    const handleBlur = useCallback(() => {
      setIsEditing(false);
      // Apply the edit when user stops editing
      if (tempValue !== value && onCellChange) {
        console.log(`Cell ${rowIndex}-${columnIndex} changed from "${value}" to "${tempValue}"`);
        onCellChange(rowIndex, columnIndex, tempValue);
      }
    }, [tempValue, value, rowIndex, columnIndex, onCellChange]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setTempValue(e.target.value);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.currentTarget.blur();
      }
    }, []);

    // Determine the display value
    const displayValue = isEditing ? tempValue : value;

    // Determine cell styling based on state
    const cellClassName = `
    border-b border-r border-gray-200 dark:border-gray-600
    ${hasParseError ? 'bg-red-50 dark:bg-red-900/30 border-red-300' : ''}
    ${isEditing ? 'bg-blue-50 dark:bg-blue-900/30' : ''}
  `.trim();

    return (
      <td className={cellClassName} style={{ width: '150px', minWidth: 150 }}>
        <input
          ref={inputRef}
          data-cell={cellKey}
          value={displayValue}
          readOnly={mode === 'view'}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`
          w-full h-full p-2 bg-transparent border-none outline-none
          ${mode === 'view' ? 'cursor-default' : 'cursor-text'}
          ${hasParseError ? 'text-red-600 dark:text-red-400' : ''}
        `.trim()}
          style={{
            fontSize: '14px',
            fontFamily: 'inherit',
          }}
        />
      </td>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function to prevent unnecessary re-renders
    return (
      prevProps.rowIndex === nextProps.rowIndex &&
      prevProps.columnIndex === nextProps.columnIndex &&
      prevProps.value === nextProps.value &&
      prevProps.columnType === nextProps.columnType &&
      prevProps.mode === nextProps.mode &&
      prevProps.onCellChange === nextProps.onCellChange &&
      prevProps.onDataChange === nextProps.onDataChange
    );
  }
);

export default ExcelCell;
