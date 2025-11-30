import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { PivotValue, DatasetColumnType } from '@/types/chart';
import { ChevronDown, ChevronUp } from 'lucide-react';

const AGGREGATION_TYPES: { value: PivotValue['aggregationType']; label: string }[] = [
  { value: 'sum', label: 'Sum' },
  { value: 'average', label: 'Average' },
  { value: 'min', label: 'Min' },
  { value: 'max', label: 'Max' },
  { value: 'count', label: 'Count' },
];

interface InlinePivotValueCardProps {
  value: PivotValue;
  availableColumns: { id: string; name: string; type: DatasetColumnType; dateFormat?: string }[];
  allValues?: PivotValue[]; // All pivot values to check for duplicates
  onUpdate: (next: PivotValue) => void;
  onDragStart?: (valueId: string, event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (valueId: string, event: React.DragEvent<HTMLDivElement>) => void;
  excelStyle?: boolean;
}

const InlinePivotValueCard: React.FC<InlinePivotValueCardProps> = ({
  value,
  availableColumns,
  allValues = [],
  onUpdate,
  onDragStart,
  onDragEnd,
  excelStyle = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const columnMeta = useMemo(
    () => availableColumns.find(col => col.id === value.columnId),
    [availableColumns, value.columnId]
  );

  // Filter available operations based on column type and what's already used
  const availableOperations = useMemo(() => {
    // First filter by column type
    let operations =
      columnMeta?.type === 'number'
        ? AGGREGATION_TYPES // All operations for numbers
        : AGGREGATION_TYPES.filter(op => op.value === 'count'); // Only Count for text/date columns

    // Then filter out operations already used for this column
    const usedTypes = new Set(
      allValues
        .filter(v => v.id !== value.id && v.columnId === value.columnId)
        .map(v => v.aggregationType)
    );

    return operations.filter(op => !usedTypes.has(op.value));
  }, [columnMeta?.type, allValues, value.id, value.columnId]);

  const valueTitle = useMemo(() => {
    const columnName = columnMeta?.name || value.columnId || 'Column';
    const label =
      AGGREGATION_TYPES.find(m => m.value === value.aggregationType)?.label ||
      value.aggregationType;
    // Excel format: "Sum of column_name", "Average of column_name", etc.
    return `${label} of ${columnName}`;
  }, [value.aggregationType, value.columnId, columnMeta?.name]);

  if (excelStyle) {
    return (
      <div
        className={cn(
          'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded',
          isDragging && 'opacity-0'
        )}
      >
        <div
          draggable={!!onDragStart}
          onDragStart={event => {
            event.dataTransfer.effectAllowed = 'move';
            // Set data to identify this as a pivot value card
            event.dataTransfer.setData(
              'text/plain',
              JSON.stringify({
                type: 'pivot-value',
                id: value.id,
                columnId: value.columnId,
                name: value.name,
                aggregationType: value.aggregationType,
              })
            );
            setIsDragging(true);
            onDragStart?.(value.id, event);
          }}
          onDragEnd={event => {
            onDragEnd?.(value.id, event);
            setIsDragging(false);
          }}
          className={cn(
            'flex items-center gap-2 px-3 transition-all h-[48px]',
            onDragStart && 'cursor-grab active:cursor-grabbing'
          )}
        >
          <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
            {valueTitle}
          </span>
          <span className="ml-auto text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 flex-shrink-0">
            {columnMeta?.type === 'date'
              ? 'Date'
              : columnMeta?.type === 'number'
                ? 'Number'
                : 'Text'}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={e => {
              e.stopPropagation();
              setIsExpanded(v => !v);
            }}
            className="h-8 w-8 text-slate-500 dark:text-slate-300 cursor-pointer flex-shrink-0"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        {isExpanded && (
          <div className="px-3 pb-2">
            <div className="mt-2 space-y-3">
              <div>
                <p className="text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                  Function
                </p>
                <Select
                  value={value.aggregationType}
                  onValueChange={val =>
                    onUpdate({ ...value, aggregationType: val as PivotValue['aggregationType'] })
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select function" options={availableOperations} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableOperations.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {String(option.label)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {columnMeta && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Source column:{' '}
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {columnMeta.name}
                  </span>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-amber-500/40 dark:border-amber-500/40 bg-white/90 dark:bg-gray-900/70 px-3 py-2 shadow-sm transition-all',
        isDragging && 'opacity-0'
      )}
    >
      <div
        draggable={!!onDragStart}
        onDragStart={event => {
          event.dataTransfer.effectAllowed = 'move';
          setIsDragging(true);
          onDragStart?.(value.id, event);
        }}
        onDragEnd={event => {
          onDragEnd?.(value.id, event);
          setIsDragging(false);
        }}
        className={cn(
          'flex items-center gap-2',
          onDragStart && 'cursor-grab active:cursor-grabbing'
        )}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
            {valueTitle}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{valueTitle}</p>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-200 uppercase tracking-wide">
          {value.aggregationType}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(v => !v)}
          className="h-8 w-8 text-slate-500 dark:text-slate-300 cursor-pointer"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-3">
          <div>
            <p className="text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
              Function
            </p>
            <Select
              value={value.aggregationType}
              onValueChange={val =>
                onUpdate({ ...value, aggregationType: val as PivotValue['aggregationType'] })
              }
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select function" options={availableOperations} />
              </SelectTrigger>
              <SelectContent>
                {availableOperations.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {String(option.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {columnMeta && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Source column:{' '}
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {columnMeta.name}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default InlinePivotValueCard;
