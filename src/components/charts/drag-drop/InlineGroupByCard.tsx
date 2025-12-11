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
import type { GroupByColumn, DatasetColumnType } from '@/types/chart';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface InlineGroupByCardProps {
  group: GroupByColumn;
  availableColumns: { id: string; name: string; type: DatasetColumnType; dateFormat?: string }[];
  onUpdate: (next: GroupByColumn) => void;
  onRemove?: () => void;
  onDragStart?: (groupId: string, event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (groupId: string, event: React.DragEvent<HTMLDivElement>) => void;
  excelStyle?: boolean;
}

const dateUnitOptions = [
  { value: 'day', label: 'Day' },
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
];

const InlineGroupByCard: React.FC<InlineGroupByCardProps> = ({
  group,
  availableColumns,
  onUpdate,
  onDragStart,
  onDragEnd,
  excelStyle = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const columnMeta = useMemo(
    () => availableColumns.find(col => col.id === group.id),
    [availableColumns, group.id]
  );

  const isDateColumn = Boolean(columnMeta && columnMeta.type === 'date');

  // Reset expanded state if column is not a date column
  useEffect(() => {
    if (!isDateColumn && isExpanded) {
      setIsExpanded(false);
    }
  }, [isDateColumn, isExpanded]);

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
            // Set data to identify this as a group by card
            event.dataTransfer.setData(
              'text/plain',
              JSON.stringify({
                type: 'group-by',
                id: group.id,
                name: group.name,
                timeUnit: group.timeUnit,
              })
            );
            setIsDragging(true);
            onDragStart?.(group.id, event);
          }}
          onDragEnd={event => {
            onDragEnd?.(group.id, event);
            setIsDragging(false);
          }}
          className={cn(
            'flex items-center gap-2 px-3 transition-all h-[48px]',
            onDragStart && 'cursor-grab active:cursor-grabbing'
          )}
        >
          <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
            {group.name}
            {isDateColumn && group.timeUnit && (
              <span className="text-gray-500 dark:text-gray-400 ml-1">
                (
                {dateUnitOptions.find(opt => opt.value === group.timeUnit)?.label || group.timeUnit}
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
                value={group.timeUnit || 'day'}
                onValueChange={val =>
                  onUpdate({ ...group, timeUnit: val as GroupByColumn['timeUnit'] })
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
        'rounded-xl border border-indigo-500/40 dark:border-indigo-500/40 bg-white/90 dark:bg-gray-900/70 px-3 py-2 shadow-sm transition-all',
        isDragging && 'opacity-0'
      )}
    >
      <div
        draggable={!!onDragStart}
        onDragStart={event => {
          event.dataTransfer.effectAllowed = 'move';
          setIsDragging(true);
          onDragStart?.(group.id, event);
        }}
        onDragEnd={event => {
          onDragEnd?.(group.id, event);
          setIsDragging(false);
        }}
        className={cn(
          'flex items-center gap-2',
          onDragStart && 'cursor-grab active:cursor-grabbing'
        )}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
            {group.name}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            Group level{' '}
            {isDateColumn && group.timeUnit
              ? `· ${dateUnitOptions.find(opt => opt.value === group.timeUnit)?.label || group.timeUnit}`
              : ''}
          </p>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-200 uppercase tracking-wide">
          {columnMeta?.type === 'date' ? 'Date' : columnMeta?.type === 'number' ? 'Number' : 'Text'}
        </span>
        {isDateColumn && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(v => !v)}
            className="h-8 w-8 text-slate-500 dark:text-slate-300"
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
                value={group.timeUnit || 'day'}
                onValueChange={val =>
                  onUpdate({ ...group, timeUnit: val as GroupByColumn['timeUnit'] })
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

export default InlineGroupByCard;
