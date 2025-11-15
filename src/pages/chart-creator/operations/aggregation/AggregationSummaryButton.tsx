'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, X } from 'lucide-react';
import {
  GroupByAggregationModal,
  type GroupByColumn,
  type AggregationMetric,
} from './GroupByAggregationModal';
import type { DatasetColumnType } from '@/types/chart';

interface AggregationSummaryButtonProps {
  availableColumns: { id: string; name: string; type: DatasetColumnType; dateFormat?: string }[];
  onAggregationChange?: (groupBy: GroupByColumn[], metrics: AggregationMetric[]) => void;
  initialGroupBy?: GroupByColumn[];
  initialMetrics?: AggregationMetric[];
}

export const AggregationSummaryButton: React.FC<AggregationSummaryButtonProps> = ({
  availableColumns,
  onAggregationChange,
  initialGroupBy = [],
  initialMetrics = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupByColumn[]>(initialGroupBy);
  const [metrics, setMetrics] = useState<AggregationMetric[]>(initialMetrics);

  // Keep local state in sync with external config changes
  useEffect(() => {
    setGroupBy(initialGroupBy);
    setMetrics(initialMetrics);
  }, [initialGroupBy, initialMetrics]);

  const handleApplyAggregation = (newGroupBy: GroupByColumn[], newMetrics: AggregationMetric[]) => {
    setGroupBy(newGroupBy);
    setMetrics(newMetrics);
    onAggregationChange?.(newGroupBy, newMetrics);
  };

  const handleClearAggregation = () => {
    setGroupBy([]);
    setMetrics([]);
    onAggregationChange?.([], []);
  };

  const hasAggregation = groupBy.length > 0 || metrics.length > 0;
  const summaryText = hasAggregation
    ? `${groupBy.length} dimension${groupBy.length !== 1 ? 's' : ''}, ${metrics.length} metric${metrics.length !== 1 ? 's' : ''}`
    : 'Add Aggregation';

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          className={`gap-2 flex-1 ${hasAggregation ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-200' : 'bg-transparent'}`}
        >
          <BarChart3 className="w-4 h-4" />
          {summaryText}
        </Button>

        {hasAggregation && (
          <Button
            onClick={handleClearAggregation}
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:ring-1 focus-visible:ring-red-500"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <GroupByAggregationModal
        open={isOpen}
        onOpenChange={setIsOpen}
        availableColumns={availableColumns.map(col => ({
          id: col.id,
          name: col.name,
          type: col.type,
          dateFormat: col.dateFormat,
        }))}
        onApply={handleApplyAggregation}
        initialGroupBy={groupBy}
        initialMetrics={metrics}
      />
    </>
  );
};

export default AggregationSummaryButton;
