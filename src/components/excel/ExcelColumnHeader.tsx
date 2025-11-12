import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setSelectedColumn,
  setColumnName,
  setColumnType,
  selectIsColumnSelected,
  selectColumnByIndex,
  selectColumnValidation,
} from '@/features/excelUI';
import { setColumnDateFormat, updateParseError } from '@/features/excelUI/excelUISlice';
import { Button } from '@/components/ui/button';
import { X, FileText, FileDigit, Calendar, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import type { DataHeader } from '@/utils/dataProcessors';
import { useDataset, DATE_FORMATS } from '@/contexts/DatasetContext';

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
  disableSelection?: boolean;
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
    disableSelection = false,
  }: ExcelColumnHeaderProps) {
    const dispatch = useAppDispatch();
    const { tryConvertColumn, tryConvert, currentParsedData } = useDataset();
    const [dateSubOpen, setDateSubOpen] = useState(false);
    const [isTypeIconHover, setIsTypeIconHover] = useState(false);
    const isSelectedRedux = useAppSelector(selectIsColumnSelected(columnIndex));
    const isSelected = disableSelection ? false : isSelectedRedux;
    const column = useAppSelector(selectColumnByIndex(columnIndex)) as DataHeader | undefined;
    // removed filter UI and state

    // Get validation state for this specific column - only re-renders when this column's validation changes
    const { isDuplicate, isEmpty } = useAppSelector(selectColumnValidation(columnIndex)) as {
      isDuplicate: boolean;
      isEmpty: boolean;
    };

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
      if (disableSelection) return;
      // Always select this column (this will deselect any other selected column)
      dispatch(setSelectedColumn(columnIndex));
    }, [columnIndex, dispatch, disableSelection]);

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

    // Date formats menu provided by context (single source of truth)

    const handlePickDateFormat = useCallback(
      async (fmt: string) => {
        // Update Redux header state
        dispatch(setColumnType({ index: columnIndex, type: 'date' }));
        dispatch(setColumnDateFormat({ index: columnIndex, dateFormat: fmt }));
        // Trigger conversion/validation for this column only
        tryConvertColumn(columnIndex, 'date', undefined, fmt as any);
        // Targeted revalidation into Redux parseErrors for this column only
        const rows = currentParsedData?.data || [];
        for (let ri = 0; ri < rows.length; ri++) {
          const raw = rows[ri]?.[columnIndex] ?? '';
          const conv = tryConvert('date', columnIndex, ri, raw, undefined, fmt as any);
          dispatch(updateParseError({ row: ri, column: columnIndex, hasError: !conv.ok }));
        }
      },
      [columnIndex, dispatch, tryConvertColumn, tryConvert, currentParsedData]
    );

    // sorting moved to DataTab operations (no in-grid handler)

    // removed filter change handler

    return (
      <th
        className={`relative group border-b border-r p-2 align-top font-semibold text-gray-700 dark:text-gray-200 ${
          disableSelection ? 'cursor-default' : 'cursor-pointer'
        } ${
          isDuplicate || isEmpty
            ? `bg-red-100 dark:bg-red-900/50 border-red-300 dark:border-red-600 hover:bg-red-200 dark:hover:bg-red-800/50`
            : `border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600`
        } ${isSelected ? 'bg-blue-100 dark:bg-blue-900/50' : ''} ${
          typeof isHighlighted !== 'undefined' && isHighlighted
            ? 'ring-2 ring-amber-500 dark:ring-amber-500 ring-offset-1 ring-offset-white dark:ring-offset-gray-800 bg-amber-200 dark:bg-amber-900/40'
            : ''
        }`}
        style={{ width: column?.width ?? 150, minWidth: 150 }}
        onClick={handleHeaderClick}
        onMouseDown={e => {
          if (disableSelection) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
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
            const title =
              column?.type === 'date'
                ? `Type: Date — ${((column as any)?.dateFormat as string) || 'YYYY-MM-DD'}`
                : current
                  ? `Type: ${current.label}`
                  : 'Type';
            if (mode === 'edit' && allowHeaderEdit) {
              return (
                <DropdownMenu
                  onOpenChange={open => {
                    if (!open) setDateSubOpen(false);
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-1 text-xs hover:bg-gray-300 dark:hover:bg-gray-600"
                      onClick={e => e.stopPropagation()}
                      onMouseEnter={() => setIsTypeIconHover(true)}
                      onMouseLeave={() => setIsTypeIconHover(false)}
                      title={title}
                    >
                      {current?.icon}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {/* Text */}
                    <DropdownMenuItem
                      onClick={() => handleTypeChange('text')}
                      className="gap-2 justify-between"
                    >
                      <span className="inline-flex items-center gap-2">
                        <FileText size={14} /> Text
                      </span>
                      {column?.type === 'text' && <Check size={14} className="opacity-80" />}
                    </DropdownMenuItem>
                    {/* Number */}
                    <DropdownMenuItem
                      onClick={() => handleTypeChange('number')}
                      className="gap-2 justify-between"
                    >
                      <span className="inline-flex items-center gap-2">
                        <FileDigit size={14} /> Number
                      </span>
                      {column?.type === 'number' && <Check size={14} className="opacity-80" />}
                    </DropdownMenuItem>
                    {/* Date with submenu */}
                    <DropdownMenuSub open={dateSubOpen}>
                      <DropdownMenuSubTrigger
                        className="gap-2 justify-between"
                        onPointerMove={e => e.stopPropagation()}
                        onMouseEnter={e => e.stopPropagation()}
                        onClick={e => {
                          e.stopPropagation();
                          setDateSubOpen(prev => !prev);
                        }}
                      >
                        <span className="inline-flex items-center gap-2">
                          <Calendar size={14} /> Date
                        </span>
                        {column?.type === 'date' && <Check size={14} className="opacity-80" />}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup
                          value={
                            column?.type === 'date'
                              ? (column?.dateFormat as string) || 'YYYY-MM-DD'
                              : ''
                          }
                          onValueChange={val => {
                            handlePickDateFormat(val);
                            setDateSubOpen(false);
                          }}
                        >
                          {DATE_FORMATS.map(fmt => (
                            <DropdownMenuRadioItem key={fmt} value={fmt}>
                              {fmt}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
            return (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-1 text-xs opacity-70 cursor-default relative z-10 hover:bg-gray-300 dark:hover:bg-gray-600"
                title={title}
                onClick={e => {
                  // prevent header click/select and keep non-interactive behavior
                  e.stopPropagation();
                  e.preventDefault();
                }}
                tabIndex={-1}
                aria-disabled="true"
                onMouseEnter={() => setIsTypeIconHover(true)}
                onMouseLeave={() => setIsTypeIconHover(false)}
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
        {/* filter input removed */}
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
