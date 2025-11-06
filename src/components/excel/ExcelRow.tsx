import React, { memo, useCallback, useEffect, useRef } from 'react';
import ExcelCell from './ExcelCell';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSelectedRow, selectIsRowSelected, setSelectedColumn } from '@/features/excelUI';

interface ExcelRowProps {
  rowIndex: number;
  rowData: string[];
  columnsLength: number;
  mode: 'edit' | 'view';
  onCellChange: (rowIndex: number, columnIndex: number, newValue: string) => void;
  onCellFocus: (rowIndex: number, columnIndex: number) => void;
  onDataChange?: (data: string[][], columns: any[]) => void;
  highlightedColumns?: Set<number>;
  highlightVersion?: string;
}

const ExcelRow = memo(
  function ExcelRow({
    rowIndex,
    rowData,
    columnsLength,
    mode,
    onCellChange,
    onCellFocus,
    onDataChange,
    highlightedColumns,
    highlightVersion,
  }: ExcelRowProps) {
    const isSelected = useAppSelector(selectIsRowSelected(rowIndex));
    const dispatch = useAppDispatch();

    const renderCountRef = useRef(0);
    useEffect(() => {
      renderCountRef.current += 1;
    }, []);

    // useEffect(() => {
    //   console.log('ExcelRow render', {
    //     rowIndex,
    //     rowLength: rowData.length,
    //     columnsLength,
    //     isSelected,
    //     renderCount: renderCountRef.current,
    //   });
    // }, [rowIndex, rowData, columnsLength, isSelected]);

    // Reset both row and column selection when data changes
    useEffect(() => {
      if (onDataChange) {
        dispatch(setSelectedRow(null));
        dispatch(setSelectedColumn(null));
      }
    }, [rowData, columnsLength, dispatch, onDataChange]);

    const handleRowClick = useCallback(() => {
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
      <tr className={`hover:bg-gray-50 dark:hover:bg-gray-700`}>
        {/* Row number cell */}
        <td
          className={`sticky left-0 z-20 bg-gray-100 dark:bg-gray-700 border-r border-b border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-2 text-xs relative ${isSelected ? 'ring-1 ring-blue-400/60 bg-blue-50 dark:bg-blue-900/30' : ''}`}
        >
          {isSelected && (
            <span className="absolute left-0 -top-px -bottom-px w-[2px] bg-blue-400 pointer-events-none z-30" />
          )}
          <div
            className="flex flex-col items-center min-h-[2rem] justify-between py-1 cursor-pointer"
            onClick={handleRowClick}
          >
            <span>{rowIndex + 1}</span>
            {isSelected && (
              <Button size="icon" variant="ghost" onClick={handleDeselect} className="w-4 h-4">
                <X size={10} className="text-blue-500" />
              </Button>
            )}
          </div>
        </td>

        {/* Data cells */}
        {Array.from({ length: columnsLength }).map((_, columnIndex) => (
          <ExcelCell
            key={columnIndex}
            rowIndex={rowIndex}
            columnIndex={columnIndex}
            value={rowData[columnIndex] || ''}
            mode={mode}
            onCellChange={onCellChange}
            onCellFocus={onCellFocus}
            isHighlighted={highlightedColumns?.has(columnIndex)}
          />
        ))}
      </tr>
    );
  },
  (prevProps: ExcelRowProps, nextProps: ExcelRowProps) => {
    return (
      prevProps.rowIndex === nextProps.rowIndex &&
      prevProps.columnsLength === nextProps.columnsLength &&
      prevProps.mode === nextProps.mode &&
      prevProps.onCellChange === nextProps.onCellChange &&
      prevProps.onCellFocus === nextProps.onCellFocus &&
      prevProps.onDataChange === nextProps.onDataChange &&
      prevProps.rowData === nextProps.rowData &&
      prevProps.highlightedColumns === nextProps.highlightedColumns &&
      prevProps.highlightVersion === nextProps.highlightVersion
    );
  }
);

export default ExcelRow;
