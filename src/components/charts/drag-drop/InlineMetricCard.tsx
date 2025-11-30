import React, { useMemo, useState, useEffect, useCallback } from 'react';
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
import { ChevronDown, ChevronUp, Trash2, AlertCircle } from 'lucide-react';
import { useDebouncedUpdater } from '@/hooks/useDebounce';

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
  allMetrics?: AggregationMetric[];
  groupBy?: Array<{ id: string; name: string }>;
  onUpdate: (next: AggregationMetric) => void;
  onRemove: () => void;
  onDragStart?: (metricId: string, event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (metricId: string, event: React.DragEvent<HTMLDivElement>) => void;
  excelStyle?: boolean;
}

const InlineMetricCard: React.FC<InlineMetricCardProps> = ({
  metric,
  availableColumns,
  allMetrics = [],
  groupBy = [],
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  excelStyle = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [aliasInput, setAliasInput] = useState(metric.alias ?? '');

  // Sync local state with prop changes
  useEffect(() => {
    setAliasInput(metric.alias ?? '');
  }, [metric.alias]);

  const columnMeta = useMemo(
    () => availableColumns.find(col => col.id === metric.columnId),
    [availableColumns, metric.columnId]
  );

  // Get available operation types for this column (exclude already used ones)
  const availableMetricTypes = useMemo(() => {
    // Find used operation types for this column (excluding current metric)
    const usedTypes = new Set(
      allMetrics.filter(m => m.columnId === metric.columnId && m.id !== metric.id).map(m => m.type)
    );

    // Return only types that aren't used
    return METRIC_TYPES.filter(type => !usedTypes.has(type.value));
  }, [allMetrics, metric.columnId, metric.id]);

  const metricTitle = useMemo(() => {
    const columnName = columnMeta?.name || metric.columnId || 'Column';
    const label = METRIC_TYPES.find(m => m.value === metric.type)?.label || metric.type;
    return `${label}(${columnName})`;
  }, [metric.type, metric.columnId, columnMeta?.name]);

  // Helper to get what another metric would display (alias or placeholder)
  const getMetricDisplayName = useCallback(
    (m: AggregationMetric) => {
      const otherAlias = (m.alias ?? '').trim();
      if (otherAlias !== '') return otherAlias;

      // Calculate what placeholder it would show
      const otherColumnName = availableColumns.find(c => c.id === m.columnId)?.name || m.columnId;
      const otherLabel = METRIC_TYPES.find(met => met.value === m.type)?.label || m.type;
      return `${otherLabel}(${otherColumnName})`;
    },
    [availableColumns]
  );

  // Helper to check if a name is taken (by ANY column name, group by columns, or other metrics)
  const isNameTaken = useCallback(
    (nameToCheck: string, excludeMetricId?: string) => {
      // Check ALL available column names (to prevent conflicts with columns used in filters, sort, etc.)
      const allColumnNames = availableColumns.map(col => col.name);
      if (allColumnNames.includes(nameToCheck)) return true;

      // Check group by column names
      const groupByNames = groupBy.map(gb => {
        const col = availableColumns.find(c => c.id === gb.id);
        return col?.name || gb.name;
      });
      if (groupByNames.includes(nameToCheck)) return true;

      // Check other metrics - need to calculate their actual display names in order
      const otherMetrics = allMetrics.filter(m =>
        excludeMetricId ? m.id !== excludeMetricId : m.id !== metric.id
      );

      // Calculate display names for all other metrics in order to ensure deterministic unique names
      const usedNames = new Set<string>([...allColumnNames, ...groupByNames]);
      const otherDisplayNames = otherMetrics.map(m => {
        const displayName = getMetricDisplayName(m);
        // If this display name is already used, generate unique version
        if (usedNames.has(displayName)) {
          let uniqueName = displayName;
          let counter = 1;
          while (usedNames.has(uniqueName)) {
            uniqueName = `${displayName}_${counter}`;
            counter++;
          }
          usedNames.add(uniqueName);
          return uniqueName;
        }
        usedNames.add(displayName);
        return displayName;
      });

      return otherDisplayNames.includes(nameToCheck);
    },
    [groupBy, allMetrics, metric.id, availableColumns, getMetricDisplayName]
  );

  // Calculate placeholder - always show unique name (never generic text)
  const placeholder = useMemo(() => {
    const defaultPlaceholder = metricTitle;

    // Calculate all other metrics' display names in order to ensure deterministic placeholders
    // Start with ALL column names to prevent conflicts
    const allColumnNames = availableColumns.map(col => col.name);
    const groupByNames = groupBy.map(gb => {
      const col = availableColumns.find(c => c.id === gb.id);
      return col?.name || gb.name;
    });
    const usedNames = new Set<string>([...allColumnNames, ...groupByNames]);

    // Process all metrics before this one to see what names they would use
    const currentIndex = allMetrics.findIndex(m => m.id === metric.id);
    const metricsBefore = allMetrics.slice(0, currentIndex);

    metricsBefore.forEach(m => {
      const displayName = getMetricDisplayName(m);
      if (usedNames.has(displayName)) {
        let uniqueName = displayName;
        let counter = 1;
        while (usedNames.has(uniqueName)) {
          uniqueName = `${displayName}_${counter}`;
          counter++;
        }
        usedNames.add(uniqueName);
      } else {
        usedNames.add(displayName);
      }
    });

    // Now check if our default placeholder is available
    if (usedNames.has(defaultPlaceholder)) {
      // Generate unique placeholder
      let uniquePlaceholder = defaultPlaceholder;
      let counter = 1;
      while (usedNames.has(uniquePlaceholder)) {
        uniquePlaceholder = `${defaultPlaceholder}_${counter}`;
        counter++;
      }
      return uniquePlaceholder;
    }

    return defaultPlaceholder;
  }, [metricTitle, metric.id, allMetrics, groupBy, availableColumns, getMetricDisplayName]);

  // Check if current alias is duplicate
  const isDuplicate = useMemo(() => {
    const trimmedAlias = (metric.alias ?? '').trim();
    if (trimmedAlias === '') return false;
    return isNameTaken(trimmedAlias);
  }, [metric.alias, isNameTaken]);

  const debouncedUpdateAlias = useDebouncedUpdater<string>(alias => {
    const trimmed = alias.trim();
    // Store as empty string if empty (like modal), not undefined
    const newAlias = trimmed === '' ? '' : trimmed;
    const currentAlias = metric.alias ?? '';

    // Only update if the value actually changed (don't auto-rename, just show error)
    if (newAlias !== currentAlias) {
      onUpdate({ ...metric, alias: newAlias });
    }
  }, 250);

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
            // Set data to identify this as a metric card
            event.dataTransfer.setData(
              'text/plain',
              JSON.stringify({
                type: 'metric',
                id: metric.id,
                columnId: metric.columnId,
                metricType: metric.type,
                alias: metric.alias,
              })
            );
            setIsDragging(true);
            onDragStart?.(metric.id, event);
          }}
          onDragEnd={event => {
            onDragEnd?.(metric.id, event);
            setIsDragging(false);
          }}
          className={cn(
            'flex items-center gap-2 px-3 transition-all h-[48px]',
            onDragStart && 'cursor-grab active:cursor-grabbing'
          )}
        >
          <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
            {(metric.alias ?? '').trim() || placeholder}
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
                  value={metric.type}
                  onValueChange={val =>
                    onUpdate({ ...metric, type: val as AggregationMetric['type'] })
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select function" options={availableMetricTypes} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMetricTypes.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {String(option.label)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                  Alias
                </p>
                <div className="relative">
                  <Input
                    value={aliasInput}
                    readOnly
                    disabled
                    placeholder={placeholder}
                    className="h-9 text-xs bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                  />
                  {/* KEPT FOR FUTURE USE: Alias editing logic
                  <Input
                    value={aliasInput}
                    onChange={event => {
                      const newValue = event.target.value;
                      setAliasInput(newValue);
                      debouncedUpdateAlias(newValue);
                    }}
                    placeholder={placeholder}
                    className={cn(
                      'h-9 text-xs pr-8',
                      isDuplicate && '!border-red-500 !ring-1 !ring-red-500 focus:!border-red-500 focus:!ring-1 focus:!ring-red-500'
                    )}
                  />
                  {isDuplicate && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 group">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-10">
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-2 py-1 text-xs text-red-700 dark:text-red-300 whitespace-nowrap shadow-lg">
                          Name already exists
                        </div>
                      </div>
                    </div>
                  )}
                  */}
                </div>
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
        'rounded-xl border border-purple-500/40 dark:border-purple-500/40 bg-white/90 dark:bg-gray-900/70 px-3 py-2 shadow-sm transition-all',
        isDragging && 'opacity-0'
      )}
    >
      <div
        draggable={!!onDragStart}
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
          'flex items-center gap-2',
          onDragStart && 'cursor-grab active:cursor-grabbing'
        )}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
            {(metric.alias ?? '').trim() || placeholder}
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
                <SelectValue placeholder="Select function" options={availableMetricTypes} />
              </SelectTrigger>
              <SelectContent>
                {availableMetricTypes.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {String(option.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">Alias</p>
            <div className="relative">
              <Input
                value={aliasInput}
                readOnly
                disabled
                placeholder={placeholder}
                className="h-9 text-xs bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
              />
              {/* KEPT FOR FUTURE USE: Alias editing logic
              <Input
                value={aliasInput}
                onChange={event => {
                  const newValue = event.target.value;
                  setAliasInput(newValue);
                  debouncedUpdateAlias(newValue);
                }}
                placeholder={placeholder}
                className={cn(
                  'h-9 text-xs pr-8',
                  isDuplicate && '!border-red-500 !ring-1 !ring-red-500 focus:!border-red-500 focus:!ring-1 focus:!ring-red-500'
                )}
              />
              {isDuplicate && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 group">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-10">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-2 py-1 text-xs text-red-700 dark:text-red-300 whitespace-nowrap shadow-lg">
                      Name already exists
                    </div>
                  </div>
                </div>
              )}
              */}
            </div>
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
