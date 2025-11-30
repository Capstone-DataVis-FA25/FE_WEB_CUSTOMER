'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, X } from 'lucide-react';
import { SortModal } from './SortModal';
import { ModalConfirm } from '@/components/ui/modal-confirm';
import type { SortLevel } from '@/types/chart';

interface SortSummaryButtonProps {
  availableColumns: {
    id: string;
    name: string;
    type?: 'text' | 'number' | 'date';
    dateFormat?: string;
  }[];
  onSortChange?: (levels: SortLevel[]) => void;
  initialLevels?: SortLevel[];
}

export const SortSummaryButton: React.FC<SortSummaryButtonProps> = ({
  availableColumns,
  onSortChange,
  initialLevels = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [levels, setLevels] = useState<SortLevel[]>(initialLevels);

  // Keep local state in sync with external config changes
  useEffect(() => {
    setLevels(initialLevels);
  }, [initialLevels]);

  const handleApplySort = (newLevels: SortLevel[]) => {
    setLevels(newLevels);
    onSortChange?.(newLevels);
  };

  const handleClearSort = () => {
    setLevels([]);
    onSortChange?.([]);
    setShowClearConfirm(false);
  };

  const sortCount = levels.length;
  const hasSort = sortCount > 0;

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          className={`gap-2 flex-1 ${hasSort ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-200' : 'bg-transparent'}`}
        >
          <ArrowUpDown className="w-4 h-4" />
          {hasSort ? `${sortCount} level${sortCount > 1 ? 's' : ''} sorted` : 'Add Sort'}
        </Button>

        {hasSort && (
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
        onConfirm={handleClearSort}
        title="Clear Sort"
        message="Are you sure you want to clear all sort settings? This action cannot be undone."
        confirmText="Clear"
        cancelText="Cancel"
        type="warning"
      />

      <SortModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onApply={handleApplySort}
        availableColumns={availableColumns}
        initialLevels={levels}
      />
    </>
  );
};

export default SortSummaryButton;
