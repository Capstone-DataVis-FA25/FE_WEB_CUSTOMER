import React from 'react';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';
import type {
  DatasetConfig,
  SortLevel,
  DatasetFilterColumn,
  DatasetColumnType,
  DatasetFilterCondition,
  GroupByColumn,
  AggregationMetric,
} from '@/types/chart';
import { FilterSummaryButton } from './filters/FilterSummaryButton';
import { SortSummaryButton } from './sort/SortSummaryButton';
import { AggregationSummaryButton } from './aggregation/AggregationSummaryButton';
import OperationsBanner from './OperationsBanner';
import {
  humanizeOperator,
  getGranularityFromFormat,
  formatDateDisplay,
  formatNumberDisplay,
} from '@/utils/filterUtils';
import type { NumberFormat } from '@/contexts/DatasetContext';

interface DataOperationsPanelProps {
  datasetName?: string;
  onOpenDatasetModal?: () => void;
  availableColumns?: { id: string; name: string; type: DatasetColumnType; dateFormat?: string }[];
  datasetConfig?: DatasetConfig;
  onDatasetConfigChange: (next?: DatasetConfig) => void;
  numberFormat?: NumberFormat;
  uniqueValuesByColumn?: Record<string, string[]>;
}

const DataOperationsPanel: React.FC<DataOperationsPanelProps> = ({
  datasetName,
  onOpenDatasetModal,
  availableColumns = [],
  datasetConfig,
  onDatasetConfigChange,
  numberFormat,
  uniqueValuesByColumn,
}) => {
  const renderSingleValue = React.useCallback(
    (col: DatasetFilterColumn, raw: string | number | null | undefined) => {
      const meta = availableColumns.find(c => c.id === col.columnId);
      if (raw == null || raw === '') return '(blank)';
      if (col.columnType === 'date') {
        return formatDateDisplay(
          getGranularityFromFormat(meta?.dateFormat),
          raw as any,
          meta?.dateFormat
        );
      }
      if (col.columnType === 'number') {
        return formatNumberDisplay(String(raw), numberFormat);
      }
      return String(raw);
    },
    [availableColumns, numberFormat]
  );

  const renderValueSummary = React.useCallback(
    (col: DatasetFilterColumn, cond: DatasetFilterCondition) => {
      if (Array.isArray(cond.value)) {
        if (cond.value.length === 0) return '(none selected)';
        const formatted = cond.value.map(v => renderSingleValue(col, v));
        if (formatted.length <= 3) return formatted.join(', ');
        return `${formatted.slice(0, 3).join(', ')}, +${formatted.length - 3} more`;
      }
      return renderSingleValue(col, cond.value as any);
    },
    [renderSingleValue]
  );

  return (
    <div className="h-full min-h-0 w-[480px] min-w-[480px] max-w-[480px] border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 overflow-y-auto hide-scrollbar select-none">
      <div className="mb-3 flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenDatasetModal}
          className="flex items-center gap-2 self-start"
        >
          <Database className="w-4 h-4" />
          Select Dataset
        </Button>
        <div className="flex flex-col gap-1">
          {datasetName ? (
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200 self-start max-w-[280px]"
              title={datasetName}
            >
              <Database className="w-3 h-3 shrink-0" />
              <span className="truncate max-w-[240px]">{datasetName}</span>
            </span>
          ) : (
            <span
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 self-start"
              title="No dataset selected"
            >
              No dataset selected
            </span>
          )}
        </div>
      </div>
      <div className="h-px bg-gray-200 dark:bg-gray-800 mb-3" />
      {!datasetName || availableColumns.length === 0 ? (
        <OperationsBanner
          title="Operations Disabled"
          message="Select a dataset to enable sort and other operations."
        />
      ) : (
        <>
          <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
            Filter Configuration
          </div>
          <div className="mb-4">
            <FilterSummaryButton
              availableColumns={availableColumns}
              initialColumns={(datasetConfig?.filters as unknown as DatasetFilterColumn[]) || []}
              numberFormat={numberFormat}
              uniqueValuesByColumn={uniqueValuesByColumn}
              onFilterChange={cols =>
                onDatasetConfigChange({
                  ...(datasetConfig || {}),
                  filters: cols.length ? (cols as any) : undefined,
                })
              }
            />
            {(datasetConfig?.filters?.length ?? 0) > 0 ? (
              <div className="mt-3 p-3 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-medium text-blue-900 dark:text-blue-200 mb-2">
                  Applied Filters
                </p>
                <div className="space-y-2">
                  {(datasetConfig?.filters as DatasetFilterColumn[]).map((col, idx) => {
                    const colLabel =
                      col.columnName ||
                      availableColumns.find(c => c.id === col.columnId)?.name ||
                      col.columnId;
                    return (
                      <div
                        key={`${col.id}-${idx}`}
                        className="text-xs text-blue-900 dark:text-blue-100"
                      >
                        <span className="font-semibold mr-1">{idx + 1}.</span>
                        <span className="font-medium mr-1">{colLabel}</span>
                        {(col.conditions || []).map((cond, cidx) => (
                          <span
                            key={cond.id || cidx}
                            className="inline-flex items-center gap-1 mr-2"
                          >
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
                              {humanizeOperator(cond.operator)}
                            </span>
                            {cond.operator === 'between' ? (
                              <span>
                                <span className="font-semibold">
                                  {renderSingleValue(col, cond.value as any)}
                                </span>
                                <span className="mx-1">and</span>
                                <span className="font-semibold">
                                  {renderSingleValue(col, cond.valueEnd as any)}
                                </span>
                              </span>
                            ) : (
                              <span className="font-semibold">{renderValueSummary(col, cond)}</span>
                            )}
                            {cidx < (col.conditions?.length || 0) - 1 && (
                              <span className="text-blue-700 dark:text-blue-300">OR</span>
                            )}
                          </span>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                No configuration applied
              </p>
            )}
          </div>

          <div className="my-4 border-t border-gray-200 dark:border-gray-700" />

          <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
            Sort Configuration
          </div>
          <div className="mb-4">
            <SortSummaryButton
              availableColumns={availableColumns}
              initialLevels={datasetConfig?.sort ?? []}
              onSortChange={(levels: SortLevel[]) =>
                onDatasetConfigChange({
                  ...(datasetConfig || {}),
                  sort: levels.length ? levels : undefined,
                })
              }
            />
            {(datasetConfig?.sort?.length ?? 0) > 0 ? (
              <div className="mt-3 p-3 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-medium text-blue-900 dark:text-blue-200 mb-2">
                  Applied Sort Order
                </p>
                <div className="flex flex-wrap gap-1">
                  {(datasetConfig?.sort || []).map((level, index) => {
                    const columnName =
                      availableColumns.find(c => c.id === level.columnId)?.name || level.columnId;
                    return (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border border-blue-200 dark:border-blue-700 text-blue-900 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/40"
                      >
                        <span className="font-semibold">{index + 1}.</span>
                        <span>{columnName}</span>
                        <span className="font-mono text-blue-700 dark:text-blue-300">
                          {level.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                No configuration applied
              </p>
            )}
          </div>

          <div className="my-4 border-t border-gray-200 dark:border-gray-700" />

          <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
            Aggregation Configuration
          </div>
          <div className="mb-4">
            <AggregationSummaryButton
              availableColumns={availableColumns}
              initialGroupBy={datasetConfig?.aggregation?.groupBy || []}
              initialMetrics={datasetConfig?.aggregation?.metrics || []}
              onAggregationChange={(groupBy, metrics) =>
                onDatasetConfigChange({
                  ...(datasetConfig || {}),
                  aggregation:
                    groupBy.length > 0 || metrics.length > 0 ? { groupBy, metrics } : undefined,
                })
              }
            />
            {(datasetConfig?.aggregation?.groupBy?.length ?? 0) > 0 ||
            (datasetConfig?.aggregation?.metrics?.length ?? 0) > 0 ? (
              <div className="mt-3 p-3 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-medium text-blue-900 dark:text-blue-200 mb-2">
                  Applied Aggregation
                </p>
                <div className="space-y-2">
                  {(datasetConfig?.aggregation?.groupBy?.length ?? 0) > 0 && (
                    <div className="text-xs text-blue-900 dark:text-blue-100">
                      <span className="font-semibold mr-1">Group By:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(datasetConfig?.aggregation?.groupBy || []).map(
                          (gb: GroupByColumn, idx: number) => {
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
                          }
                        )}
                      </div>
                    </div>
                  )}
                  {(datasetConfig?.aggregation?.metrics?.length ?? 0) > 0 && (
                    <div className="text-xs text-blue-900 dark:text-blue-100">
                      <span className="font-semibold mr-1">Metrics:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(datasetConfig?.aggregation?.metrics || []).map(
                          (metric: AggregationMetric, idx: number) => (
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
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                No configuration applied
              </p>
            )}
          </div>
        </>
      )}

      <div className="h-px bg-gray-200 dark:bg-gray-800 my-4" />
      <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">
        Other Operations
      </div>
      <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4 text-sm text-gray-600 dark:text-gray-300">
        Additional operations coming soon...
      </div>
    </div>
  );
};

export default DataOperationsPanel;
