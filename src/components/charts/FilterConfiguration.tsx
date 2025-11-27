import React, { useCallback } from 'react';
import { FilterSummaryButton } from '@/pages/chart-creator/operations/filters/FilterSummaryButton';
import type { DatasetFilterColumn, DatasetFilterCondition, DatasetColumnType } from '@/types/chart';
import {
  humanizeOperator,
  getGranularityFromFormat,
  formatDateDisplay,
  formatNumberDisplay,
} from '@/utils/filterUtils';
import type { NumberFormat } from '@/contexts/DatasetContext';
import { useTranslation } from 'react-i18next';

interface FilterConfigurationProps {
  availableColumns: { id: string; name: string; type: DatasetColumnType; dateFormat?: string }[];
  filters: DatasetFilterColumn[];
  numberFormat?: NumberFormat;
  uniqueValuesByColumn: Record<string, string[]>;
  onFilterChange: (cols: DatasetFilterColumn[]) => void;
}

const FilterConfiguration: React.FC<FilterConfigurationProps> = ({
  availableColumns,
  filters,
  numberFormat,
  uniqueValuesByColumn,
  onFilterChange,
}) => {
  const { t } = useTranslation();

  const renderSingleValue = useCallback(
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

  const renderValueSummary = useCallback(
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
    <>
      <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
        {t('chart_editor_filter_configuration', 'Filter Configuration')}
      </div>
      <div className="mb-4">
        <FilterSummaryButton
          availableColumns={availableColumns}
          initialColumns={filters}
          numberFormat={numberFormat}
          uniqueValuesByColumn={uniqueValuesByColumn}
          onFilterChange={onFilterChange}
        />
        {filters.length > 0 ? (
          <div className="mt-3 p-3 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-medium text-blue-900 dark:text-blue-200 mb-2">
              {t('chart_editor_applied_filters', 'Applied Filters')}
            </p>
            <div className="space-y-2">
              {filters.map((col, idx) => {
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
                      <span key={cond.id || cidx} className="inline-flex items-center gap-1 mr-2">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
                          {humanizeOperator(cond.operator)}
                        </span>
                        {cond.operator === 'between' || cond.operator === 'between_exclusive' ? (
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
                          <span className="text-blue-700 dark:text-blue-300">AND</span>
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
            {t('chart_editor_no_configuration_applied', 'No configuration applied')}
          </p>
        )}
      </div>
    </>
  );
};

export default FilterConfiguration;
