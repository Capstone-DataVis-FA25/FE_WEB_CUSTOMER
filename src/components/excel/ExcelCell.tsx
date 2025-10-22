'use client';

import React, { memo, useCallback, useState, useRef, useEffect } from 'react';
import { useDataset } from '@/contexts/DatasetContext';

interface ExcelCellProps {
  rowIndex: number;
  columnIndex: number;
  value: string;
  columnType: 'text' | 'number' | 'date';
  isDuplicate: boolean;
  hasParseError: boolean;
  mode: 'edit' | 'view';
  onDataChange?: (data: string[][], columns: any[]) => void;
  onCellChange?: (rowIndex: number, columnIndex: number, newValue: string) => void;
}

const ExcelCell = memo(function ExcelCell({
  rowIndex,
  columnIndex,
  value,
  columnType,
  isDuplicate,
  hasParseError,
  mode,
  onDataChange,
  onCellChange,
}: ExcelCellProps) {
  const [tempValue, setTempValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { tryConvert, dateFormat } = useDataset();

  // Update temp value when prop value changes
  useEffect(() => {
    if (!isEditing) {
      setTempValue(value);
    }
  }, [value, isEditing]);

  const handleFocus = useCallback(() => {
    setIsEditing(true);
    setTempValue(value);
  }, [value]);

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
    ${isDuplicate ? 'bg-red-100 dark:bg-red-900/50' : ''}
    ${hasParseError ? 'bg-red-50 dark:bg-red-900/30 border-red-300' : ''}
    ${isEditing ? 'bg-blue-50 dark:bg-blue-900/30' : ''}
  `.trim();

  return (
    <td className={cellClassName} style={{ width: '150px', minWidth: 150 }}>
      <input
        ref={inputRef}
        data-cell={`${rowIndex}-${columnIndex}`}
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
});

export default ExcelCell;
