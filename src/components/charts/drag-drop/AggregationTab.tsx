import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import AggregationConfiguration from '../AggregationConfiguration';
import { AggregationSummaryButton } from '@/pages/chart-creator/operations/aggregation/AggregationSummaryButton';
import type { GroupByColumn, AggregationMetric, DatasetColumnType } from '@/types/chart';

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
  const { setNodeRef: setGroupDropRef, isOver: isGroupOver } = useDroppable({
    id: 'aggregation-groupby-zone',
    data: { zone: 'aggregation-groupby' },
  });
  const { setNodeRef: setMetricsDropRef, isOver: isMetricsOver } = useDroppable({
    id: 'aggregation-metrics-zone',
    data: { zone: 'aggregation-metrics' },
  });

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

      {/* Drop Zones */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Group By Drop Zone */}
        <div
          ref={setGroupDropRef}
          className={cn(
            'relative rounded-xl border-2 border-dashed transition-all duration-300 w-full h-[250px] flex flex-col items-center justify-center overflow-hidden',
            isGroupOver
              ? 'border-gray-400 dark:border-gray-500 bg-gray-100 dark:bg-gray-800/50 shadow-lg shadow-gray-500/20'
              : 'border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50'
          )}
        >
          {isGroupOver ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="text-gray-600 dark:text-gray-400 font-semibold flex items-center gap-2 justify-center text-sm">
                <Plus className="w-5 h-5" />
                Drop here
              </div>
            </motion.div>
          ) : (
            <div className="text-center text-gray-400 dark:text-gray-500">
              <p className="text-sm font-medium mb-1">Group By</p>
              <p className="text-xs opacity-75">Drop column here</p>
            </div>
          )}
        </div>

        {/* Metrics Drop Zone */}
        <div
          ref={setMetricsDropRef}
          className={cn(
            'relative rounded-xl border-2 border-dashed transition-all duration-300 w-full h-[250px] flex flex-col items-center justify-center overflow-hidden',
            isMetricsOver
              ? 'border-gray-400 dark:border-gray-500 bg-gray-100 dark:bg-gray-800/50 shadow-lg shadow-gray-500/20'
              : 'border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50'
          )}
        >
          {isMetricsOver ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="text-gray-600 dark:text-gray-400 font-semibold flex items-center gap-2 justify-center text-sm">
                <Plus className="w-5 h-5" />
                Drop here
              </div>
            </motion.div>
          ) : (
            <div className="text-center text-gray-400 dark:text-gray-500">
              <p className="text-sm font-medium mb-1">Metrics</p>
              <p className="text-xs opacity-75">Drop number column here</p>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-visible">
        <AggregationConfiguration
          availableColumns={availableColumns}
          groupBy={groupBy}
          metrics={metrics}
          onAggregationChange={onAggregationChange}
        />
      </div>
    </motion.div>
  );
};

export default AggregationTab;
