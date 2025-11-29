import React, { useCallback, useMemo, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { Filter, Layers, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AggregationSummaryButton } from '@/pages/chart-creator/operations/aggregation/AggregationSummaryButton';
import type { GroupByColumn, AggregationMetric, DatasetColumnType } from '@/types/chart';
import InlineGroupByCard from './InlineGroupByCard';
import InlineMetricCard from './InlineMetricCard';

interface AggregationTabProps {
  availableColumns: { id: string; name: string; type: DatasetColumnType; dateFormat?: string }[];
  groupBy: GroupByColumn[];
  metrics: AggregationMetric[];
  onAggregationChange: (groupBy: GroupByColumn[], metrics: AggregationMetric[]) => void;
}

const AggregationTab: React.FC<AggregationTabProps> = ({
  availableColumns,
  groupBy,
  metrics,
  onAggregationChange,
}) => {
  const groupDragRegionRef = useRef<HTMLDivElement | null>(null);
  const metricDragRegionRef = useRef<HTMLDivElement | null>(null);

  const { setNodeRef: setGroupDropRef, isOver: isGroupOver } = useDroppable({
    id: 'aggregation-groupby-zone',
    data: { zone: 'aggregation-groupby' },
  });
  const { setNodeRef: setMetricsDropRef, isOver: isMetricsOver } = useDroppable({
    id: 'aggregation-metrics-zone',
    data: { zone: 'aggregation-metrics' },
  });

  const assignGroupDropRef = useCallback(
    (node: HTMLDivElement | null) => {
      groupDragRegionRef.current = node;
      setGroupDropRef(node);
    },
    [setGroupDropRef]
  );

  const assignMetricDropRef = useCallback(
    (node: HTMLDivElement | null) => {
      metricDragRegionRef.current = node;
      setMetricsDropRef(node);
    },
    [setMetricsDropRef]
  );

  const handleGroupUpdate = useCallback(
    (index: number, next: GroupByColumn) => {
      const updated = [...groupBy];
      updated[index] = next;
      onAggregationChange(updated, metrics);
    },
    [groupBy, metrics, onAggregationChange]
  );

  const handleMetricUpdate = useCallback(
    (index: number, next: AggregationMetric) => {
      const updated = [...metrics];
      updated[index] = next;
      onAggregationChange(groupBy, updated);
    },
    [groupBy, metrics, onAggregationChange]
  );

  const handleGroupRemove = useCallback(
    (index: number) => {
      const updated = groupBy.filter((_, idx) => idx !== index);
      onAggregationChange(updated, metrics);
    },
    [groupBy, metrics, onAggregationChange]
  );

  const handleMetricRemove = useCallback(
    (index: number) => {
      const updated = metrics.filter((_, idx) => idx !== index);
      onAggregationChange(groupBy, updated);
    },
    [groupBy, metrics, onAggregationChange]
  );

  const handleGroupDragStart = useCallback(
    (_groupId: string, event: React.DragEvent<HTMLDivElement>) => {
      const source = event.currentTarget;
      const clone = source.cloneNode(true) as HTMLElement;
      clone.style.position = 'absolute';
      clone.style.top = '-9999px';
      clone.style.left = '-9999px';
      clone.style.width = `${source.clientWidth}px`;
      clone.style.pointerEvents = 'none';
      clone.style.opacity = '0.75';
      document.body.appendChild(clone);
      event.dataTransfer.setDragImage(clone, source.clientWidth / 2, 20);
      requestAnimationFrame(() => {
        clone.remove();
      });
    },
    []
  );

  const handleMetricDragStart = handleGroupDragStart;

  const handleDragRemoval = (
    regionRef: React.RefObject<HTMLDivElement>,
    callback: () => void,
    event: React.DragEvent<HTMLDivElement>
  ) => {
    const bounds = regionRef.current?.getBoundingClientRect();
    const { clientX, clientY } = event;
    const inside =
      bounds &&
      clientX >= bounds.left &&
      clientX <= bounds.right &&
      clientY >= bounds.top &&
      clientY <= bounds.bottom;
    if (!inside) callback();
  };

  const handleGroupDragEnd = useCallback(
    (groupId: string, event: React.DragEvent<HTMLDivElement>) => {
      const index = groupBy.findIndex(g => g.id === groupId);
      if (index === -1) return;
      handleDragRemoval(groupDragRegionRef, () => handleGroupRemove(index), event);
    },
    [groupBy, handleGroupRemove]
  );

  const handleMetricDragEnd = useCallback(
    (metricId: string, event: React.DragEvent<HTMLDivElement>) => {
      const index = metrics.findIndex(m => m.id === metricId);
      if (index === -1) return;
      handleDragRemoval(metricDragRegionRef, () => handleMetricRemove(index), event);
    },
    [metrics, handleMetricRemove]
  );

  const groupCount = groupBy.length;
  const metricCount = metrics.length;

  const sortedGroupBy = useMemo(() => groupBy, [groupBy]);
  const sortedMetrics = useMemo(() => metrics, [metrics]);

  return (
    <motion.div
      key="aggregation"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col"
    >
      <div className="mb-3">
        <AggregationSummaryButton
          availableColumns={availableColumns}
          initialGroupBy={groupBy}
          initialMetrics={metrics}
          onAggregationChange={onAggregationChange}
        />
      </div>

      {/* Stacked sections so inline cards have full width */}
      <div className="grid grid-cols-1 gap-4">
        <section className="space-y-2">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium px-1">
            <span className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Group by</span>
              <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">
                ({groupCount} dimension{groupCount === 1 ? '' : 's'})
              </span>
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              Drop any column to create dimensions
            </span>
          </div>
          {groupCount === 0 ? (
            <div
              ref={assignGroupDropRef}
              className={cn(
                'relative rounded-xl border-2 border-dashed transition-all duration-300 w-full h-[200px] flex items-center justify-center mb-4 overflow-hidden',
                isGroupOver
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg shadow-indigo-500/20'
                  : 'border-indigo-500/40 dark:border-indigo-500/40 bg-gray-50/50 dark:bg-gray-800/50'
              )}
            >
              {isGroupOver ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-2 justify-center text-lg">
                    <Plus className="w-6 h-6" />
                    Drop column here to add group by
                  </div>
                </motion.div>
              ) : (
                <div className="text-center text-gray-400 dark:text-gray-500">
                  <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">Drop column here to add group by</p>
                  <p className="text-xs mt-1 opacity-75">Drag a column from above into this area</p>
                </div>
              )}
            </div>
          ) : (
            <div
              ref={assignGroupDropRef}
              className={cn(
                'relative rounded-xl border border-indigo-500/40 dark:border-indigo-500/40 bg-gray-50/70 dark:bg-gray-900/40 p-3 -mx-2 shadow-inner shadow-black/5 transition-colors',
                isGroupOver ? 'ring-2 ring-indigo-400/60' : ''
              )}
            >
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium mb-2 px-1">
                <span className="text-gray-700 dark:text-gray-200 normal-case font-semibold">
                  {groupCount} active {groupCount === 1 ? 'dimension' : 'dimensions'}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                  Drop columns to add
                </span>
              </div>
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2 preview-scrollbar pb-1">
                {sortedGroupBy.map((group, index) => (
                  <InlineGroupByCard
                    key={group.id}
                    group={group}
                    availableColumns={availableColumns}
                    onUpdate={next => handleGroupUpdate(index, next)}
                    onRemove={() => handleGroupRemove(index)}
                    onDragStart={handleGroupDragStart}
                    onDragEnd={handleGroupDragEnd}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium px-1">
            <span className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" />
              <span>Metrics</span>
              <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">
                ({metricCount} metric{metricCount === 1 ? '' : 's'})
              </span>
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              Drop number columns for aggregates
            </span>
          </div>
          {metricCount === 0 ? (
            <div
              ref={assignMetricDropRef}
              className={cn(
                'relative rounded-xl border-2 border-dashed transition-all duration-300 w-full h-[200px] flex items-center justify-center mb-4 overflow-hidden',
                isMetricsOver
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg shadow-purple-500/20'
                  : 'border-purple-500/40 dark:border-purple-500/40 bg-gray-50/50 dark:bg-gray-800/50'
              )}
            >
              {isMetricsOver ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-2 justify-center text-lg">
                    <Plus className="w-6 h-6" />
                    Drop column here to add metric
                  </div>
                </motion.div>
              ) : (
                <div className="text-center text-gray-400 dark:text-gray-500">
                  <Filter className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">Drop column here to add metric</p>
                  <p className="text-xs mt-1 opacity-75">
                    Drag a numeric column from above into this area
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div
              ref={assignMetricDropRef}
              className={cn(
                'relative rounded-xl border border-purple-500/40 dark:border-purple-500/40 bg-gray-50/70 dark:bg-gray-900/40 p-3 -mx-2 shadow-inner shadow-black/5 transition-colors',
                isMetricsOver ? 'ring-2 ring-purple-400/60' : ''
              )}
            >
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium mb-2 px-1">
                <span className="text-gray-700 dark:text-gray-200 normal-case font-semibold">
                  {metricCount} active {metricCount === 1 ? 'metric' : 'metrics'}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                  Drop columns to add
                </span>
              </div>
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2 preview-scrollbar pb-1">
                {sortedMetrics.map((metric, index) => (
                  <InlineMetricCard
                    key={metric.id}
                    metric={metric}
                    availableColumns={availableColumns}
                    onUpdate={next => handleMetricUpdate(index, next)}
                    onRemove={() => handleMetricRemove(index)}
                    onDragStart={handleMetricDragStart}
                    onDragEnd={handleMetricDragEnd}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
};

export default AggregationTab;
