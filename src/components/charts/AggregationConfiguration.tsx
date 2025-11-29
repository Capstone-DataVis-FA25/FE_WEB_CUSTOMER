import React from 'react';
import { AggregationSummaryButton } from '@/pages/chart-creator/operations/aggregation/AggregationSummaryButton';
import type { GroupByColumn, AggregationMetric, DatasetColumnType } from '@/types/chart';
import { useTranslation } from 'react-i18next';

interface AggregationConfigurationProps {
  availableColumns: { id: string; name: string; type: DatasetColumnType; dateFormat?: string }[];
  groupBy: GroupByColumn[];
  metrics: AggregationMetric[];
  onAggregationChange: (groupBy: GroupByColumn[], metrics: AggregationMetric[]) => void;
}

const AggregationConfiguration: React.FC<AggregationConfigurationProps> = ({
  availableColumns,
  groupBy = [],
  metrics = [],
  onAggregationChange,
}) => {
  const { t } = useTranslation();

  // Ensure groupBy and metrics are arrays
  const safeGroupBy = Array.isArray(groupBy) ? groupBy : [];
  const safeMetrics = Array.isArray(metrics) ? metrics : [];

  const hasAggregation = safeGroupBy.length > 0 || safeMetrics.length > 0;

  return (
    <div className="mb-4">
      <AggregationSummaryButton
        availableColumns={availableColumns}
        initialGroupBy={safeGroupBy}
        initialMetrics={safeMetrics}
        onAggregationChange={onAggregationChange}
      />
    </div>
  );
};

export default AggregationConfiguration;
