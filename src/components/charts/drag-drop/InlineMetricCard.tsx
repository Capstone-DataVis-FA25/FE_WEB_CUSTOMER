import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { AggregationMetric, DatasetColumnType } from '@/types/chart';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

const METRIC_TYPES: { value: AggregationMetric['type']; label: string }[] = [
  { value: 'sum', label: 'Sum' },
  { value: 'average', label: 'Average' },
  { value: 'min', label: 'Min' },
  { value: 'max', label: 'Max' },
  { value: 'count', label: 'Count' },
];

interface InlineMetricCardProps {
  metric: AggregationMetric;
  availableColumns: { id: string; name: string; type: DatasetColumnType; dateFormat?: string }[];
  onUpdate: (next: AggregationMetric) => void;
  onRemove: () => void;
  onDragStart?: (metricId: string, event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (metricId: string, event: React.DragEvent<HTMLDivElement>) => void;
}

const InlineMetricCard: React.FC<InlineMetricCardProps> = ({
  metric,
  availableColumns,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const columnMeta = useMemo(
    () => availableColumns.find(col => col.id === metric.columnId),
    [availableColumns, metric.columnId]
  );

  const metricTitle = useMemo(() => {
    if (metric.type === 'count') return 'Count rows';
    const columnName = columnMeta?.name || metric.columnId || 'Column';
    const label = METRIC_TYPES.find(m => m.value === metric.type)?.label || metric.type;
    return `${label} · ${columnName}`;
  }, [metric.type, metric.columnId, columnMeta?.name]);

  return (
    <div
      draggable
      onDragStart={event => {
        event.dataTransfer.effectAllowed = 'move';
        setIsDragging(true);
        onDragStart?.(metric.id, event);
      }}
      onDragEnd={event => {
        onDragEnd?.(metric.id, event);
        setIsDragging(false);
      }}
      className={cn(
        'rounded-xl border border-purple-500/40 dark:border-purple-500/40 bg-white/90 dark:bg-gray-900/70 px-3 py-2 shadow-sm transition-all cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-0'
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
            {metric.alias || metricTitle}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{metricTitle}</p>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-200 uppercase tracking-wide">
          {metric.type}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(v => !v)}
          className="h-8 w-8 text-slate-500 dark:text-slate-300"
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
              value={metric.type}
              onValueChange={val => onUpdate({ ...metric, type: val as AggregationMetric['type'] })}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select function" options={METRIC_TYPES} />
              </SelectTrigger>
              <SelectContent>
                {METRIC_TYPES.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {String(option.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">Alias</p>
            <Input
              value={metric.alias || ''}
              onChange={event => onUpdate({ ...metric, alias: event.target.value })}
              placeholder="Optional label"
              className="h-9 text-xs"
            />
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

export default InlineMetricCard;
