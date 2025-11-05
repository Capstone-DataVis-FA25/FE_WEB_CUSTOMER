import React, { memo, useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectCellValidation,
  selectColumnByIndex,
  updateParseError,
  setSelectedRow,
} from '@/features/excelUI';
import { useDataset } from '@/contexts/DatasetContext';

interface ExcelCellProps {
  rowIndex: number;
  columnIndex: number;
  value: string;
  mode: 'edit' | 'view';
  onCellChange?: (rowIndex: number, columnIndex: number, newValue: string) => void;
  onCellFocus?: (rowIndex: number, columnIndex: number) => void;
  isHighlighted?: boolean;
}

const ExcelCell = memo(
  function ExcelCell({
    rowIndex,
    columnIndex,
    value,
    mode,
    onCellChange,
    onCellFocus,
    isHighlighted,
  }: ExcelCellProps) {
    // Get validation state for this specific cell - only re-renders when this cell's validation changes
    const { hasParseError } = useAppSelector(selectCellValidation(rowIndex, columnIndex)) as {
      hasParseError: boolean;
    };
    // useEffect(() => {
    //   console.log('🔍 ExcelCell validation state', {
    //     rowIndex,
    //     columnIndex,
    //     hasParseError,
    //   });
    // }, [rowIndex, columnIndex, hasParseError]);
    const dispatch = useAppDispatch();
    const { numberFormat } = useDataset();
    const col = useAppSelector(selectColumnByIndex(columnIndex)) as
      | { type?: 'text' | 'number' | 'date'; width?: number; dateFormat?: string }
      | undefined;
    const columnType = (col?.type ?? 'text') as 'text' | 'number' | 'date';
    const { tryConvert } = useDataset();
    const [tempValue, setTempValue] = useState(value);
    const [isEditing, setIsEditing] = useState(false);
    const [liveHasError, setLiveHasError] = useState<boolean>(false);
    const lastDispatchedErrorRef = useRef<boolean | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Memoize the cell key to prevent unnecessary re-renders
    const cellKey = useMemo(() => `${rowIndex}-${columnIndex}`, [rowIndex, columnIndex]);

    // Update temp value when prop value changes
    useEffect(() => {
      if (!isEditing) {
        setTempValue(value);
      } else {
        // If external value changed while editing (e.g., Undo/Redo), sync and clear stale error
        setTempValue(value);
        setLiveHasError(hasParseError);
        lastDispatchedErrorRef.current = hasParseError;
      }
    }, [value, isEditing]);

    const handleFocus = useCallback(() => {
      setIsEditing(true);
      setTempValue(value);
      setLiveHasError(hasParseError);
      // Ensure the row is selected in Redux so row actions (e.g., delete) operate on this row
      dispatch(setSelectedRow(rowIndex));
      // Notify parent to select the column
      if (onCellFocus) {
        onCellFocus(rowIndex, columnIndex);
      }
    }, [value, onCellFocus, rowIndex, columnIndex, hasParseError, dispatch]);

    const handleBlur = useCallback(() => {
      setIsEditing(false);
      // Apply the edit when user stops editing
      if (tempValue !== value && onCellChange) {
        console.log(`Cell ${rowIndex}-${columnIndex} changed from "${value}" to "${tempValue}"`);
        onCellChange(rowIndex, columnIndex, tempValue);
        // Validate against current column type and update Redux parseErrors
        const conv = tryConvert(
          columnType,
          columnIndex,
          rowIndex,
          tempValue,
          columnType === 'number' ? numberFormat : undefined,
          columnType === 'date' ? (col?.dateFormat as any) : undefined
        );
        dispatch(
          updateParseError({
            row: rowIndex,
            column: columnIndex,
            hasError: !conv.ok,
          })
        );
      }
    }, [
      tempValue,
      value,
      rowIndex,
      columnIndex,
      onCellChange,
      tryConvert,
      columnType,
      col?.dateFormat,
      numberFormat,
      dispatch,
    ]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const next = e.target.value;
        setTempValue(next);
        // Live-validate while typing
        const conv = tryConvert(
          columnType,
          columnIndex,
          rowIndex,
          next,
          columnType === 'number' ? numberFormat : undefined,
          columnType === 'date' ? (col?.dateFormat as any) : undefined
        );
        const nextErr = !conv.ok;
        setLiveHasError(nextErr);
        // Only dispatch when the boolean error status actually changes to limit churn
        if (lastDispatchedErrorRef.current !== nextErr) {
          lastDispatchedErrorRef.current = nextErr;
          dispatch(
            updateParseError({
              row: rowIndex,
              column: columnIndex,
              hasError: nextErr,
            })
          );
        }
      },
      [columnType, columnIndex, rowIndex, tryConvert, numberFormat, col?.dateFormat, dispatch]
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Keep native undo/redo inside the input, prevent app-level hotkeys from hijacking
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key.toLowerCase() === 'z' || e.key.toLowerCase() === 'y')
      ) {
        e.stopPropagation();
        return;
      }
      if (e.key === 'Enter') e.currentTarget.blur();
    };

    // Determine the display value
    const displayValue = isEditing ? tempValue : value;

    // Determine cell styling based on state
    const cellClassName = `
    relative border-b border-r border-gray-200 dark:border-gray-600
    ${(isEditing ? liveHasError : hasParseError) ? 'bg-red-50 dark:bg-red-900/30 border-red-300' : ''}
    ${isEditing ? 'bg-blue-50 dark:bg-blue-900/30' : ''}
    ${isHighlighted ? 'bg-amber-50/60 dark:bg-amber-900/10' : ''}
  `.trim();

    return (
      <td
        className={cellClassName}
        style={{ width: `${col?.width ?? 150}px`, minWidth: col?.width ?? 150 }}
      >
        {/* Error stripe (highest priority) */}
        {(isEditing ? liveHasError : hasParseError) && (
          <span className="absolute left-0 -top-px -bottom-px w-[2px] bg-red-500 pointer-events-none z-30" />
        )}
        {/* Selection stripe (focused/editing) above highlight */}
        {!(isEditing ? liveHasError : hasParseError) && isEditing && (
          <span className="absolute left-0 -top-px -bottom-px w-[2px] bg-blue-400 pointer-events-none z-20" />
        )}
        {/* Highlight stripe when column is bound */}
        {!(isEditing ? liveHasError : hasParseError) && isHighlighted && !isEditing && (
          <span className="absolute left-0 -top-px -bottom-px w-[2px] bg-amber-500 pointer-events-none z-10" />
        )}
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
          ${(isEditing ? liveHasError : hasParseError) ? 'text-red-600 dark:text-red-400' : ''}
        `.trim()}
          style={{
            fontSize: '14px',
            fontFamily: 'inherit',
          }}
          autoComplete="off"
          spellCheck={false}
        />
      </td>
    );
  },
  (prev, next) => {
    return (
      prev.rowIndex === next.rowIndex &&
      prev.columnIndex === next.columnIndex &&
      prev.value === next.value &&
      prev.mode === next.mode &&
      prev.onCellChange === next.onCellChange &&
      prev.onCellFocus === next.onCellFocus &&
      prev.isHighlighted === next.isHighlighted
    );
  }
);

export default ExcelCell;
