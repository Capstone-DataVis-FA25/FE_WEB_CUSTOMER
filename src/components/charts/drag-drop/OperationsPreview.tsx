import React, { useMemo } from 'react';
import { Filter, ArrowUpDown, Layers, Table2 } from 'lucide-react';
import type {
  DatasetFilterColumn,
  SortLevel,
  GroupByColumn,
  AggregationMetric,
  DatasetColumnType,
  PivotDimension,
  PivotValue,
} from '@/types/chart';
import {
  getGranularityFromFormat,
  formatDateDisplay,
  formatNumberDisplay,
  getOperatorLabelLower,
} from '@/utils/filterUtils';
import type { NumberFormat } from '@/contexts/DatasetContext';
import { useTranslation } from 'react-i18next';

interface OperationsPreviewProps {
  availableColumns: { id: string; name: string; type: DatasetColumnType; dateFormat?: string }[];
  filters: DatasetFilterColumn[];
  sortLevels: SortLevel[];
  groupBy: GroupByColumn[];
  metrics: AggregationMetric[];
  pivotRows?: PivotDimension[];
  pivotColumns?: PivotDimension[];
  pivotValues?: PivotValue[];
  pivotFilters?: PivotDimension[];
  numberFormat?: NumberFormat;
}

const OperationsPreview: React.FC<OperationsPreviewProps> = ({
  availableColumns,
  filters,
  sortLevels,
  groupBy,
  metrics,
  pivotRows,
  pivotColumns,
  pivotValues,
  pivotFilters,
  numberFormat,
}) => {
  const { t } = useTranslation();

  const renderSingleValue = (col: DatasetFilterColumn, raw: string | number | null | undefined) => {
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
  };

  const renderValueSummary = (col: DatasetFilterColumn, cond: any) => {
    if (Array.isArray(cond.value)) {
      if (cond.value.length === 0) return '(none selected)';
      const formatted = cond.value.map((v: any) => renderSingleValue(col, v));
      if (formatted.length <= 2) return formatted.join(', ');
      return `${formatted.slice(0, 2).join(', ')}, +${formatted.length - 2} more`;
    }
    return renderSingleValue(col, cond.value as any);
  };

  const hasAnyOperation = useMemo(() => {
    return (
      (filters?.length ?? 0) > 0 ||
      (sortLevels?.length ?? 0) > 0 ||
      (groupBy?.length ?? 0) > 0 ||
      (metrics?.length ?? 0) > 0 ||
      (pivotRows?.length ?? 0) > 0 ||
      (pivotColumns?.length ?? 0) > 0 ||
      (pivotValues?.length ?? 0) > 0 ||
      (pivotFilters?.length ?? 0) > 0
    );
  }, [filters, sortLevels, groupBy, metrics, pivotRows, pivotColumns, pivotValues, pivotFilters]);

  if (!hasAnyOperation) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
        No operations applied yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filters Preview */}
      {(filters?.length ?? 0) > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <Filter className="w-4 h-4 text-blue-500" />
            <span>Filters ({filters.length})</span>
          </div>
          <div className="space-y-1 pl-5">
            {filters.map((col, idx) => {
              const colLabel =
                col.columnName ||
                availableColumns.find(c => c.id === col.columnId)?.name ||
                col.columnId;
              return (
                <div key={`${col.id}-${idx}`} className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{colLabel}:</span>{' '}
                  {(col.conditions || []).map((cond, cidx) => (
                    <span key={cond.id || cidx} className="inline-flex items-center gap-1">
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs">
                        {getOperatorLabelLower(col.columnType, cond.operator)}
                      </span>
                      {cond.operator === 'between' || cond.operator === 'between_exclusive' ? (
                        <span className="text-xs">
                          {renderSingleValue(col, cond.value as any)} -{' '}
                          {renderSingleValue(col, cond.valueEnd as any)}
                        </span>
                      ) : (
                        <span className="text-xs">{renderValueSummary(col, cond)}</span>
                      )}
                      {cidx < (col.conditions?.length || 0) - 1 && (
                        <span className="text-xs text-gray-500">AND</span>
                      )}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sort Preview */}
      {(sortLevels?.length ?? 0) > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <ArrowUpDown className="w-4 h-4 text-green-500" />
            <span>Sort ({sortLevels.length} levels)</span>
          </div>
          <div className="flex flex-wrap gap-1 pl-5">
            {sortLevels.map((level, index) => {
              const columnName =
                availableColumns.find(c => c.id === level.columnId)?.name || level.columnId;
              return (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30"
                >
                  <span>{index + 1}.</span>
                  <span>{columnName}</span>
                  <span className="font-mono">{level.direction === 'asc' ? '↑' : '↓'}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Aggregation Preview */}
      {((groupBy?.length ?? 0) > 0 || (metrics?.length ?? 0) > 0) && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <Layers className="w-4 h-4 text-purple-500" />
            <span>Aggregation</span>
          </div>
          <div className="space-y-1 pl-5">
            {(groupBy?.length ?? 0) > 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Group By:</span>{' '}
                <span className="text-xs">
                  {groupBy
                    .map(
                      gb =>
                        `${availableColumns.find(c => c.id === gb.id)?.name || gb.name}${
                          gb.timeUnit ? ` (${gb.timeUnit})` : ''
                        }`
                    )
                    .join(', ')}
                </span>
              </div>
            )}
            {(metrics?.length ?? 0) > 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Metrics:</span>{' '}
                <span className="text-xs">
                  {metrics
                    .map(m => `${m.alias || `${m.type}(${m.columnId || 'count'})`} (${m.type})`)
                    .join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pivot Table Preview */}
      {((pivotRows?.length ?? 0) > 0 ||
        (pivotColumns?.length ?? 0) > 0 ||
        (pivotValues?.length ?? 0) > 0 ||
        (pivotFilters?.length ?? 0) > 0) && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <Table2 className="w-4 h-4 text-amber-500" />
            <span>Pivot Table</span>
          </div>
          <div className="space-y-1 pl-5">
            {(pivotRows?.length ?? 0) > 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Rows:</span>{' '}
                <span className="text-xs">
                  {pivotRows
                    .map(
                      row =>
                        `${availableColumns.find(c => c.id === row.columnId)?.name || row.name}${
                          row.timeUnit ? ` (${row.timeUnit})` : ''
                        }`
                    )
                    .join(', ')}
                </span>
              </div>
            )}
            {(pivotColumns?.length ?? 0) > 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Columns:</span>{' '}
                <span className="text-xs">
                  {pivotColumns
                    .map(
                      col =>
                        `${availableColumns.find(c => c.id === col.columnId)?.name || col.name}${
                          col.timeUnit ? ` (${col.timeUnit})` : ''
                        }`
                    )
                    .join(', ')}
                </span>
              </div>
            )}
            {(pivotValues?.length ?? 0) > 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Values:</span>{' '}
                <span className="text-xs">
                  {pivotValues
                    .map(value => {
                      const columnName =
                        availableColumns.find(c => c.id === value.columnId)?.name || value.name;
                      const operationLabel =
                        value.aggregationType === 'count'
                          ? 'Count'
                          : value.aggregationType.charAt(0).toUpperCase() +
                            value.aggregationType.slice(1);
                      return `${operationLabel} of ${columnName}`;
                    })
                    .join(', ')}
                </span>
              </div>
            )}
            {(pivotFilters?.length ?? 0) > 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Filters:</span>{' '}
                <span className="text-xs">
                  {pivotFilters
                    .map(
                      filter =>
                        `${availableColumns.find(c => c.id === filter.columnId)?.name || filter.name}${
                          filter.timeUnit ? ` (${filter.timeUnit})` : ''
                        }`
                    )
                    .join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationsPreview;
