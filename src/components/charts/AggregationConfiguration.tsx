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
  groupBy,
  metrics,
  onAggregationChange,
}) => {
  const { t } = useTranslation();

  const hasAggregation = groupBy.length > 0 || metrics.length > 0;

  return (
    <>
      <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
        {t('chart_editor_aggregation_configuration', 'Aggregation Configuration')}
      </div>
      <div className="mb-4">
        <AggregationSummaryButton
          availableColumns={availableColumns}
          initialGroupBy={groupBy}
          initialMetrics={metrics}
          onAggregationChange={onAggregationChange}
        />
        {hasAggregation ? (
          <div className="mt-3 p-3 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-medium text-blue-900 dark:text-blue-200 mb-2">
              {t('chart_editor_applied_aggregation', 'Applied Aggregation')}
            </p>
            <div className="space-y-2">
              {groupBy.length > 0 && (
                <div className="text-xs text-blue-900 dark:text-blue-100">
                  <span className="font-semibold mr-1">
                    {t('chart_editor_group_by', 'Group By')}:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {groupBy.map((gb, idx) => {
                      const columnName =
                        availableColumns.find(c => c.id === gb.id)?.name || gb.name;
                      return (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border border-blue-200 dark:border-blue-700 text-blue-900 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/40"
                        >
                          <span>{columnName}</span>
                          {gb.timeUnit && (
                            <span className="text-blue-700 dark:text-blue-300 text-[10px]">
                              ({gb.timeUnit})
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              {metrics.length > 0 && (
                <div className="text-xs text-blue-900 dark:text-blue-100">
                  <span className="font-semibold mr-1">
                    {t('chart_editor_metrics', 'Metrics')}:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {metrics.map((metric, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border border-blue-200 dark:border-blue-700 text-blue-900 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/40"
                      >
                        <span>
                          {metric.alias || `${metric.type}(${metric.columnId || 'count'})`}
                        </span>
                        <span className="text-blue-700 dark:text-blue-300 text-[10px]">
                          ({metric.type})
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            {t('chart_editor_no_configuration_applied', 'No configuration applied')}
          </p>
        )}
      </div>
    </>
  );
};

export default AggregationConfiguration;
