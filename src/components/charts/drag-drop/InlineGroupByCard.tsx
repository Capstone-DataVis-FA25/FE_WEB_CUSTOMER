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

  return (
    <div
      draggable
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
        'rounded-xl border border-indigo-500/40 dark:border-indigo-500/40 bg-white/90 dark:bg-gray-900/70 px-3 py-2 shadow-sm transition-all cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-0'
      )}
    >
      <div className="flex items-center gap-2">
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
