import React, { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { PivotDimension, DatasetColumnType } from '@/types/chart';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface InlinePivotDimensionCardProps {
  dimension: PivotDimension;
  availableColumns: { id: string; name: string; type: DatasetColumnType; dateFormat?: string }[];
  onUpdate: (next: PivotDimension) => void;
  onDragStart?: (dimensionId: string, event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (dimensionId: string, event: React.DragEvent<HTMLDivElement>) => void;
  color: 'amber' | 'blue' | 'green' | 'purple';
  excelStyle?: boolean;
}

const dateUnitOptions = [
  { value: 'day', label: 'Day' },
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
];

const colorClasses = {
  amber: {
    border: 'border-amber-500/40 dark:border-amber-500/40',
    bg: 'bg-amber-100 dark:bg-amber-950/50',
    text: 'text-amber-700 dark:text-amber-200',
  },
  blue: {
    border: 'border-blue-500/40 dark:border-blue-500/40',
    bg: 'bg-blue-100 dark:bg-blue-950/50',
    text: 'text-blue-700 dark:text-blue-200',
  },
  green: {
    border: 'border-green-500/40 dark:border-green-500/40',
    bg: 'bg-green-100 dark:bg-green-950/50',
    text: 'text-green-700 dark:text-green-200',
  },
  purple: {
    border: 'border-purple-500/40 dark:border-purple-500/40',
    bg: 'bg-purple-100 dark:bg-purple-950/50',
    text: 'text-purple-700 dark:text-purple-200',
  },
};

const InlinePivotDimensionCard: React.FC<InlinePivotDimensionCardProps> = ({
  dimension,
  availableColumns,
  onUpdate,
  onDragStart,
  onDragEnd,
  color,
  excelStyle = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const columnMeta = useMemo(
    () => availableColumns.find(col => col.id === dimension.columnId),
    [availableColumns, dimension.columnId]
  );

  const isDateColumn = Boolean(columnMeta && columnMeta.type === 'date');

  // Reset expanded state if column is not a date column
  useEffect(() => {
    if (!isDateColumn && isExpanded) {
      setIsExpanded(false);
    }
  }, [isDateColumn, isExpanded]);

  const colorClass = colorClasses[color];

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
            // Set data to identify this as a pivot dimension card
            event.dataTransfer.setData(
              'text/plain',
              JSON.stringify({
                type: 'pivot-dimension',
                id: dimension.id,
                columnId: dimension.columnId,
                name: dimension.name,
                columnType: dimension.columnType,
                timeUnit: dimension.timeUnit,
              })
            );
            setIsDragging(true);
            onDragStart?.(dimension.id, event);
          }}
          onDragEnd={event => {
            onDragEnd?.(dimension.id, event);
            setIsDragging(false);
          }}
          className={cn(
            'flex items-center gap-2 px-3 transition-all h-[48px]',
            onDragStart && 'cursor-grab active:cursor-grabbing'
          )}
        >
          <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
            {dimension.name}
            {isDateColumn && dimension.timeUnit && (
              <span className="text-gray-500 dark:text-gray-400 ml-1">
                (
                {dateUnitOptions.find(opt => opt.value === dimension.timeUnit)?.label ||
                  dimension.timeUnit}
                )
              </span>
            )}
          </span>
          <span className="ml-auto text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 flex-shrink-0">
            {columnMeta?.type === 'date'
              ? 'Date'
              : columnMeta?.type === 'number'
                ? 'Number'
                : 'Text'}
          </span>
          {isDateColumn && (
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
          )}
        </div>

        {isExpanded && isDateColumn && (
          <div className="px-3 pb-2">
            <div className="mt-2">
              <p className="text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                Time unit
              </p>
              <Select
                value={dimension.timeUnit || 'day'}
                onValueChange={val =>
                  onUpdate({ ...dimension, timeUnit: val as PivotDimension['timeUnit'] })
                }
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select time unit" options={dateUnitOptions} />
                </SelectTrigger>
                <SelectContent>
                  {dateUnitOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {String(option.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border bg-white/90 dark:bg-gray-900/70 px-3 py-2 shadow-sm transition-all',
        colorClass.border,
        isDragging && 'opacity-0'
      )}
    >
      <div
        draggable={!!onDragStart}
        onDragStart={event => {
          event.dataTransfer.effectAllowed = 'move';
          setIsDragging(true);
          onDragStart?.(dimension.id, event);
        }}
        onDragEnd={event => {
          onDragEnd?.(dimension.id, event);
          setIsDragging(false);
        }}
        className={cn(
          'flex items-center gap-2',
          onDragStart && 'cursor-grab active:cursor-grabbing'
        )}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
            {dimension.name}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {isDateColumn && dimension.timeUnit
              ? `· ${dateUnitOptions.find(opt => opt.value === dimension.timeUnit)?.label || dimension.timeUnit}`
              : ''}
          </p>
        </div>
        <span
          className={cn(
            'text-[11px] px-2 py-0.5 rounded-full uppercase tracking-wide',
            colorClass.bg,
            colorClass.text
          )}
        >
          {columnMeta?.type === 'date' ? 'Date' : columnMeta?.type === 'number' ? 'Number' : 'Text'}
        </span>
        {isDateColumn && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(v => !v)}
            className="h-8 w-8 text-slate-500 dark:text-slate-300 cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-3">
          {isDateColumn && (
            <div>
              <p className="text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                Time unit
              </p>
              <Select
                value={dimension.timeUnit || 'day'}
                onValueChange={val =>
                  onUpdate({ ...dimension, timeUnit: val as PivotDimension['timeUnit'] })
                }
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select time unit" options={dateUnitOptions} />
                </SelectTrigger>
                <SelectContent>
                  {dateUnitOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {String(option.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {!isDateColumn && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Grouping applies directly on the raw column values.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default InlinePivotDimensionCard;
