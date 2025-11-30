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
    <div className="mb-4">
      <SortSummaryButton
        availableColumns={availableColumns}
        initialLevels={sortLevels}
        onSortChange={onSortChange}
      />
    </div>
  );
};

export default SortConfiguration;
