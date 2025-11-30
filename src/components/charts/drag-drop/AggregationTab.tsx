import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { Filter, Layers } from 'lucide-react';
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
  const [cardDragOver, setCardDragOver] = useState<string | null>(null);

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
      // Prevent duplicate: same column with same operation type
      const isDuplicate = metrics.some(
        (m, idx) => idx !== index && m.columnId === next.columnId && m.type === next.type
      );

      if (isDuplicate) {
        // Don't update if it would create a duplicate
        return;
      }

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
    regionRef: React.RefObject<HTMLDivElement | null>,
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

  const handleMetricDragEnd = useCallback(
    (metricId: string, event: React.DragEvent<HTMLDivElement>) => {
      const index = metrics.findIndex(m => m.id === metricId);
      if (index === -1) return;
      // Check if dropped into another zone (handled by onDrop)
      const dataStr = event.dataTransfer.getData('text/plain');
      if (dataStr) {
        try {
          const data = JSON.parse(dataStr);
          // If it's a card being moved, don't remove it here
          if (data.cardType === 'metric' || data.cardType === 'group-by') {
            return;
          }
        } catch (e) {
          // Not JSON, continue with removal
        }
      }
      handleDragRemoval(metricDragRegionRef, () => handleMetricRemove(index), event);
    },
    [metrics, handleMetricRemove]
  );

  const handleGroupDragEnd = useCallback(
    (groupId: string, event: React.DragEvent<HTMLDivElement>) => {
      const index = groupBy.findIndex(g => g.id === groupId);
      if (index === -1) return;
      // Check if dropped into another zone (handled by onDrop)
      const dataStr = event.dataTransfer.getData('text/plain');
      if (dataStr) {
        try {
          const data = JSON.parse(dataStr);
          // If it's a card being moved, don't remove it here
          if (data.cardType === 'metric' || data.cardType === 'group-by') {
            return;
          }
        } catch (e) {
          // Not JSON, continue with removal
        }
      }
      handleDragRemoval(groupDragRegionRef, () => handleGroupRemove(index), event);
    },
    [groupBy, handleGroupRemove]
  );

  const handleCardDragEnter = useCallback(
    (zoneId: string, event: React.DragEvent<HTMLDivElement>) => {
      // Check if it's a card being dragged by checking dataTransfer types
      // Cards set 'text/plain' type, columns from palette use dnd-kit which doesn't set this
      const types = Array.from(event.dataTransfer.types);
      if (types.includes('text/plain')) {
        setCardDragOver(zoneId);
      }
    },
    []
  );

  const handleCardDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    // Only clear if we're actually leaving the drop zone (not just moving to a child element)
    const relatedTarget = event.relatedTarget as HTMLElement;
    const currentTarget = event.currentTarget as HTMLElement;
    if (!currentTarget.contains(relatedTarget)) {
      setCardDragOver(null);
    }
  }, []);

  const handleCardDrop = useCallback(
    (targetZone: 'groupby' | 'metrics', event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setCardDragOver(null);

      try {
        const dataStr = event.dataTransfer.getData('text/plain');
        if (!dataStr) return;

        const data = JSON.parse(dataStr);

        // Handle group-by cards
        if (data.type === 'group-by') {
          // Group-by can only go to group-by zone, so if dropped in group-by zone, do nothing (prevent re-order)
          if (targetZone === 'groupby') {
            return;
          }
        }

        // Handle metric cards
        if (data.type === 'metric') {
          // Metrics can only go to metrics zone, so if dropped in metrics zone, do nothing (prevent re-order)
          if (targetZone === 'metrics') {
            return;
          }
        }
      } catch (e) {
        console.error('Error handling card drop:', e);
      }
    },
    [groupBy, metrics, onAggregationChange]
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

      {/* Side-by-side layout - Excel style */}
      <div className="grid grid-cols-2 gap-4">
        {/* Group By Section */}
        <section className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2 px-1">
            <Layers className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Group by</span>
          </div>
          <div
            ref={assignGroupDropRef}
            onDrop={e => handleCardDrop('groupby', e)}
            onDragOver={e => {
              e.preventDefault();
              e.stopPropagation();
              // Check if it's a card being dragged by checking dataTransfer types
              const types = Array.from(e.dataTransfer.types);
              if (types.includes('text/plain')) {
                setCardDragOver('groupby');
              }
            }}
            onDragEnter={e => handleCardDragEnter('groupby', e)}
            onDragLeave={handleCardDragLeave}
            className={cn(
              'flex-1 min-h-[120px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded',
              'transition-all duration-200',
              (isGroupOver || cardDragOver === 'groupby') &&
                'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/10 ring-2 ring-indigo-400/20'
            )}
          >
            {groupCount === 0 ? (
              <div className="h-full flex items-center justify-center p-4">
                <div className="text-center text-gray-400 dark:text-gray-500 text-xs">
                  {isGroupOver ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-indigo-600 dark:text-indigo-400 font-medium"
                    >
                      Drop field here
                    </motion.div>
                  ) : (
                    <span>Drop field here</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {sortedGroupBy.map((group, index) => (
                  <InlineGroupByCard
                    key={group.id}
                    group={group}
                    availableColumns={availableColumns}
                    onUpdate={next => handleGroupUpdate(index, next)}
                    onRemove={() => handleGroupRemove(index)}
                    onDragStart={handleGroupDragStart}
                    onDragEnd={handleGroupDragEnd}
                    excelStyle
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Metrics Section */}
        <section className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2 px-1">
            <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Metrics</span>
          </div>
          <div
            ref={assignMetricDropRef}
            onDrop={e => handleCardDrop('metrics', e)}
            onDragOver={e => {
              e.preventDefault();
              e.stopPropagation();
              // Check if it's a card being dragged by checking dataTransfer types
              const types = Array.from(e.dataTransfer.types);
              if (types.includes('text/plain')) {
                setCardDragOver('metrics');
              }
            }}
            onDragEnter={e => handleCardDragEnter('metrics', e)}
            onDragLeave={handleCardDragLeave}
            className={cn(
              'flex-1 min-h-[120px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded',
              'transition-all duration-200',
              (isMetricsOver || cardDragOver === 'metrics') &&
                'border-purple-500 bg-purple-50/30 dark:bg-purple-900/10 ring-2 ring-purple-400/20'
            )}
          >
            {metricCount === 0 ? (
              <div className="h-full flex items-center justify-center p-4">
                <div className="text-center text-gray-400 dark:text-gray-500 text-xs">
                  {isMetricsOver ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-purple-600 dark:text-purple-400 font-medium"
                    >
                      Drop field here
                    </motion.div>
                  ) : (
                    <span>Drop field here</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {sortedMetrics.map((metric, index) => (
                  <InlineMetricCard
                    key={metric.id}
                    metric={metric}
                    availableColumns={availableColumns}
                    allMetrics={metrics}
                    groupBy={groupBy}
                    onUpdate={next => handleMetricUpdate(index, next)}
                    onRemove={() => handleMetricRemove(index)}
                    onDragStart={handleMetricDragStart}
                    onDragEnd={handleMetricDragEnd}
                    excelStyle
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default AggregationTab;
