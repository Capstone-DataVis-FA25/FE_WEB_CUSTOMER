'use client';

import React, { memo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setSelectedColumn,
  selectSelectedColumn,
  selectColumnValidation,
} from '@/features/excelUI';
import { Button } from '@/components/ui/button';
import { X, ArrowUpDown, ArrowUp, ArrowDown, FileText, FileDigit, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { DataHeader } from '@/utils/dataProcessors';

const COLUMN_TYPES = [
  { label: 'Text', value: 'text', icon: <FileText size={14} /> },
  { label: 'Number', value: 'number', icon: <FileDigit size={14} /> },
  { label: 'Date', value: 'date', icon: <Calendar size={14} /> },
];

interface ExcelColumnHeaderProps {
  columnIndex: number;
  column: DataHeader;
  mode: 'edit' | 'view';
  filterValue: string;
  onHeaderChange: (columnIndex: number, newName: string) => void;
  onTypeChange: (columnIndex: number, newType: 'text' | 'number' | 'date') => void;
  onSort: (columnIndex: number) => void;
  onFilterChange: (columnIndex: number, value: string) => void;
  sortConfig: {
    column: number;
    direction: 'asc' | 'desc';
  } | null;
}

const ExcelColumnHeader = memo(function ExcelColumnHeader({
  columnIndex,
  column,
  mode,
  filterValue,
  onHeaderChange,
  onTypeChange,
  onSort,
  onFilterChange,
  sortConfig,
}: ExcelColumnHeaderProps) {
  const dispatch = useAppDispatch();
  const selectedColumn = useAppSelector(selectSelectedColumn);

  // Get validation state for this specific column - only re-renders when this column's validation changes
  const { isDuplicate, isEmpty } = useAppSelector(selectColumnValidation(columnIndex));

  const isSelected = selectedColumn === columnIndex;
  const isSorting = sortConfig?.column === columnIndex;
  const sortDirection = sortConfig?.direction;

  const handleHeaderClick = useCallback(() => {
    // Always select this column (this will deselect any other selected column)
    dispatch(setSelectedColumn(columnIndex));
  }, [columnIndex, dispatch]);

  const handleDeselect = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch(setSelectedColumn(null));
    },
    [dispatch]
  );

  const handleHeaderNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onHeaderChange(columnIndex, e.target.value);
    },
    [columnIndex, onHeaderChange]
  );

  const handleTypeChange = useCallback(
    (newType: 'text' | 'number' | 'date') => {
      onTypeChange(columnIndex, newType);
    },
    [columnIndex, onTypeChange]
  );

  const handleSort = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSort(columnIndex);
    },
    [columnIndex, onSort]
  );

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFilterChange(columnIndex, e.target.value);
    },
    [columnIndex, onFilterChange]
  );

  return (
    <th
      className={`relative group border-b border-r p-2 align-top font-semibold text-gray-700 dark:text-gray-200 cursor-pointer ${
        isDuplicate || isEmpty
          ? 'bg-red-100 dark:bg-red-900/50 border-red-300 dark:border-red-600 hover:bg-red-200 dark:hover:bg-red-800/50'
          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
      } ${isSelected ? 'bg-blue-100 dark:bg-blue-900/50' : ''}`}
      style={{ width: column.width || 150, minWidth: 150 }}
      onClick={handleHeaderClick}
    >
      <div className="flex items-center gap-1">
        {mode === 'edit' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-1 text-xs hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={e => e.stopPropagation()}
              >
                {COLUMN_TYPES.find(t => t.value === column.type)?.icon}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {COLUMN_TYPES.map(t => (
                <DropdownMenuItem
                  key={t.value}
                  onClick={() => handleTypeChange(t.value as DataHeader['type'])}
                  className="gap-2"
                >
                  {t.icon} {t.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <input
          value={column.name}
          onChange={handleHeaderNameChange}
          className="flex-1 min-w-0 bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 hover:bg-gray-50 dark:hover:bg-gray-600"
          onClick={e => e.stopPropagation()}
        />

        {mode === 'edit' && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={handleSort}
          >
            {isSorting ? (
              sortDirection === 'asc' ? (
                <ArrowUp size={12} />
              ) : (
                <ArrowDown size={12} />
              )
            ) : (
              <ArrowUpDown size={12} />
            )}
          </Button>
        )}

        {isSelected && (
          <Button
            size="icon"
            variant="ghost"
            onClick={handleDeselect}
            className="w-6 h-6 flex-shrink-0"
          >
            <X size={12} className="text-blue-500" />
          </Button>
        )}
      </div>
      {mode === 'edit' && (
        <input
          value={filterValue}
          onChange={handleFilterChange}
          placeholder="Filter..."
          className="w-full text-xs border rounded px-2 py-1 mt-1 bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      )}
    </th>
  );
});

export default ExcelColumnHeader;
