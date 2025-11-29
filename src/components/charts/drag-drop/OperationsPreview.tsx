import React, { useMemo } from 'react';
import { Filter, ArrowUpDown, Layers } from 'lucide-react';
import type {
  DatasetFilterColumn,
  SortLevel,
  GroupByColumn,
  AggregationMetric,
  DatasetColumnType,
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
  numberFormat?: NumberFormat;
}

const OperationsPreview: React.FC<OperationsPreviewProps> = ({
  availableColumns,
  filters,
  sortLevels,
  groupBy,
  metrics,
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
      (metrics?.length ?? 0) > 0
    );
  }, [filters, sortLevels, groupBy, metrics]);

  if (!hasAnyOperation) {
    return (
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
        No operations applied yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filters Preview */}
      {(filters?.length ?? 0) > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <Filter className="w-3.5 h-3.5 text-blue-500" />
            <span>Filters ({filters.length})</span>
          </div>
          <div className="space-y-1 pl-5">
            {filters.map((col, idx) => {
              const colLabel =
                col.columnName ||
                availableColumns.find(c => c.id === col.columnId)?.name ||
                col.columnId;
              return (
                <div key={`${col.id}-${idx}`} className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{colLabel}:</span>{' '}
                  {(col.conditions || []).map((cond, cidx) => (
                    <span key={cond.id || cidx} className="inline-flex items-center gap-1">
                      <span className="px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px]">
                        {getOperatorLabelLower(col.columnType, cond.operator)}
                      </span>
                      {cond.operator === 'between' || cond.operator === 'between_exclusive' ? (
                        <span className="text-[10px]">
                          {renderSingleValue(col, cond.value as any)} -{' '}
                          {renderSingleValue(col, cond.valueEnd as any)}
                        </span>
                      ) : (
                        <span className="text-[10px]">{renderValueSummary(col, cond)}</span>
                      )}
                      {cidx < (col.conditions?.length || 0) - 1 && (
                        <span className="text-[10px] text-gray-500">AND</span>
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
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-green-500" />
            <span>Sort ({sortLevels.length} levels)</span>
          </div>
          <div className="flex flex-wrap gap-1 pl-5">
            {sortLevels.map((level, index) => {
              const columnName =
                availableColumns.find(c => c.id === level.columnId)?.name || level.columnId;
              return (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30"
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
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <Layers className="w-3.5 h-3.5 text-purple-500" />
            <span>Aggregation</span>
          </div>
          <div className="space-y-1 pl-5">
            {(groupBy?.length ?? 0) > 0 && (
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <span className="font-medium">Group By:</span>{' '}
                <span className="text-[10px]">
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
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <span className="font-medium">Metrics:</span>{' '}
                <span className="text-[10px]">
                  {metrics
                    .map(m => `${m.alias || `${m.type}(${m.columnId || 'count'})`} (${m.type})`)
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
