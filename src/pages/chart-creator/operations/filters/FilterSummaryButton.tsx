'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FilterIcon, X } from 'lucide-react';
import { FilterModal } from './FilterModal';
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
  const [isOpen, setIsOpen] = useState(false);
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
  };

  const filterCount = filters.length;
  const hasFilters = filterCount > 0;

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          className={`gap-2 flex-1 ${hasFilters ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-200' : 'bg-transparent'}`}
        >
          <FilterIcon className="w-4 h-4" />
          {hasFilters ? `${filterCount} filter${filterCount > 1 ? 's' : ''} applied` : 'Add Filter'}
        </Button>

        {hasFilters && (
          <Button
            onClick={handleClearFilters}
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:ring-1 focus-visible:ring-red-500"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

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
