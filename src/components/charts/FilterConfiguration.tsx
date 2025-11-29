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
    <div className="mb-4">
      <FilterSummaryButton
        availableColumns={availableColumns}
        initialColumns={filters}
        numberFormat={numberFormat}
        uniqueValuesByColumn={uniqueValuesByColumn}
        onFilterChange={onFilterChange}
      />
    </div>
  );
};

export default FilterConfiguration;
