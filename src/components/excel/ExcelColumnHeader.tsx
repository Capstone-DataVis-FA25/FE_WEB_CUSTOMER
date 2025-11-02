import React, { memo, useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setSelectedColumn,
  selectIsColumnSelected,
  selectColumnValidation,
  selectColumnByIndex,
  setColumnName,
  setSortConfig,
  setFilter,
  selectFilterByIndex,
  selectSortDirectionForColumn,
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
  mode: 'edit' | 'view';
  onTypeChange: (columnIndex: number, newType: 'text' | 'number' | 'date') => void;
  // sort/filter now read from Redux
  allowHeaderEdit?: boolean;
  isHighlighted?: boolean;
  showDeselect?: boolean;
}

const ExcelColumnHeader = memo(
  function ExcelColumnHeader({
    columnIndex,
    mode,
    onTypeChange,
    // sort/filter via Redux
    allowHeaderEdit = true,
    isHighlighted,
    showDeselect = true,
  }: ExcelColumnHeaderProps) {
    const dispatch = useAppDispatch();
    const isSelected = useAppSelector(selectIsColumnSelected(columnIndex));
    const column = useAppSelector(selectColumnByIndex(columnIndex)) as DataHeader | undefined;
    const sortDirection = useAppSelector(selectSortDirectionForColumn(columnIndex)) as
      | 'asc'
      | 'desc'
      | null;
    const filterValue = useAppSelector(selectFilterByIndex(columnIndex)) as string;

    // Get validation state for this specific column - only re-renders when this column's validation changes
    const { isDuplicate, isEmpty } = useAppSelector(selectColumnValidation(columnIndex)) as {
      isDuplicate: boolean;
      isEmpty: boolean;
    };

    const isSorting = sortDirection !== null;

    const renderCountRef = useRef(0);
    useEffect(() => {
      renderCountRef.current += 1;
      // console.log('ExcelColumnHeader render', {
      //   columnIndex,
      //   name: column?.name,
      //   type: column?.type,
      //   isSelected,
      //   isSorting,
      //   sortDirection,
      //   renderCount: renderCountRef.current,
      // });
    });

    const handleHeaderClick = useCallback(() => {
      // Always select this column (this will deselect any other selected column)
      dispatch(setSelectedColumn(columnIndex));
    }, [columnIndex, dispatch]);

    const handleDeselectColumn = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(setSelectedColumn(null));
      },
      [dispatch]
    );

    const handleHeaderNameChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const next = e.target.value;
        if (!column || column.name !== next) {
          dispatch(setColumnName({ index: columnIndex, name: next }));
        }
      },
      [columnIndex, dispatch, column]
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
        // Cycle: none -> asc -> desc -> none
        if (sortDirection === null) {
          dispatch(setSortConfig({ column: columnIndex, direction: 'asc' }));
        } else if (sortDirection === 'asc') {
          dispatch(setSortConfig({ column: columnIndex, direction: 'desc' }));
        } else {
          // Clear sorting
          dispatch(setSortConfig(null));
        }
      },
      [columnIndex, dispatch, sortDirection]
    );

    const handleFilterChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setFilter({ index: columnIndex, value: e.target.value }));
      },
      [columnIndex, dispatch]
    );

    return (
      <th
        className={`relative group border-b border-r p-2 align-top font-semibold text-gray-700 dark:text-gray-200 cursor-pointer ${
          isDuplicate || isEmpty
            ? 'bg-red-100 dark:bg-red-900/50 border-red-300 dark:border-red-600 hover:bg-red-200 dark:hover:bg-red-800/50'
            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
        } ${isSelected ? 'bg-blue-100 dark:bg-blue-900/50' : ''} ${
          typeof isHighlighted !== 'undefined' && isHighlighted
            ? 'ring-2 ring-amber-500 dark:ring-amber-500 ring-offset-1 ring-offset-white dark:ring-offset-gray-800 bg-amber-200 dark:bg-amber-900/40'
            : ''
        }`}
        style={{ width: column?.width ?? 150, minWidth: 150 }}
        onClick={handleHeaderClick}
      >
        {(isDuplicate || isEmpty) && (
          <span className="absolute left-0 -top-px -bottom-px w-[2px] bg-red-500 pointer-events-none z-10" />
        )}
        {/* Selection stripe (only when no error). Renders above highlight. */}
        {!isDuplicate && !isEmpty && isSelected && (
          <span className="absolute left-0 -top-px -bottom-px w-[2px] bg-blue-400 pointer-events-none z-10" />
        )}
        {/* Highlight stripe (only when no error and not selected) */}
        {!isDuplicate && !isEmpty && !isSelected && isHighlighted && (
          <span className="absolute left-0 -top-px -bottom-px w-[2px] bg-amber-500 pointer-events-none z-10" />
        )}
        <div className="flex items-center gap-1">
          {(() => {
            const current = COLUMN_TYPES.find(t => t.value === (column?.type ?? 'text'));
            const title = current ? `Type: ${current.label}` : 'Type';
            if (mode === 'edit' && allowHeaderEdit) {
              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-1 text-xs hover:bg-gray-300 dark:hover:bg-gray-600"
                      onClick={e => e.stopPropagation()}
                      title={title}
                    >
                      {current?.icon}
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
              );
            }
            return (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-1 text-xs opacity-70 cursor-default"
                title={title}
                onClick={e => e.stopPropagation()}
                disabled
              >
                {current?.icon}
              </Button>
            );
          })()}

          {mode === 'edit' && allowHeaderEdit ? (
            <input
              value={column?.name ?? ''}
              onChange={handleHeaderNameChange}
              className="flex-1 min-w-0 bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 hover:bg-gray-50 dark:hover:bg-gray-600"
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span className="flex-1 min-w-0 px-2 py-1 text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
              {column?.name ?? ''}
            </span>
          )}

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

          {isSelected && showDeselect && (
            <Button
              size="icon"
              variant="ghost"
              onClick={handleDeselectColumn}
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
  },
  (prev, next) => {
    // Only dependent props are columnIndex, mode, and onTypeChange. All others come from Redux selectors inside.
    return (
      prev.columnIndex === next.columnIndex &&
      prev.mode === next.mode &&
      prev.onTypeChange === next.onTypeChange &&
      prev.isHighlighted === next.isHighlighted
    );
  }
);

export default ExcelColumnHeader;
