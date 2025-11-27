import React from 'react';
import { SortSummaryButton } from '@/pages/chart-creator/operations/sort/SortSummaryButton';
import type { SortLevel, DatasetColumnType } from '@/types/chart';
import { useTranslation } from 'react-i18next';

interface SortConfigurationProps {
  availableColumns: { id: string; name: string; type: DatasetColumnType; dateFormat?: string }[];
  sortLevels: SortLevel[];
  onSortChange: (levels: SortLevel[]) => void;
}

const SortConfiguration: React.FC<SortConfigurationProps> = ({
  availableColumns,
  sortLevels,
  onSortChange,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
        {t('chart_editor_sort_configuration', 'Sort Configuration')}
      </div>
      <div className="mb-4">
        <SortSummaryButton
          availableColumns={availableColumns}
          initialLevels={sortLevels}
          onSortChange={onSortChange}
        />
        {sortLevels.length > 0 ? (
          <div className="mt-3 p-3 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-medium text-blue-900 dark:text-blue-200 mb-2">
              {t('chart_editor_applied_sort_order', 'Applied Sort Order')}
            </p>
            <div className="flex flex-wrap gap-1">
              {sortLevels.map((level, index) => {
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
            {t('chart_editor_no_configuration_applied', 'No configuration applied')}
          </p>
        )}
      </div>
    </>
  );
};

export default SortConfiguration;
