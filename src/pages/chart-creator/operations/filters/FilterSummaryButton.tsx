'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { FilterIcon, X } from 'lucide-react';
import { FilterModal } from './FilterModal';
import { ModalConfirm } from '@/components/ui/modal-confirm';
import type { NumberFormat } from '@/contexts/DatasetContext';
import type { DatasetFilterColumn, DatasetColumnType } from '@/types/chart';

interface FilterSummaryButtonProps {
  availableColumns: { id: string; name: string; type: DatasetColumnType; dateFormat?: string }[];
  onFilterChange?: (columns: DatasetFilterColumn[]) => void;
  initialColumns?: DatasetFilterColumn[];
  numberFormat?: NumberFormat;
  uniqueValuesByColumn?: Record<string, string[]>;
}

export const FilterSummaryButton: React.FC<FilterSummaryButtonProps> = ({
  availableColumns,
  onFilterChange,
  initialColumns = [],
  numberFormat,
  uniqueValuesByColumn,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [filters, setFilters] = useState<DatasetFilterColumn[]>(initialColumns);

  // Keep local state in sync with external config changes
  useEffect(() => {
    setFilters(initialColumns);
  }, [initialColumns]);

  const handleApplyFilter = (columns: DatasetFilterColumn[]) => {
    setFilters(columns);
    onFilterChange?.(columns);
  };

  const handleClearFilters = () => {
    setFilters([]);
    onFilterChange?.([]);
    setShowClearConfirm(false);
  };

  const filterCount = filters.length;
  const hasFilters = filterCount > 0;

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={() => {
            // Modal disabled: keep button visual but do nothing on click
          }}
          variant="outline"
          className={`gap-2 flex-1 ${hasFilters ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-200' : 'bg-transparent'}`}
        >
          <FilterIcon className="w-4 h-4" />
          {hasFilters ? `${filterCount} filter${filterCount > 1 ? 's' : ''} applied` : 'Add Filter'}
        </Button>

        {hasFilters && (
          <Button
            onClick={() => setShowClearConfirm(true)}
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:ring-1 focus-visible:ring-red-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <ModalConfirm
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearFilters}
        title={t('operations.clearFilters', 'Clear Filters')}
        message="Are you sure you want to clear all filter settings? This action cannot be undone."
        confirmText="Clear"
        cancelText="Cancel"
        type="warning"
      />

      <FilterModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onApply={handleApplyFilter}
        availableColumns={availableColumns}
        initialColumns={filters}
        numberFormat={numberFormat}
        uniqueValuesByColumn={uniqueValuesByColumn}
      />
    </>
  );
};

export default FilterSummaryButton;
